import React, { useState } from 'react';
import { Task, User, TaskType, SubmissionProof } from '../types';
import { DollarSignIcon, XIcon, LinkIcon, TextIcon, CameraIcon } from './Icons';

interface TaskDetailModalProps {
  task: Task;
  user: User;
  onClose: () => void;
  onTaskSubmit: (taskId: string, proof: SubmissionProof) => void;
  isSubmitting: boolean;
}

const typeColorMap: Record<TaskType, string> = {
  [TaskType.SURVEY]: 'bg-blue-100 text-blue-800',
  [TaskType.DATA_ENTRY]: 'bg-purple-100 text-purple-800',
  [TaskType.SOCIAL_MEDIA_SHARE]: 'bg-pink-100 text-pink-800',
  [TaskType.APP_TESTING]: 'bg-indigo-100 text-indigo-800',
  [TaskType.CONTENT_CREATION]: 'bg-teal-100 text-teal-800',
  [TaskType.FEEDBACK]: 'bg-amber-100 text-amber-800',
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, user, onClose, onTaskSubmit, isSubmitting }) => {
  const [proofText, setProofText] = useState('');
  const [proofLink, setProofLink] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null); // For simulation
  const [error, setError] = useState('');

  const completionPercentage = (task.completionsDone / task.completionsNeeded) * 100;
  const isCompletedByUser = user.completedTaskIds.includes(task.id);
  const isSubmittedByUser = user.submittedTaskIds.includes(task.id);
  const isWorker = user.role === 'USER';
  
  const getButtonState = () => {
      if (!isWorker) return { disabled: true, text: "Only Workers can complete tasks" };
      if (isCompletedByUser) return { disabled: true, text: "Task Approved" };
      if (isSubmittedByUser) return { disabled: true, text: "Task Pending Review" };
      if (isSubmitting) return { disabled: true, text: "Verifying..." };
      return { disabled: false, text: "Submit for Review" };
  }
  
  const buttonState = getButtonState();

  const handleSubmit = () => {
      setError('');
      let proof: SubmissionProof = {};
      switch (task.proofType) {
          case 'text':
              if(!proofText.trim()) { setError('Text proof cannot be empty.'); return; }
              proof = { text: proofText };
              break;
          case 'link':
              if(!proofLink.trim() || !proofLink.startsWith('http')) { setError('Please provide a valid link.'); return; }
              proof = { link: proofLink };
              break;
          case 'image':
              if(!proofImage) { setError('Please select an image to upload.'); return; }
              // In a real app, we'd upload this and get a URL. We'll simulate it.
              proof = { imageUrl: `https://fake-cdn.com/${proofImage.name}` };
              break;
      }
      onTaskSubmit(task.id, proof);
  }

  const renderProofInput = () => {
    switch (task.proofType) {
      case 'text':
        return (
          <div className="space-y-2">
              <label className="text-sm font-medium text-brand-secondary flex items-center gap-2"><TextIcon className="w-5 h-5"/> {task.proofQuestion}</label>
              <textarea 
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                rows={4} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
                placeholder="Provide your detailed response here..."
              />
          </div>
        );
      case 'link':
         return (
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-secondary flex items-center gap-2"><LinkIcon className="w-5 h-5"/> {task.proofQuestion}</label>
              <input 
                type="url"
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
                placeholder="https://..."
              />
            </div>
         );
      case 'image':
        return (
           <div className="space-y-2">
              <label className="text-sm font-medium text-brand-secondary flex items-center gap-2"><CameraIcon className="w-5 h-5"/> {task.proofQuestion}</label>
              <div className="mt-2 flex justify-center items-center w-full px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-primary hover:text-brand-primary-dark focus-within:outline-none">
                            <span>{proofImage ? proofImage.name : 'Select a file'}</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => e.target.files && setProofImage(e.target.files[0])} accept="image/*" />
                        </label>
                         {!proofImage && <p className="pl-1">or drag and drop</p>}
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB (Simulated)</p>
                </div>
              </div>
            </div>
        );
      default:
        return <p className="text-red-500">Error: Unknown proof type for this task.</p>;
    }
  }


  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-brand-surface rounded-xl shadow-2xl border border-gray-200/80 w-full max-w-2xl p-6 md:p-8 flex flex-col relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-secondary hover:text-brand-text transition-colors" aria-label="Close dialog">
            <XIcon className="w-6 h-6" />
        </button>

        <div className="flex justify-between items-start mb-4">
            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${typeColorMap[task.type]}`}>{task.type.replace(/_/g, ' ')}</span>
            <div className="flex items-center gap-2 text-green-600 font-bold">
                <DollarSignIcon className="w-7 h-7" />
                <span className="text-2xl">{task.reward.toFixed(2)}</span>
            </div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-brand-text mb-2">{task.title}</h2>
        <p className="text-md text-brand-secondary mb-6">by {task.project.name}</p>

        <div className="max-h-32 overflow-y-auto pr-3 mb-6">
            <p className="text-brand-text text-base">{task.description}</p>
        </div>

        {/* --- Proof Submission Form --- */}
        {!buttonState.disabled && (
          <div className="bg-gray-50 p-4 rounded-lg border mb-6">
              <h3 className="font-bold text-brand-text mb-4">Submit Your Proof</h3>
              {renderProofInput()}
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        )}
        
        <div className="mt-auto pt-6 border-t">
          <div className="mb-4">
            <div className="flex justify-between text-sm text-brand-secondary mb-2">
              <span>Progress</span>
              <span>{task.completionsDone} / {task.completionsNeeded} completed</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={buttonState.disabled}
            className="w-full bg-brand-primary text-white font-bold py-3.5 px-6 rounded-lg shadow-lg hover:bg-brand-primary-dark transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none transform hover:scale-105 disabled:transform-none flex justify-center items-center gap-2"
          >
            {isSubmitting && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {buttonState.text}
          </button>
        </div>
      </div>
    </div>
  );
};