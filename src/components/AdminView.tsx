import React, { useState, useMemo } from 'react';
import { User, Task, Submission, UserStatus } from '../types';
import { TrashIcon, UserIcon, ClipboardListIcon, EyeIcon, ChartBarIcon, ShieldExclamationIcon, CheckCircleIcon, XCircleIcon } from './Icons';

interface AdminViewProps {
    db: { users: User[], tasks: Task[], submissions: Submission[] };
    onDeleteUser: (userId: string) => void;
    onDeleteTask: (taskId: string) => void;
    onUpdateUserStatus: (userId: string, status: UserStatus) => void;
    onAdminApprove: (submissionId: string) => void;
    onAdminReject: (submissionId: string, reason: string) => void;
}

type AdminTab = 'overview' | 'users' | 'tasks' | 'disputes';

export const AdminView: React.FC<AdminViewProps> = ({ db, onDeleteUser, onDeleteTask, onUpdateUserStatus, onAdminApprove, onAdminReject }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    
    const disputes = useMemo(() => db.submissions.filter(s => s.status === 'rejected'), [db.submissions]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h2 className="text-3xl font-bold text-brand-text mb-2">Admin Panel</h2>
                <p className="text-brand-secondary">Oversee all platform activity, manage users, and moderate tasks.</p>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                   <TabButton text="Overview" icon={<ChartBarIcon className="w-5 h-5" />} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                   <TabButton text="Users" icon={<UserIcon className="w-5 h-5" />} count={db.users.length} active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                   <TabButton text="Tasks" icon={<ClipboardListIcon className="w-5 h-5" />} count={db.tasks.length} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
                   <TabButton text="Disputes" icon={<ShieldExclamationIcon className="w-5 h-5" />} count={disputes.length} active={activeTab === 'disputes'} onClick={() => setActiveTab('disputes')} />
                </nav>
            </div>
            
            <div className="bg-brand-surface p-6 rounded-xl shadow-md border border-gray-200/80 min-h-[400px]">
                {activeTab === 'overview' && <OverviewPanel db={db} />}
                {activeTab === 'users' && <UsersPanel users={db.users} onDeleteUser={onDeleteUser} onUpdateUserStatus={onUpdateUserStatus} />}
                {activeTab === 'tasks' && <TasksPanel tasks={db.tasks} onDeleteTask={onDeleteTask} />}
                {activeTab === 'disputes' && <DisputesPanel disputes={disputes} onAdminApprove={onAdminApprove} onAdminReject={onAdminReject} />}
            </div>
        </div>
    );
};

// --- Sub-Panels for Admin View ---

