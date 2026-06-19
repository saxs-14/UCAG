export interface Subject {
  name: string;
  mark: number;
}

export interface APSResult {
  standardAps: number;
  umpAps: number;
  subjectLevels: { name: string; mark: number; level: number }[];
  qualificationTier: 'bachelor' | 'diploma' | 'higher-cert' | 'none';
  qualificationLabel: string;
  qualificationDesc: string;
}

export interface CareerPath {
  id: string;
  title: string;
  faculty: string;
  minAps: number;
  requiredSubjectsDesc: string[];
  jobs: string[];
  salaryRange: string;
  demandMpumalanga: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  districtDemand: Record<string, 'CRITICAL' | 'HIGH' | 'MEDIUM'>;
}

export interface EligibilityCheck {
  label: string;
  met: boolean;
  detail: string;
}

export interface BursaryOption {
  name: string;
  provider: string;
  coverage: string;
  eligibility: string;
  url: string;
}

export interface LearnerProfile {
  _id?: string;
  firebaseUid: string;
  fullName: string;
  email: string;
  phone?: string;
  province: string;
  school?: string;
  grade?: number;
  subjects: Subject[];
  apsScore: number;
  careerInterests: string[];
  isAdopted: boolean;
  adoptedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MentorProfile {
  _id?: string;
  firebaseUid: string;
  fullName: string;
  email: string;
  umpStudentId: string;
  yearOfStudy: number;
  qualification: string;
  majorSubjects: string[];
  adoptedLearnersCount: number;
  maxLearners: number;
  impactScore: number;
  badges: string[];
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipMatch {
  _id?: string;
  learnerUid: string;
  mentorUid: string;
  learnerName: string;
  mentorName: string;
  subject: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export interface ThreadMessage {
  _id?: string;
  senderUid: string;
  recipientUid: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface SchoolRecord {
  _id?: string;
  schoolName: string;
  region: string;
  district: string;
  averageAps: number;
  readinessRate: number;
  totalLearners: number;
  bachelorCount: number;
  diplomaCount: number;
  subjectStruggles: { subjectName: string; strugglesCount: number }[];
  topCareerInterests: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type Language = 'en' | 'zu' | 'nso' | 'ts' | 'ss';
export type Theme = 'light' | 'dark';

export interface SavedCourse {
  courseId: string;
  courseTitle: string;
  savedAt: string;
}

export interface ApplicationStep {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string;
}

export interface ApplicationTracker {
  _id?: string;
  firebaseUid: string;
  savedCourses: SavedCourse[];
  steps: ApplicationStep[];
  apsSnapshot?: { subjects: { name: string; mark: number }[]; apsScore: number; savedAt: string };
  updatedAt: string;
}
