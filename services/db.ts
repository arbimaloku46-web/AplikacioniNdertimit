
import { supabase, supabaseUrl, supabaseKey } from './supabaseClient';
import { Project } from '../types';

// Map database column names (snake_case) to application types (camelCase)
const mapFromDB = (row: any): Project => ({
  id: row.id,
  name: row.name,
  clientName: row.client_name,
  location: row.location,
  thumbnailUrl: row.thumbnail_url,
  accessCode: row.access_code,
  description: row.description,
  updates: row.updates || []
});

const mapToDB = (project: Project) => ({
  id: project.id,
  name: project.name,
  client_name: project.clientName,
  location: project.location,
  thumbnail_url: project.thumbnailUrl,
  access_code: project.accessCode,
  description: project.description,
  updates: project.updates // JSONB column handles the array structure automatically
});

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
      
      callback((data || []).map(mapFromDB));
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