const TabButton: React.FC<{text: string; icon: React.ReactNode; count?: number; active: boolean; onClick: () => void}> = ({text, icon, count, active, onClick}) => (
    <button onClick={onClick} className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${active ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-secondary hover:text-brand-text hover:border-gray-300'}`}>
        {icon} {text}
        {count !== undefined && <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-600'}`}>{count}</span>}
    </button>
)

const OverviewPanel: React.FC<{db: AdminViewProps['db']}> = ({db}) => {
    const totalPayouts = useMemo(() => {
        return db.submissions.filter(s => s.status === 'approved')
            .reduce((acc, sub) => {
                const task = db.tasks.find(t => t.id === sub.taskId);
                return acc + (task?.reward || 0);
            }, 0);
    }, [db]);

    const pendingSubmissions = db.submissions.filter(s => s.status === 'pending').length;

    return (
        <div>
             <h3 className="text-xl font-bold text-brand-text mb-6">Platform Statistics</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-brand-primary">{db.users.length}</p>
                    <p className="text-sm text-brand-secondary">Total Users</p>
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-brand-primary">{db.tasks.length}</p>
                    <p className="text-sm text-brand-secondary">Active Tasks</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-brand-accent">${totalPayouts.toFixed(2)}</p>
                    <p className="text-sm text-brand-secondary">Total Payouts</p>
                </div>
                 <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-amber-600">{pendingSubmissions}</p>
                    <p className="text-sm text-brand-secondary">Pending Submissions</p>
                </div>
             </div>
        </div>
    )
}

const UsersPanel: React.FC<{users: User[], onDeleteUser: Function, onUpdateUserStatus: Function}> = ({users, onDeleteUser, onUpdateUserStatus}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-brand-secondary uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">ID / Address</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Role</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-brand-text whitespace-nowrap font-mono text-xs">{user.name || user.id}</td>
                        <td className="px-6 py-4">{user.email || 'N/A'}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{user.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                             {user.role !== 'ADMIN' && (
                                <>
                                    <button onClick={() => onUpdateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')} className="font-medium text-yellow-600 hover:underline">
                                      {user.status === 'active' ? 'Suspend' : 'Activate'}
                                    </button>
                                    <button onClick={() => onDeleteUser(user.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                                </>
                             )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)

const TasksPanel: React.FC<{tasks: Task[], onDeleteTask: Function}> = ({tasks, onDeleteTask}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-brand-secondary uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Title</th>
                    <th scope="col" className="px-6 py-3">Project Owner</th>
                    <th scope="col" className="px-6 py-3">Progress</th>
                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {tasks.map(task => (
                    <tr key={task.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-brand-text whitespace-nowrap">{task.title}</td>
                        <td className="px-6 py-4 font-mono text-xs">{task.creatorId}</td>
                        <td className="px-6 py-4">{task.completionsDone} / {task.completionsNeeded}</td>
                        <td className="px-6 py-4 text-right">
                            <button onClick={() => onDeleteTask(task.id)} className="text-red-500 hover:text-red-700" title="Delete Task"><TrashIcon className="w-5 h-5"/></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)


const DisputesPanel: React.FC<{disputes: Submission[], onAdminApprove: Function, onAdminReject: Function}> = ({ disputes, onAdminApprove, onAdminReject }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (disputes.length === 0) return <p className="text-sm text-brand-secondary text-center py-8">No disputed submissions to review.</p>;

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-brand-text">Dispute Resolution</h3>
        {disputes.map(sub => (
           <div key={sub.id} className="border border-amber-300 rounded-lg p-4 bg-amber-50/50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-brand-text">Dispute on: <span className="font-normal">{sub.taskId}</span></p>
                  <p className="text-xs text-brand-secondary font-mono">Worker: {sub.workerId}</p>
                </div>
                <button onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)} className="flex items-center gap-1 text-sm text-brand-primary font-medium">
                  <EyeIcon className="w-4 h-4" /> {expandedId === sub.id ? 'Hide' : 'Review'} Details
                </button>
              </div>

              {expandedId === sub.id && (
                <div className="mt-4 pt-4 border-t border-amber-200 grid md:grid-cols-2 gap-4 animate-fade-in">
                  <div className="bg-white p-3 rounded-md border">
                      <h5 className="text-xs font-bold uppercase text-brand-secondary mb-1">Worker's Proof:</h5>
                      {sub.proof.text && <p className="text-sm whitespace-pre-wrap">{sub.proof.text}</p>}
                      {sub.proof.link && <a href={sub.proof.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{sub.proof.link}</a>}
                      {sub.proof.imageUrl && <div><p className="text-sm">Image Submitted:</p><img src="https://via.placeholder.com/300x200.png?text=Simulated+Image" alt="Simulated Submission" className="rounded-md mt-1 border" /></div>}
                  </div>
                  <div className="bg-white p-3 rounded-md border">
                      <h5 className="text-xs font-bold uppercase text-brand-secondary mb-1">Owner's Rejection Reason:</h5>
                      <p className="text-sm italic">"{sub.reviewerFeedback?.replace('Rejected by OWNER: ', '')}"</p>
                  </div>
                   <div className="md:col-span-2 space-y-2 text-center border-t border-amber-200 pt-4">
                     <h4 className="text-sm font-bold">Admin Final Decision</h4>
                     <div className="flex gap-3">
                        <button onClick={() => onAdminApprove(sub.id)} className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white text-sm font-bold py-2 rounded-md hover:bg-green-600 transition-colors">
                          <CheckCircleIcon className="w-5 h-5"/> Overturn & Approve
                        </button>
                        <button onClick={() => onAdminReject(sub.id, `Admin upheld owner's decision.`)} className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white text-sm font-bold py-2 rounded-md hover:bg-red-600 transition-colors">
                           <XCircleIcon className="w-5 h-5"/> Uphold Rejection
                        </button>
                     </div>
                   </div>
                </div>
              )}
           </div>
        ))}
      </div>
    )
}