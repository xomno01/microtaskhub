import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TaskCard } from './components/TaskCard';
import { TaskDetailModal } from './components/TaskDetailModal';
import { Toast } from './components/Toast';
import { Task, User, TaskType, MOCK_DB, UserRole, Submission, SubmissionProof } from './types';
import { ArrowRightIcon, StarIcon } from './components/Icons';
import { ConnectWalletView } from './components/LoginView';
import { AdminView } from './components/AdminView';
import { DashboardView } from './components/DashboardView';
import { verifySubmissionWithAI } from './services/geminiService';


type Page = 'home' | 'tasks' | 'dashboard' | 'admin';
type ToastMessage = { id: number; message: string; type: 'success' | 'error' | 'info' };

// --- Web3 Constants ---
const NETWORKS: { [key: string]: string } = {
  '0x1': 'Ethereum Mainnet',
  '0xaa36a7': 'Sepolia Testnet',
};

const App: React.FC = () => {
  const [db, setDb] = useState(MOCK_DB);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [network, setNetwork] = useState<string>('Unsupported Network');
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  // --- WEB3 CONNECTION LOGIC ---
  useEffect(() => {
    const { ethereum } = window as any;
    if (ethereum) {
        const handleChainChanged = (chainId: string) => {
            setNetwork(NETWORKS[chainId] || 'Unsupported Network');
        };
        ethereum.on('chainChanged', handleChainChanged);
        
        // Initial check
        ethereum.request({ method: 'eth_chainId' }).then(handleChainChanged);

        return () => {
            ethereum.removeListener('chainChanged', handleChainChanged);
        };
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = { id: Date.now(), message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };
  
  // --- AUTH HANDLERS (HYBRID) ---
  const handleConnectWallet = async () => {
    const { ethereum } = window as any;
    if (!ethereum) {
        showToast('Web3 wallet not detected. Please install MetaMask.', 'error');
        return;
    }
    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        let user = db.users.find(u => u.id.toLowerCase() === address.toLowerCase());

        if (!user) { // Auto-register new user
            user = {
                id: address,
                role: 'USER',
                balance: 0,
                depositedBalance: 0, // New users start with 0 deposited
                status: 'active',
                completedTaskIds: [],
                submittedTaskIds: [],
            };
            setDb(prev => ({ ...prev, users: [...prev.users, user!] }));
        }
        
        if (user.status === 'suspended') {
            showToast('This wallet address has been suspended.', 'error');
            return;
        }

        setCurrentUser(user);
        setCurrentPage('dashboard');
        showToast(`Wallet connected: ${address.substring(0,6)}...${address.substring(address.length - 4)}`);
    } catch (error) {
        showToast('Failed to connect wallet.', 'error');
        console.error(error);
    }
  };

  const handleAdminLogin = (email: string): boolean => {
    const user = db.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (user && user.role === 'ADMIN') {
        if (user.status === 'suspended') {
            showToast('Your account has been suspended.', 'error');
            return false;
        }
      setCurrentUser(user);
      setCurrentPage('admin');
      showToast(`Welcome back, Admin!`);
      return true;
    }
    showToast('Admin account not found.', 'error');
    return false;
  };

  const handleDisconnect = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  };

  // --- PLATFORM FINANCIALS (SIMULATED) ---
  const handleDeposit = (amount: number) => {
    if (!currentUser || amount <= 0) return;
    showToast(`Simulating deposit of $${amount.toFixed(2)}...`, 'info');
    // In a real dApp, this would trigger a smart contract call.
    setTimeout(() => {
        const updatedUsers = db.users.map(u => 
            u.id === currentUser.id ? { ...u, depositedBalance: u.depositedBalance + amount } : u
        );
        setDb(prev => ({ ...prev, users: updatedUsers }));
        setCurrentUser(updatedUsers.find(u => u.id === currentUser.id)!);
        showToast(`$${amount.toFixed(2)} deposited successfully!`, 'success');
    }, 1500);
  };

  const handleWithdraw = (amount: number) => {
    if (!currentUser || amount <= 0 || amount > currentUser.balance) {
        showToast('Invalid withdrawal amount.', 'error');
        return;
    }
    showToast(`Simulating withdrawal of $${amount.toFixed(2)}...`, 'info');
    setTimeout(() => {
        const updatedUsers = db.users.map(u => 
            u.id === currentUser.id ? { ...u, balance: u.balance - amount } : u
        );
        setDb(prev => ({ ...prev, users: updatedUsers }));
        setCurrentUser(updatedUsers.find(u => u.id === currentUser.id)!);
        showToast(`$${amount.toFixed(2)} withdrawn successfully!`, 'success');
    }, 1500);
  };


  // --- SUBMISSION & WORKFLOW HANDLERS ---
  const handleTaskSubmit = async (taskId: string, proof: SubmissionProof) => {
    if (!currentUser || currentUser.role !== 'USER') return;
    const task = db.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      taskId,
      workerId: currentUser.id,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      proof,
    };

    const updatedUser = { ...currentUser, submittedTaskIds: [...currentUser.submittedTaskIds, taskId] };
    setDb(prev => ({ ...prev, submissions: [...prev.submissions, newSubmission] }));
    setCurrentUser(updatedUser);
    setSelectedTask(null);

    if (task.autoApprove) {
      setIsVerifying(true);
      showToast('AI is verifying your submission...', 'info');
      try {
        const isApproved = await verifySubmissionWithAI(task, proof);
        if (isApproved) {
            handleApproveSubmission(newSubmission.id, 'AI');
            showToast('AI approved your submission!', 'success');
        } else {
            showToast('AI could not auto-verify. Pending owner review.', 'info');
        }
      } catch (e) {
        showToast('AI verification failed. Pending owner review.', 'error');
      } finally {
        setIsVerifying(false);
      }
    } else {
       showToast('Task submitted for review!', 'success');
    }
  };
  
  const handleApproveSubmission = (submissionId: string, approver: 'OWNER' | 'ADMIN' | 'AI') => {
      const submission = db.submissions.find(s => s.id === submissionId);
      if(!submission) return;

      const task = db.tasks.find(t => t.id === submission.taskId);
      const worker = db.users.find(u => u.id === submission.workerId);
      if(!task || !worker) return;

      const updatedSubmissions = db.submissions.map(s => s.id === submissionId ? { ...s, status: 'approved' as const, reviewerFeedback: `Approved by ${approver}` } : s);
      const updatedTasks = db.tasks.map(t => t.id === task.id ? { ...t, completionsDone: t.completionsDone + 1 } : t);
      const updatedUsers = db.users.map(u => {
          if (u.id === worker.id) {
              return {
                  ...u,
                  balance: u.balance + task.reward, // Earned balance increases
                  submittedTaskIds: u.submittedTaskIds.filter(id => id !== task.id),
                  completedTaskIds: [...u.completedTaskIds, task.id]
              };
          }
          return u;
      });

      setDb({ ...db, submissions: updatedSubmissions, tasks: updatedTasks, users: updatedUsers });
       if (currentUser?.id === worker.id) {
            setCurrentUser(updatedUsers.find(u => u.id === currentUser.id)!);
       }
      showToast('Submission approved!', 'success');
  };

  const handleRejectSubmission = (submissionId: string, reason: string, rejecter: 'OWNER' | 'ADMIN') => {
      if(!reason.trim()){
          showToast('A reason is required to reject a submission.', 'error');
          return;
      }
      const submission = db.submissions.find(s => s.id === submissionId);
      if(!submission) return;

      const updatedSubmissions = db.submissions.map(s => s.id === submissionId ? { ...s, status: 'rejected' as const, reviewerFeedback: `Rejected by ${rejecter}: ${reason}` } : s);
      const updatedUsers = db.users.map(u => {
          if (u.id === submission.workerId) {
              return { ...u, submittedTaskIds: u.submittedTaskIds.filter(id => id !== submission.taskId) };
          }
          return u;
      });

      setDb({ ...db, submissions: updatedSubmissions, users: updatedUsers });
      showToast('Submission rejected.', 'success');
  };

  // --- TASK CREATION ---
  const handleCreateTask = (taskData: Omit<Task, 'id' | 'completionsDone' | 'creatorId' | 'project'>): boolean => {
    if (!currentUser || currentUser.role !== 'USER') return false;

    const totalCost = taskData.reward * taskData.completionsNeeded;
    if (currentUser.depositedBalance < totalCost) {
        showToast(`Insufficient funds. You need $${totalCost.toFixed(2)} but only have $${currentUser.depositedBalance.toFixed(2)} deposited.`, 'error');
        return false;
    }

     const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        completionsDone: 0,
        creatorId: currentUser.id,
        project: { name: `User ${currentUser.id.substring(0, 6)}...` } 
     };
     
     // Deduct funds from deposited balance
     const updatedUsers = db.users.map(u => 
        u.id === currentUser.id ? { ...u, depositedBalance: u.depositedBalance - totalCost } : u
     );

     setDb(prevDb => ({ ...prevDb, tasks: [newTask, ...prevDb.tasks], users: updatedUsers}));
     setCurrentUser(updatedUsers.find(u => u.id === currentUser.id)!);
     showToast('New task created and funded successfully!');
     return true;
  };

  // --- ADMIN HANDLERS ---
  const handleUpdateUserStatus = (userId: string, status: 'active' | 'suspended') => {
      if(currentUser?.role !== 'ADMIN') return;
      setDb(prev => ({...prev, users: prev.users.map(u => u.id === userId ? {...u, status} : u)}));
      showToast(`User status updated to ${status}.`, 'success');
  }

  const handleDeleteTask = (taskId: string) => {
    if (currentUser?.role !== 'ADMIN') return;
    setDb(prev => ({
        ...prev, 
        tasks: prev.tasks.filter(t => t.id !== taskId),
        submissions: prev.submissions.filter(s => s.taskId !== taskId)
    }));
    showToast('Task and related submissions deleted.', 'success');
  }

  const handleDeleteUser = (userId: string) => {
     if (currentUser?.role !== 'ADMIN' || userId === currentUser.id) return;
     setDb(prev => ({...prev, users: prev.users.filter(u => u.id !== userId)}));
     showToast('User deleted successfully.', 'success');
  }

  const userSubmissions = useMemo(() => {
    if (!currentUser) return [];
    return db.submissions.filter(s => s.workerId === currentUser.id);
  }, [db.submissions, currentUser]);

  const renderContent = () => {
    if (!currentUser) {
        return <HomeView onNavigate={() => setCurrentPage('tasks')} featuredTasks={db.tasks.slice(0, 3)} onSelectTask={setSelectedTask} />;
    }

    switch (currentPage) {
      case 'tasks':
        return <TasksView 
            tasks={db.tasks.filter(task => !currentUser.completedTaskIds.includes(task.id) && !currentUser.submittedTaskIds.includes(task.id))} 
            onSelectTask={setSelectedTask} 
        />;
      case 'dashboard':
        return <DashboardView 
            user={currentUser} 
            userSubmissions={userSubmissions}
            tasksCreated={db.tasks.filter(t => t.creatorId === currentUser.id)}
            submissionsForOwner={db.submissions.filter(s => db.tasks.find(t => t.id === s.taskId)?.creatorId === currentUser.id)}
            onCreateTask={handleCreateTask} 
            onApprove={(id) => handleApproveSubmission(id, 'OWNER')}
            onReject={(id, reason) => handleRejectSubmission(id, reason, 'OWNER')}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
        />;
      case 'admin':
        return <AdminView 
            db={db} 
            onDeleteUser={handleDeleteUser} 
            onDeleteTask={handleDeleteTask}
            onUpdateUserStatus={handleUpdateUserStatus}
            onAdminApprove={id => handleApproveSubmission(id, 'ADMIN')}
            onAdminReject={(id, reason) => handleRejectSubmission(id, reason, 'ADMIN')}
        />;
      case 'home':
      default:
        return <HomeView onNavigate={setCurrentPage} featuredTasks={db.tasks.slice(0, 3)} onSelectTask={setSelectedTask} />;
    }
  };
  
  return (
    <div className="font-sans min-h-screen flex flex-col">
      <Header 
        user={currentUser} 
        currentPage={currentPage} 
        network={network}
        onNavigate={setCurrentPage} 
        onDisconnect={handleDisconnect}
        onConnect={handleConnectWallet}
      />
      
      {!currentUser ? (
         <ConnectWalletView onConnect={handleConnectWallet} onAdminLogin={handleAdminLogin} />
      ) : (
        <main id="app-root" className="flex-grow container mx-auto px-4 py-8 md:py-12">
          {renderContent()}
        </main>
      )}

      <Footer />
      {selectedTask && currentUser && (
        <TaskDetailModal
          task={selectedTask}
          user={currentUser}
          onClose={() => setSelectedTask(null)}
          onTaskSubmit={handleTaskSubmit}
          isSubmitting={isVerifying}
        />
      )}
      <div className="fixed bottom-5 right-5 z-[100] space-y-2 w-full max-w-sm">
        {toasts.map(toast => <Toast key={toast.id} message={toast.message} type={toast.type} onDismiss={() => setToasts(p => p.filter(t => t.id !== toast.id))} />)}
      </div>
    </div>
  );
};

