
import { supabase, supabaseUrl, supabaseKey } from './supabaseClient';
import { Project } from '../types';

// Map database column names (snake_case) to application types (camelCase)
const IB_SEPARATOR = '\n\n---IB_DATA---\n';
const META_SEPARATOR = '\n\n---META_DATA---\n';

const mapFromDB = (row: any): Project => {
  let description = row.description || '';
  let interactiveBuilding = undefined;
  let deletedAt = undefined;
  let coordinates = undefined;
  
  if (description.includes(META_SEPARATOR)) {
    const parts = description.split(META_SEPARATOR);
    description = parts[0];
    try {
      const meta = JSON.parse(parts[1]);
      deletedAt = meta.deletedAt;
      coordinates = meta.coordinates;
    } catch(e) {
      console.error('Failed to parse meta data', e);
    }
  }

  if (description.includes(IB_SEPARATOR)) {
    const parts = description.split(IB_SEPARATOR);
    description = parts[0];
    try {
      interactiveBuilding = JSON.parse(parts[1]);
    } catch(e) {
      console.error('Failed to parse interactive building data', e);
    }
  }

  return {
    id: row.id,
    name: row.name,
    clientName: row.client_name,
    location: row.location,
    thumbnailUrl: row.thumbnail_url,
    accessCode: row.access_code,
    description: description,
    updates: row.updates || [],
    interactiveBuilding: interactiveBuilding,
    deletedAt: deletedAt,
    coordinates: coordinates,
  };
};

const mapToDB = (project: Project) => {
  let description = project.description || '';
  if (project.interactiveBuilding) {
    description += IB_SEPARATOR + JSON.stringify(project.interactiveBuilding);
  }
  
  let meta: any = {};
  if (project.deletedAt) meta.deletedAt = project.deletedAt;
  if (project.coordinates) meta.coordinates = project.coordinates;
  if (Object.keys(meta).length > 0) {
    description += META_SEPARATOR + JSON.stringify(meta);
  }

  return {
    id: project.id,
    name: project.name,
    client_name: project.clientName,
    location: project.location,
    thumbnail_url: project.thumbnailUrl,
    access_code: project.accessCode,
    description: description,
    updates: project.updates,
  };
};

export const dbService = {
  // Subscribe to Realtime Changes
  subscribeProjects(callback: (projects: Project[]) => void) {
    // 1. Fetch initial data
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        callback([]); // Return empty list on error to stop loading spinner
        return;
      }
      
      const mappedProjects = (data || []).map(mapFromDB);
      
      // Cleanup binned projects older than 30 days
      const now = new Date().getTime();
      mappedProjects.forEach(p => {
        if (p.deletedAt) {
          const binnedDate = new Date(p.deletedAt).getTime();
          if (now - binnedDate > 30 * 24 * 60 * 60 * 1000) {
            // Delete permanently (fire and forget)
            dbService.deleteProject(p.id).catch(console.error);
          }
        }
      });

      callback(mappedProjects);
    };

    fetchProjects();

    // 2. Listen for changes
    const channel = supabase
      .channel('public:projects')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          fetchProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async addProject(project: Project): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .insert(mapToDB(project));

    if (error) throw error;
  },

  async updateProject(project: Project): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .update(mapToDB(project))
      .eq('id', project.id);

    if (error) throw error;
  },

  async deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  },

  async uploadFile(file: File, projectId: string, onProgress?: (percent: number) => void): Promise<string> {
    const fileExt = file.name.split('.').pop();
    // Sanitize filename to ensure no weird chars cause issues
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${projectId}/${fileName}`;
    const bucket = 'project-media';

    // We use the official Supabase SDK upload method which handles large files/videos much better 
    // than a custom XMLHttpRequest.
    
    // Note: The standard SDK upload() method does not emit granular progress events.
    // We simulate progress to keep the UI responsive for the user during the upload.
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
        // Increment progress slowly up to 90%
        if (currentProgress < 90) {
            // Slower increment for larger files roughly approximated
            currentProgress += (file.size > 10 * 1024 * 1024) ? 2 : 5; 
            if (onProgress) onProgress(currentProgress);
        }
    }, 500);

    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type // Explicitly set content type to avoid detection issues
            });

        clearInterval(progressInterval);

        if (error) {
            console.error('Supabase Upload Error:', error);
            throw error;
        }

        // Complete the progress bar
        if (onProgress) onProgress(100);

        const { data: publicData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicData.publicUrl;

    } catch (e) {
        clearInterval(progressInterval);
        console.error("Upload exception:", e);
        throw e;
    }
  }
};
