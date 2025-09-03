export enum TaskType {
  SURVEY = 'Survey',
  DATA_ENTRY = 'Data Entry',
  SOCIAL_MEDIA_SHARE = 'Social Media Share',
  APP_TESTING = 'App Testing',
  CONTENT_CREATION = 'Content Creation',
  FEEDBACK = 'Feedback & Ideas',
}

export enum ProofType {
  TEXT = 'text',
  LINK = 'link',
  IMAGE = 'image',
}

// Simplified roles for Web3 integration
export type UserRole = 'USER' | 'ADMIN';

export interface Task {
  id: string;
  creatorId: string; // Will be a user's wallet address
  title: string;
  description: string;
  reward: number;
  type: TaskType;
  project: {
    name: string;
    logoUrl?: string;
  };
  completionsNeeded: number;
  completionsDone: number;
  proofType: ProofType;
  proofQuestion: string;
  autoApprove: boolean;
}

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string; // Wallet address for 'USER', unique string for 'ADMIN'
  name?: string; // Optional for users, required for Admin
  email?: string; // Only for 'ADMIN'
  role: UserRole;
  status: UserStatus;
  balance: number; // Earned funds, can be withdrawn
  depositedBalance: number; // Funds deposited by user to create tasks
  completedTaskIds: string[];
  submittedTaskIds: string[];
}

export interface SubmissionProof {
    text?: string;
    link?: string;
    imageUrl?: string;
}

export interface Submission {
    id: string;
    taskId: string;
    workerId: string; // Wallet address of the user who submitted
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    proof: SubmissionProof;
    reviewerFeedback?: string;
}

export interface GeneratedTaskIdea {
    title: string;
    description: string;
    type: TaskType;
    proofType: ProofType;
    proofQuestion: string;
}

// --- MOCK DATABASE FOR WEB3 ---

const MOCK_USERS: User[] = [
  // A regular user with a wallet address
  {
    id: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    role: 'USER',
    status: 'active',
    balance: 127.50, // Earned from tasks
    depositedBalance: 250.00, // Deposited to create tasks
    completedTaskIds: ['task-001'],
    submittedTaskIds: ['task-003'],
  },
  // Another regular user
    {
    id: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    role: 'USER',
    status: 'active',
    balance: 22.00,
    depositedBalance: 50.00,
    completedTaskIds: [],
    submittedTaskIds: [],
  },
  // The Admin user, identified by email
  {
    id: 'user-admin-01',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
    status: 'active',
    balance: 0,
    depositedBalance: 0,
    completedTaskIds: [],
    submittedTaskIds: [],
  }
];

const MOCK_TASKS: Task[] = [
  {
    id: 'task-001',
    creatorId: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Created by the second user
    title: 'Feedback on New App Icon',
    description: 'We are looking for feedback on three new app icon designs. This task involves viewing the icons and answering a short 5-question survey.',
    reward: 5.00,
    type: TaskType.FEEDBACK,
    project: { name: 'User 0x709...c79C8' },
    completionsNeeded: 100,
    completionsDone: 88,
    proofType: ProofType.TEXT,
    proofQuestion: 'Which icon did you prefer and why? Please be detailed.',
    autoApprove: false,
  },
  {
    id: 'task-002',
    creatorId: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    title: 'Transcribe Short Audio Clips',
    description: 'Listen to 10 short audio clips (15-30 seconds each) and accurately transcribe the speech into text.',
    reward: 12.50,
    type: TaskType.DATA_ENTRY,
    project: { name: 'User 0x709...c79C8' },
    completionsNeeded: 50,
    completionsDone: 12,
    proofType: ProofType.TEXT,
    proofQuestion: 'Please paste the full transcription here.',
    autoApprove: false,
  },
  {
    id: 'task-003',
    creatorId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Created by the first user
    title: 'Share our Launch Post on X',
    description: 'Help us spread the word! Share our official launch post on your X (Twitter) account with the hashtag #NewProductLaunch. The post must be public.',
    reward: 2.50,
    type: TaskType.SOCIAL_MEDIA_SHARE,
    project: { name: 'User 0xf39...92266' },
    completionsNeeded: 500,
    completionsDone: 451,
    proofType: ProofType.LINK,
    proofQuestion: 'Please provide the direct link to your post on X.',
    autoApprove: true,
  },
];

const MOCK_SUBMISSIONS: Submission[] = [
    {
        id: 'sub-001',
        taskId: 'task-003',
        workerId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        status: 'pending',
        submittedAt: '2023-10-27T10:00:00Z',
        proof: { link: 'https://twitter.com/alexdoe/status/123456789' }
    },
    {
        id: 'sub-002',
        taskId: 'task-001',
        workerId: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        status: 'approved',
        submittedAt: '2023-10-26T14:30:00Z',
        proof: { text: 'I preferred icon B. It was cleaner and more modern.' },
        reviewerFeedback: 'Approved by OWNER'
    },
];

export const MOCK_DB = {
  users: MOCK_USERS,
  tasks: MOCK_TASKS,
  submissions: MOCK_SUBMISSIONS
};