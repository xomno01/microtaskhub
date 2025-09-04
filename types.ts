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
  // --- Feedback & Surveys ---
  {
    id: 'task-001',
    creatorId: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
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
    id: 'task-004',
    creatorId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    title: 'Short Survey on Online Shopping Habits',
    description: 'Answer a 10-question multiple-choice survey about your online shopping preferences. It should take less than 5 minutes.',
    reward: 3.00,
    type: TaskType.SURVEY,
    project: { name: 'User 0xf39...92266' },
    completionsNeeded: 250,
    completionsDone: 112,
    proofType: ProofType.TEXT,
    proofQuestion: 'Please provide a summary of your key preference at the end of the survey.',
    autoApprove: false,
  },
  {
    id: 'task-005',
    creatorId: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    title: 'Choose the Best Slogan',
    description: 'We have three potential slogans for our new coffee brand. Read them and tell us which one you think is the most effective and why.',
    reward: 2.00,
    type: TaskType.FEEDBACK,
    project: { name: 'User 0x709...c79C8' },
    completionsNeeded: 150,
    completionsDone: 145,
    proofType: ProofType.TEXT,
    proofQuestion: 'Which slogan did you choose and what was your reasoning?',
    autoApprove: false,
  },
  {
    id: 'task-018',
    creatorId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    title: 'Website Usability Feedback',
    description: 'Spend 5-10 minutes browsing our new website. Report back on your overall experience, noting anything confusing or difficult to use.',
    reward: 7.50,
    type: TaskType.FEEDBACK,
    project: { name: 'User 0xf39...92266' },
    completionsNeeded: 50,
    completionsDone: 5,
    proofType: ProofType.TEXT,
    proofQuestion: 'Provide a summary of your experience and list at least one area for improvement.',
    autoApprove: false,
  },
  // --- Social Media Tasks ---
  {
    id: 'task-003',
    creatorId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
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
  {
    id: 'task-006',
    creatorId: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    title: 'Share our Blog Post on Facebook',
    description: 'Share our latest blog post on your personal Facebook timeline. The post privacy must be set to "Public" for verification.',
    reward: 2.00,
    type: TaskType.SOCIAL_MEDIA_SHARE,
    project: { name: 'User 0x709...c79C8' },
    completionsNeeded: 300,
    completionsDone: 78,
    proofType: ProofType.LINK,
    proofQuestion: 'Provide the public link to your Facebook share.',
    autoApprove: true,
  },
  {
    id: 'task-007',
    creatorId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    title: 'Retweet our Contest Announcement',
    description: 'Simply retweet our pinned contest post from our official X (Twitter) account. Your account must have at least 50 followers.',
    reward: 1.50,
    type: TaskType.SOCIAL_MEDIA_SHARE,
    project: { name: 'User 0xf39...92266' },
    completionsNeeded: 1000,
    completionsDone: 850,
    proofType: ProofType.LINK,
    proofQuestion: 'Provide the link to your retweet.',
    autoApprove: true,
  },
   {
    id: 'task-021',
    creatorId: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    title: 'Post about our Service on LinkedIn',
    description: 'Write a short, professional post on LinkedIn mentioning our new B2B service and why it\'s useful. Include the hashtag #B2BService.',
    reward: 5.00,
    type: TaskType.SOCIAL_MEDIA_SHARE,
    project: { name: 'User 0x709...c79C8' },
    completionsNeeded: 100,
    completionsDone: 21,
    proofType: ProofType.LINK,
    proofQuestion: 'Please provide the link to your LinkedIn post.',
    autoApprove: true,
  },
  // --- Data Entry ---
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
    id: 'task-008',
    creatorId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    title: 'Categorize 20 Images of Clothing',
    description: 'Look at 20 images of clothing items and categorize each one as "T-Shirt", "Jeans", "Jacket", or "Shoes".',
    reward: 8.00,
    type: TaskType.DATA_ENTRY,
    project: { name: 'User 0xf39...92266' },
    completionsNeeded: 75,
    completionsDone: 33,
    proofType: ProofType.TEXT,
    proofQuestion: 'Provide your list of categories in order, separated by commas (e.g., T-Shirt, Jeans, ...).',
    autoApprove: false,
  },
  {
    id: 'task-009',
    creatorId: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    title: 'Find Contact Emails for 10 Companies',
    description: 'Given a list of 10 company websites, find the main contact or support email address for each.',
    reward: 6.50,
    type: TaskType.DATA_ENTRY,
    project: { name: 'User 0x709...c79C8' },
    completionsNeeded: 40,
    completionsDone: 0,
    proofType: ProofType.TEXT,
    proofQuestion: 'List the company name and the email you found for each of the 10 companies.',
    autoApprove: false,
  },
  // --- App Testing ---
  {
    id: 'task-010',
    creatorId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    title: 'Test Checkout on E-commerce Site',
    description: 'Go to our new online store, add any item to your cart, and proceed through the entire checkout process using the provided test credit card info. Report any bugs or issues.',
    reward: 15.00,
    type: TaskType.APP_TESTING,
    project: { name: 'User 0xf39...92266' },
    completionsNeeded: 25,
    completionsDone: 19,
    proofType: ProofType.TEXT,
    proofQuestion: 'Describe your experience. Did you encounter any errors or confusing steps? Be specific.',
    autoApprove: false,
  },
  {
    id: 'task-011',
    creatorId: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    title: 'Find a Bug in our Mobile App',
    description: 'Download our new Android app from the provided link. Your goal is to find one usability issue or bug. The first 30 unique bugs reported will be paid.',
    reward: 10.00,
    type: TaskType.APP_TESTING,
    project: { name: 'User 0x709...c79C8' },
    completionsNeeded: 30,
    completionsDone: 11,
    proofType: ProofType.TEXT,
    proofQuestion: 'Clearly describe the bug you found and the steps to reproduce it.',
    autoApprove: false,
  },
  {
    id: 'task-019',
    creatorId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    title: 'Sign Up for Beta and Give First Impressions',
    description: 'Sign up for our new web application beta. Spend 5 minutes exploring after signup and write down your immediate thoughts and impressions.',
    reward: 5.00,
    type: TaskType.APP_TESTING,
    project: { name: 'User 0xf39...92266' },
    completionsNeeded: 200,
    completionsDone: 0,
    proofType: ProofType.TEXT,
    proofQuestion: 'What were your first impressions? Was the onboarding process clear?',
    autoApprove: false,
  },
  // --- Content Creation ---
  {
    id: 'task-012',
    creatorId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    title: 'Write a Short, Positive Product Review',
    description: 'If you have used our product, please write a short, honest, and positive review (3-4 sentences) that we can use on our website.',
    reward: 4.50,
    type: TaskType.CONTENT_CREATION,
    project: { name: 'User 0xf39...92266' },
    completionsNeeded: 50,
    completionsDone: 48,
    proofType: ProofType.TEXT,
    proofQuestion: 'Please paste your review here.',
    autoApprove: false,
  },
  {
    id: 'task-013',
    creatorId: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    title: 'Create a Meme About Our Brand',
    description: 'Create a funny and relatable meme related to the problems our software solves. Be creative! The top 10 memes will be awarded.',
    reward: 12.00,
    type: TaskType.CONTENT_CREATION,
    project: { name: 'User 0x709...c79C8' },
    completionsNeeded: 10,
    completionsDone: 1,
    proofType: ProofType.IMAGE,
    proofQuestion: 'Upload your meme image here.',
    autoApprove: false,
  },
  {
    id: 'task-014',
    creatorId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    title: 'Suggest 5 New Feature Ideas',
    description: 'Explore our current application and suggest 5 new, innovative features that you think would improve the user experience.',
    reward: 8.00,
    type: TaskType.CONTENT_CREATION,
    project: { name: 'User 0xf39...92266' },
    completionsNeeded: 40,
    completionsDone: 15,
    proofType: ProofType.TEXT,
    proofQuestion: 'List your 5 feature ideas with a brief explanation for each.',
    autoApprove: false,
  },
  {
    id: 'task-015',
    creatorId: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    title: 'Design a Simple Banner',
    description: 'Design a simple promotional banner (1200x628 pixels) for our upcoming summer sale. Must include our logo (provided) and the text "Summer Sale".',
    reward: 25.00,
    type: TaskType.CONTENT_CREATION,
    project: { name: 'User 0x709...c79C8' },
    completionsNeeded: 5,
    completionsDone: 0,
    proofType: ProofType.IMAGE,
    proofQuestion: 'Upload your banner design as a JPG or PNG.',
    autoApprove: false,
  },
   {
    id: 'task-020',
    creatorId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    title: 'Record a 30-Second Video Testimonial',
    description: 'Record a short (30 seconds max) vertical video of yourself talking about your positive experience with our platform. Good lighting is a plus!',
    reward: 20.00,
    type: TaskType.CONTENT_CREATION,
    project: { name: 'User 0xf39...92266' },
    completionsNeeded: 15,
    completionsDone: 3,
    proofType: ProofType.LINK,
    proofQuestion: 'Upload your video to Google Drive, Dropbox, or YouTube (unlisted) and provide the shareable link.',
    autoApprove: false,
  },
  {
    id: 'task-016',
    creatorId: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    title: 'Rate our New Podcast Episode',
    description: 'Listen to the latest 20-minute episode of our podcast and provide a rating out of 5 stars, along with a short comment on what you liked or disliked.',
    reward: 4.00,
    type: TaskType.FEEDBACK,
    project: { name: 'User 0x709...c79C8' },
    completionsNeeded: 100,
    completionsDone: 91,
    proofType: ProofType.TEXT,
    proofQuestion: 'What is your rating (1-5) and your brief feedback?',
    autoApprove: false,
  },
  {
    id: 'task-017',
    creatorId: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    title: 'Verify Addresses from a List',
    description: 'We have a list of 50 addresses. Please use Google Maps to verify if they appear to be valid residential or commercial locations.',
    reward: 10.00,
    type: TaskType.DATA_ENTRY,
    project: { name: 'User 0xf39...92266' },
    completionsNeeded: 20,
    completionsDone: 18,
    proofType: ProofType.TEXT,
    proofQuestion: 'List the ID numbers of any addresses that appear to be invalid or incorrect.',
    autoApprove: false,
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