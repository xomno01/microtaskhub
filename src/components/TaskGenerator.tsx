import React, { useState, useEffect } from 'react';
import { generateTaskIdeas } from '../services/geminiService';
import { GeneratedTaskIdea, Task, TaskType, ProofType } from '../types';
import { SparklesIcon, LightBulbIcon, PlusIcon, EditIcon } from './Icons';

interface TaskGeneratorProps {
    onCreateTask: (taskData: Omit<Task, 'id' | 'completionsDone' | 'creatorId' | 'project'>) => boolean;
}

export const TaskGenerator: React.FC<TaskGeneratorProps> = ({ onCreateTask }) => {
    const [goal, setGoal] = useState<string>('');
    const [ideas, setIdeas] = useState<GeneratedTaskIdea[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        reward: '',
        completionsNeeded: '',
        type: TaskType.SURVEY,
        proofType: ProofType.TEXT,
        proofQuestion: '',
        autoApprove: false,
    });

    const resetForm = () => {
        setFormState({ title: '', description: '', reward: '', completionsNeeded: '', type: TaskType.SURVEY, proofType: ProofType.TEXT, proofQuestion: '', autoApprove: false });
    };

    useEffect(() => {
        if (!showForm) {
            resetForm();
        }
    }, [showForm]);


    const handleGenerate = async () => {
        if (!goal.trim()) {
            setError('Please enter a project goal.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setIdeas([]);
        setShowForm(false);
        try {
            const result = await generateTaskIdeas(goal);
            setIdeas(result);
        } catch (err) {
            setError('Failed to generate ideas. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseIdea = (idea: GeneratedTaskIdea) => {
        setFormState({
            title: idea.title,
            description: idea.description,
            type: idea.type,
            proofType: idea.proofType,
            proofQuestion: idea.proofQuestion,
            reward: '',
            completionsNeeded: '',
            autoApprove: idea.type === TaskType.SOCIAL_MEDIA_SHARE, // Auto-enable for social shares
        });
        setShowForm(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormState(prevState => ({...prevState, [name]: checked}));
        } else {
            setFormState(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { title, description, reward, completionsNeeded, type, proofType, proofQuestion, autoApprove } = formState;
        if (!title || !description || !reward || !completionsNeeded || !proofQuestion) {
            alert('Please fill out all fields.');
            return;
        }
        const success = onCreateTask({
            title,
            description,
            reward: parseFloat(reward),
            completionsNeeded: parseInt(completionsNeeded, 10),
            type,
            proofType,
            proofQuestion,
            autoApprove
        });
        
        if (success) {
            // Reset state only on successful creation
            setShowForm(false);
            setIdeas([]);
            setGoal('');
        }
    };
    
    return (
        <div className="space-y-6">
            {!showForm ? (
                 <>
                 <div className="space-y-2">
                     <label htmlFor="goal" className="block text-sm font-medium text-brand-secondary">1. Describe your project goal (AI will help)</label>
                     <input
                         type="text"
                         id="goal"
                         value={goal}
                         onChange={(e) => setGoal(e.target.value)}
                         placeholder="e.g., 'get feedback on my new app logo'"
                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
                         disabled={isLoading}
                     />
                 </div>
 
                 <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="flex-1 w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm hover:bg-brand-primary-dark transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <SparklesIcon className="w-5 h-5" />
                        )}
                        <span>{isLoading ? 'Generating...' : 'Generate Task Ideas'}</span>
                    </button>
                     <button
                        onClick={() => setShowForm(true)}
                        className="flex-1 w-full flex items-center justify-center gap-2 bg-white text-brand-primary border border-brand-primary font-semibold py-2.5 px-6 rounded-lg shadow-sm hover:bg-brand-bg transition-all duration-300"
                    >
                        <EditIcon className="w-5 h-5" />
                        <span>Create Manually</span>
                    </button>
                 </div>
 
                 {error && <p className="text-red-600 text-sm">{error}</p>}
 
                 {ideas.length > 0 && (
                     <div className="space-y-4 pt-4 border-t">
                          <h4 className="font-semibold text-brand-text flex items-center gap-2"><LightBulbIcon className="w-5 h-5 text-amber-500" /> AI Generated Ideas:</h4>
                         {ideas.map((idea, index) => (
                             <div key={index} className="border border-gray-200 rounded-lg p-4 bg-amber-50/50 relative">
                                 <p className="font-bold text-brand-text pr-24">{idea.title}</p>
                                 <p className="text-sm text-brand-secondary mt-1">{idea.description}</p>
                                  <p className="text-xs font-medium text-brand-primary mt-2">Suggested Type: {idea.type.replace(/_/g, ' ')}</p>
                                  <p className="text-xs font-medium text-indigo-600 mt-1">Proof Required: {idea.proofType}</p>
                                  <button onClick={() => handleUseIdea(idea)} className="absolute top-4 right-4 bg-white text-brand-primary text-xs font-semibold px-3 py-1.5 rounded-md border border-brand-primary hover:bg-brand-bg transition-colors">Use this idea</button>
                             </div>
                         ))}
                     </div>
                 )}
                 </>
            ) : (
                 <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t animate-fade-in">
                    <h4 className="font-semibold text-brand-text text-lg">{formState.title ? 'Customize Task Details' : 'Create New Task'}</h4>
                    <div>
                        <label className="block text-sm font-medium text-brand-secondary">Title</label>
                        <input type="text" name="title" value={formState.title} onChange={handleFormChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-brand-secondary">Description</label>
                        <textarea name="description" value={formState.description} onChange={handleFormChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg" rows={3} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-brand-secondary">Task Type</label>
                            <select name="type" value={formState.type} onChange={handleFormChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                                {Object.values(TaskType).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-secondary">Proof Type</label>
                            <select name="proofType" value={formState.proofType} onChange={handleFormChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                                {Object.values(ProofType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-secondary">Proof Question/Instruction</label>
                        <input type="text" name="proofQuestion" placeholder="e.g., 'Please provide a link to your post.'" value={formState.proofQuestion} onChange={handleFormChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-brand-secondary">Reward ($)</label>
                            <input type="number" name="reward" value={formState.reward} onChange={handleFormChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg" required min="0.01" step="0.01" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-secondary">Completions Needed</label>
                            <input type="number" name="completionsNeeded" value={formState.completionsNeeded} onChange={handleFormChange} className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg" required min="1" />
                        </div>
                    </div>
                     <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-md border border-amber-200">
                        <input id="autoApprove" type="checkbox" name="autoApprove" checked={formState.autoApprove} onChange={handleFormChange} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                        <div>
                           <label htmlFor="autoApprove" className="font-medium text-brand-text">Enable AI Auto-Approval</label>
                           <p className="text-xs text-brand-secondary">Recommended for simple tasks like 'Social Media Share'. AI will attempt to verify submissions automatically.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-brand-primary text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm hover:bg-brand-primary-dark transition-colors">
                            <PlusIcon className="w-5 h-5" /> Create & Fund Task
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-white text-brand-secondary border font-medium py-2.5 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};