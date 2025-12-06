import { SavedProject, AnalysisResult, StrategyResult } from '../types';

const PROJECTS_KEY = 'rankforge_saved_projects';

const getProjects = (): SavedProject[] => {
  const data = localStorage.getItem(PROJECTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveProjects = (projects: SavedProject[]) => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

export const projectService = {
  // Get all projects for a user
  getUserProjects: (userId: string): SavedProject[] => {
    return getProjects().filter(p => p.userId === userId);
  },

  // Get a single project by ID
  getProject: (projectId: string): SavedProject | null => {
    return getProjects().find(p => p.id === projectId) || null;
  },

  // Save a new project or update existing
  saveProject: (
    userId: string,
    domain: string,
    niche: string,
    analysis: AnalysisResult,
    strategy?: StrategyResult,
    existingId?: string
  ): SavedProject => {
    const projects = getProjects();
    const now = new Date().toISOString();

    if (existingId) {
      // Update existing project
      const index = projects.findIndex(p => p.id === existingId);
      if (index !== -1) {
        projects[index] = {
          ...projects[index],
          analysis,
          strategy,
          updatedAt: now,
        };
        saveProjects(projects);
        return projects[index];
      }
    }

    // Create new project
    const newProject: SavedProject = {
      id: crypto.randomUUID(),
      userId,
      domain,
      niche,
      createdAt: now,
      updatedAt: now,
      analysis,
      strategy,
    };

    projects.unshift(newProject); // Add to beginning
    saveProjects(projects);
    return newProject;
  },

  // Update strategy for a project
  updateStrategy: (projectId: string, strategy: StrategyResult): SavedProject | null => {
    const projects = getProjects();
    const index = projects.findIndex(p => p.id === projectId);
    
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      strategy,
      updatedAt: new Date().toISOString(),
    };
    
    saveProjects(projects);
    return projects[index];
  },

  // Delete a project
  deleteProject: (projectId: string): boolean => {
    const projects = getProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    
    if (filtered.length === projects.length) return false;
    
    saveProjects(filtered);
    return true;
  },
};
