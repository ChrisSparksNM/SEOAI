import React from 'react';
import { Folder, Trash2, Clock, FileText, MessageSquare } from 'lucide-react';
import { SavedProject } from '../types';

interface SavedProjectsProps {
  projects: SavedProject[];
  onLoad: (project: SavedProject) => void;
  onDelete: (projectId: string) => void;
}

export const SavedProjects: React.FC<SavedProjectsProps> = ({ projects, onLoad, onDelete }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Folder size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No saved projects yet</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const getContentCount = (project: SavedProject) => {
    if (!project.strategy) return 0;
    return project.strategy.briefs.filter(b => 
      b.htmlContent || b.xThreadContent || b.linkedInContent
    ).length;
  };

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div
          key={project.id}
          className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <div className="flex items-start justify-between">
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => onLoad(project)}
            >
              <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                {project.domain}
              </h4>
              <p className="text-sm text-slate-500 mt-0.5">{project.niche}</p>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatDate(project.updatedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={12} />
                  {project.strategy?.briefs.length || 0} briefs
                </span>
                {getContentCount(project) > 0 && (
                  <span className="flex items-center gap-1 text-green-600">
                    <MessageSquare size={12} />
                    {getContentCount(project)} generated
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Delete this project?')) {
                  onDelete(project.id);
                }
              }}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
