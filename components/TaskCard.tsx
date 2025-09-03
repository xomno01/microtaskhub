
import React from 'react';
import { Task, TaskType } from '../types';
import { DollarSignIcon } from './Icons';

interface TaskCardProps {
  task: Task;
  onSelectTask: (task: Task) => void;
}

// FIX: Added all enum members to the map and corrected SOCIAL_MEDIA to SOCIAL_MEDIA_SHARE.
const typeColorMap: Record<TaskType, string> = {
  [TaskType.SURVEY]: 'bg-blue-100 text-blue-800',
  [TaskType.DATA_ENTRY]: 'bg-purple-100 text-purple-800',
  [TaskType.SOCIAL_MEDIA_SHARE]: 'bg-pink-100 text-pink-800',
  [TaskType.APP_TESTING]: 'bg-indigo-100 text-indigo-800',
  [TaskType.CONTENT_CREATION]: 'bg-teal-100 text-teal-800',
  [TaskType.FEEDBACK]: 'bg-amber-100 text-amber-800',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelectTask }) => {
  const completionPercentage = (task.completionsDone / task.completionsNeeded) * 100;

  return (
    <div className="bg-brand-surface rounded-xl shadow-md border border-gray-200/80 p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColorMap[task.type]}`}>{task.type}</span>
        <div className="flex items-center gap-1 text-green-600 font-bold">
            <DollarSignIcon className="w-5 h-5" />
            <span className="text-lg">{task.reward.toFixed(2)}</span>
        </div>
      </div>
      <h3 className="text-lg font-bold text-brand-text mb-2 flex-grow">{task.title}</h3>
      <p className="text-sm text-brand-secondary mb-4">by {task.project.name}</p>

      <div>
        <div className="flex justify-between text-xs text-brand-secondary mb-1">
          <span>Progress</span>
          <span>{task.completionsDone} / {task.completionsNeeded}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-brand-primary h-2 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
        </div>
      </div>

      <button onClick={() => onSelectTask(task)} className="mt-6 w-full bg-white text-brand-primary border border-brand-primary font-semibold py-2 px-4 rounded-lg hover:bg-brand-bg transition-colors duration-300">
        View Details
      </button>
    </div>
  );
};