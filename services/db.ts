
import { supabase } from './supabaseClient';
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

  async uploadFile(file: File, projectId: string): Promise<string> {
    // 1. Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${projectId}/${fileName}`;

    // 2. Upload to Supabase Storage bucket 'project-media'
    const { error: uploadError } = await supabase.storage
      .from('project-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 3. Get the Public URL
    const { data } = supabase.storage
      .from('project-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