// --- Views ---

const HomeView: React.FC<{ onNavigate: (page: Page) => void; featuredTasks: Task[]; onSelectTask: (task: Task) => void; }> = ({ onNavigate, featuredTasks, onSelectTask }) => (
  <div className="animate-fade-in">
    <section className="text-center py-16 md:py-24">
      <h1 className="text-4xl md:text-6xl font-bold text-brand-text mb-4 tracking-tight">Connect. Create. Earn.</h1>
      <p className="text-lg md:text-xl text-brand-secondary max-w-3xl mx-auto mb-8">
        The ultimate platform for projects to find engaged users, and for you to earn rewards by completing simple, meaningful tasks.
      </p>
      <div className="flex justify-center gap-4 flex-wrap">
        <button onClick={() => onNavigate('tasks')} className="bg-brand-primary text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-brand-primary-dark transition-all duration-300 transform hover:scale-105 flex items-center gap-2">
          Browse Tasks <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </section>

    <section className="py-16">
      <h2 className="text-3xl font-bold text-center text-brand-text mb-2 flex items-center justify-center gap-3"><StarIcon className="w-8 h-8 text-amber-400" /> Featured Tasks</h2>
      <p className="text-center text-brand-secondary mb-12">Get a glimpse of the opportunities waiting for you.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredTasks.map(task => <TaskCard key={task.id} task={task} onSelectTask={onSelectTask} />)}
      </div>
    </section>
  </div>
);


const TasksView: React.FC<{ tasks: Task[]; onSelectTask: (task: Task) => void; }> = ({ tasks, onSelectTask }) => {
  const [filter, setFilter] = useState<TaskType | 'all'>('all');

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter(task => task.type === filter);
  }, [filter, tasks]);

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-brand-text mb-4">Available Tasks</h2>
      <p className="text-brand-secondary mb-8">Find tasks that suit your skills and interests. New opportunities added daily.</p>
      
      <div className="mb-8 flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-brand-primary text-white' : 'bg-white hover:bg-gray-100 border'}`}>All</button>
        {Object.values(TaskType).map(type => (
          <button key={type} onClick={() => setFilter(type)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === type ? 'bg-brand-primary text-white' : 'bg-white hover:bg-gray-100 border'}`}>{type.replace(/_/g, ' ')}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTasks.length > 0 ? filteredTasks.map(task => <TaskCard key={task.id} task={task} onSelectTask={onSelectTask} />) : <p className="text-brand-secondary col-span-full text-center py-10">No tasks found for this category.</p>}
      </div>
    </div>
  );
};

export default App;