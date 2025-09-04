import React, { useState, useMemo } from 'react';
import { User, Task, Submission } from '../types';
import { TaskGenerator } from './TaskGenerator';
import { PlusIcon, CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon } from './Icons';

interface DashboardViewProps {
  user: User;
  userSubmissions: Submission[];
  tasksCreated: Task[];
  submissionsForOwner: Submission[];
  onCreateTask: (taskData: Omit<Task, 'id' | 'completionsDone' | 'creatorId' | 'project'>) => boolean;
  onApprove: (submissionId: string) => void;
  onReject: (submissionId: string, reason: string) => void;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
}

type DashboardTab = 'wallet' | 'submissions' | 'projects' | 'create';

export const DashboardView: React.FC<DashboardViewProps> = (props) => {
  const { user } = props;
  const [activeTab, setActiveTab] = useState<DashboardTab>('wallet');
  
  const pendingSubmissionsForOwner = useMemo(() => props.submissionsForOwner.filter(s => s.status === 'pending'), [props.submissionsForOwner]);

  const renderContent = () => {
    switch(activeTab) {
        case 'wallet': return <WalletPanel user={user} onDeposit={props.onDeposit} onWithdraw={props.onWithdraw} />;
        case 'submissions': return <WorkerSubmissionsList submissions={props.userSubmissions} />;
        case 'projects': return <OwnerProjectsPanel tasks={props.tasksCreated} submissions={props.submissionsForOwner} onApprove={props.onApprove} onReject={props.onReject} />;
        case 'create': return <CreateTaskPanel onCreateTask={props.onCreateTask} setActiveTab={setActiveTab} />;
        default: return null;
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-brand-text mb-2">My Dashboard</h2>
        <p className="text-brand-secondary">Manage your funds, tasks, and submissions all in one place.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Nav) */}
        <div className="lg:col-span-3">
          <nav className="flex flex-col space-y-2">
            <NavButton text="My Wallet" active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
            <NavButton text="My Submissions" active={activeTab === 'submissions'} onClick={() => setActiveTab('submissions')} />
            <NavButton text="My Projects" count={pendingSubmissionsForOwner.length} active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />
            <NavButton text="Create Task" active={activeTab === 'create'} onClick={() => setActiveTab('create')} />
          </nav>
        </div>
        
        {/* Right Column (Main Content) */}
        <div className="lg:col-span-9 bg-brand-surface p-6 sm:p-8 rounded-xl shadow-md border border-gray-200/80 min-h-[400px]">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

const NavButton: React.FC<{text: string; count?: number; active: boolean; onClick: () => void}> = ({text, count, active, onClick}) => (
    <button onClick={onClick} className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm flex justify-between items-center transition-colors ${active ? 'bg-brand-primary text-white' : 'hover:bg-gray-100 text-brand-text'}`}>
        <span>{text}</span>
        {count !== undefined && count > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 text-xs font-bold">{count}</span>}
    </button>
);

const WalletPanel: React.FC<{user: User, onDeposit: (amount: number) => void, onWithdraw: (amount: number) => void}> = ({user, onDeposit, onWithdraw}) => {
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    const handleDeposit = () => {
        const amount = parseFloat(depositAmount);
        if (amount > 0) onDeposit(amount);
        setDepositAmount('');
    }

    const handleWithdraw = () => {
        const amount = parseFloat(withdrawAmount);
        if (amount > 0) onWithdraw(amount);
        setWithdrawAmount('');
    }

    return (
        <div className="space-y-8">
            <h3 className="text-xl font-bold text-brand-text">My Wallet</h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg border">
                    <p className="text-sm text-brand-secondary">Deposited Balance</p>
                    <p className="text-3xl font-bold text-brand-primary">${user.depositedBalance.toFixed(2)}</p>
                    <p className="text-xs text-brand-secondary mt-1">Funds for creating tasks.</p>
                     <div className="flex mt-4">
                        <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="Amount" className="w-full px-3 py-2 border rounded-l-md text-sm" />
                        <button onClick={handleDeposit} className="bg-brand-primary text-white font-semibold px-4 rounded-r-md text-sm hover:bg-brand-primary-dark">Deposit</button>
                    </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg border">
                    <p className="text-sm text-brand-secondary">Earned Balance</p>
                    <p className="text-3xl font-bold text-brand-accent">${user.balance.toFixed(2)}</p>
                    <p className="text-xs text-brand-secondary mt-1">Rewards from completed tasks.</p>
                     <div className="flex mt-4">
                        <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Amount" max={user.balance} className="w-full px-3 py-2 border rounded-l-md text-sm" />
                        <button onClick={handleWithdraw} className="bg-brand-accent text-white font-semibold px-4 rounded-r-md text-sm hover:opacity-90">Withdraw</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CreateTaskPanel: React.FC<{onCreateTask: DashboardViewProps['onCreateTask'], setActiveTab: (tab: DashboardTab) => void}> = ({onCreateTask, setActiveTab}) => (
    <div>
        <h3 className="text-xl font-bold text-brand-text mb-2 flex items-center gap-2">
            <PlusIcon className="w-6 h-6" />
            Create a New Task
        </h3>
        <p className="text-brand-secondary mb-6">Fund tasks using your deposited balance. Describe your goal and let AI help, or create one manually.</p>
        <TaskGenerator onCreateTask={(taskData) => {
          const success = onCreateTask(taskData);
          if (success) {
            setActiveTab('projects'); // Switch tab after successful creation
          }
          return success;
        }} />
    </div>
);


const WorkerSubmissionsList: React.FC<{submissions: Submission[]}> = ({submissions}) => {
    if (submissions.length === 0) return (
        <div>
            <h3 className="text-xl font-bold text-brand-text">My Submissions</h3>
            <p className="text-sm text-brand-secondary text-center py-12">You haven't submitted any tasks yet. Go to "Browse Tasks" to get started!</p>
        </div>
    )

    const sorted = [...submissions].sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    const pending = sorted.filter(s => s.status === 'pending');
    const approved = sorted.filter(s => s.status === 'approved');
    const rejected = sorted.filter(s => s.status === 'rejected');

    return (
      <div>
          <h3 className="text-xl font-bold text-brand-text mb-6">My Submissions</h3>
          <div className="space-y-6">
            <SubmissionCategory title="Pending Review" icon={<ClockIcon className="w-5 h-5 text-amber-500" />} submissions={pending} />
            <SubmissionCategory title="Approved" icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />} submissions={approved} />
            <SubmissionCategory title="Rejected" icon={<XCircleIcon className="w-5 h-5 text-red-500" />} submissions={rejected} />
          </div>
      </div>
    );
}

const SubmissionCategory: React.FC<{title: string; icon: React.ReactNode; submissions: Submission[]}> = ({title, icon, submissions}) => {
    if(submissions.length === 0) return null;
    return (
        <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2 uppercase tracking-wider">{icon} {title} ({submissions.length})</h4>
            <ul className="space-y-3 pl-2 border-l-2">
                {submissions.map(s => (
                    <li key={s.id} className="text-sm text-brand-secondary pl-4">
                        <p className="font-medium text-brand-text">{s.taskId.replace('task-', 'Task ')}</p>
                        <p className="text-xs italic">- {s.reviewerFeedback || `Submitted on ${new Date(s.submittedAt).toLocaleDateString()}`}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}

const OwnerProjectsPanel: React.FC<{tasks: Task[], submissions: Submission[], onApprove: Function, onReject: Function}> = ({tasks, submissions, onApprove, onReject}) => {
    const [activeOwnerTab, setActiveOwnerTab] = useState<'review' | 'manage'>('review');
    const pending = submissions.filter(s => s.status === 'pending');

     return (
        <div>
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6">
                    <OwnerTabButton text="Review Submissions" count={pending.length} active={activeOwnerTab === 'review'} onClick={() => setActiveOwnerTab('review')} />
                    <OwnerTabButton text="Manage Tasks" active={activeOwnerTab === 'manage'} onClick={() => setActiveOwnerTab('manage')} />
                </nav>
            </div>
            {activeOwnerTab === 'review' && <SubmissionReview submissions={submissions} onApprove={onApprove} onReject={onReject} />}
            {activeOwnerTab === 'manage' && <ManageTasksList tasks={tasks} />}
        </div>
     )
};

const OwnerTabButton: React.FC<{text: string; count?: number; active: boolean; onClick: () => void}> = ({text, count, active, onClick}) => (
    <button onClick={onClick} className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${active ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-secondary hover:text-brand-text hover:border-gray-300'}`}>
        {text}
        {count !== undefined && count > 0 && <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-600'}`}>{count}</span>}
    </button>
);

const ManageTasksList: React.FC<{tasks: Task[]}> = ({tasks}) => (
     <div>
        <h3 className="text-lg font-bold text-brand-text mb-4">My Active Tasks</h3>
        <div className="space-y-4">
        {tasks.length > 0 ? tasks.map(task => {
            const completionPercentage = (task.completionsDone / task.completionsNeeded) * 100;
            return (
                <div key={task.id} className="p-4 border rounded-lg bg-white">
                    <p className="font-medium text-brand-text">{task.title}</p>
                    <div className="flex justify-between text-xs text-brand-secondary mt-2 mb-1">
                        <span>Progress</span>
                        <span>{task.completionsDone} / {task.completionsNeeded}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                    </div>
                </div>
            )
        }) : <p className="text-sm text-brand-secondary text-center py-8">You haven't created any tasks yet. Go to the "Create Task" tab to get started.</p>}
        </div>
    </div>
);


const SubmissionReview: React.FC<{submissions: Submission[], onApprove: Function, onReject: Function}> = ({ submissions, onApprove, onReject }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const pending = submissions.filter(s => s.status === 'pending');

    const handleReject = (submissionId: string) => {
        if (!rejectionReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }
        onReject(submissionId, rejectionReason);
        setRejectionReason('');
        setExpandedId(null);
    }
    
    if (pending.length === 0) return <p className="text-sm text-brand-secondary text-center py-8">No pending submissions to review right now.</p>;

    return (
      <div className="space-y-4">
        {pending.map(sub => (
           <div key={sub.id} className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-brand-text">Submission for: <span className="font-normal">{sub.taskId}</span></p>
                  <p className="text-xs text-brand-secondary font-mono">From: {sub.workerId}</p>
                </div>
                <button onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)} className="flex items-center gap-1 text-sm text-brand-primary font-medium">
                  <EyeIcon className="w-4 h-4" /> {expandedId === sub.id ? 'Hide' : 'View'} Proof
                </button>
              </div>

              {expandedId === sub.id && (
                <div className="mt-4 pt-4 border-t space-y-4 animate-fade-in">
                  <div className="bg-gray-50 p-3 rounded-md">
                      <h5 className="text-xs font-bold uppercase text-brand-secondary mb-1">Submitted Proof:</h5>
                      {sub.proof.text && <p className="text-sm whitespace-pre-wrap">{sub.proof.text}</p>}
                      {sub.proof.link && <a href={sub.proof.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{sub.proof.link}</a>}
                      {sub.proof.imageUrl && <div><p className="text-sm">Image Submitted:</p><img src="https://via.placeholder.com/300x200.png?text=Simulated+Image" alt="Simulated Submission" className="rounded-md mt-1 border" /></div>}
                  </div>
                   <div className="space-y-2">
                     <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={2} placeholder="Reason for rejection (required if rejecting)" className="w-full text-sm p-2 border rounded-md"></textarea>
                     <div className="flex gap-3">
                        <button onClick={() => onApprove(sub.id)} className="flex-1 bg-green-500 text-white text-sm font-bold py-2 rounded-md hover:bg-green-600 transition-colors">Approve</button>
                        <button onClick={() => handleReject(sub.id)} className="flex-1 bg-red-500 text-white text-sm font-bold py-2 rounded-md hover:bg-red-600 transition-colors">Reject</button>
                     </div>
                   </div>
                </div>
              )}
           </div>
        ))}
      </div>
    )
}