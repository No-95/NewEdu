export interface MetricStat {
  label: string;
  value: string;
  accent?: boolean;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  className: string;
  status: 'active' | 'inactive' | 'graduated';
  attendanceRate: number;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  classes: number;
  students: number;
  status: 'active' | 'on_leave';
}

export interface TrainingClass {
  id: string;
  name: string;
  teacher: string;
  schedule: string;
  students: number;
  capacity: number;
  completionRate: number;
}

export type LeadStage =
  | 'new_lead'
  | 'contacted'
  | 'interested'
  | 'trial_class'
  | 'enrolled';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  stage: LeadStage;
  followUpDate: string;
  notes: string;
}

export interface Partner {
  id: string;
  name: string;
  type: string;
  referrals: number;
  revenue: string;
  commission: string;
  status: 'active' | 'pending';
}

export interface Referral {
  id: string;
  partner: string;
  student: string;
  date: string;
  amount: string;
  status: 'converted' | 'pending';
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  format: string;
  uploadedBy: string;
  downloads: number;
  updatedAt: string;
}

export interface CareerProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  completionScore: number;
  education: { school: string; degree: string; year: string }[];
  skills: { name: string; level: number }[];
  certificates: { name: string; issuer: string; year: string }[];
  experience: { company: string; role: string; period: string; description: string }[];
  languages: { name: string; level: string }[];
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  industry: string;
  salary: string;
  jobType: 'full_time' | 'part_time' | 'contract' | 'remote';
  requirements: string[];
  applicationStatus?: 'applied' | 'reviewing' | 'interview' | 'offer' | 'rejected';
}

export interface CareerService {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
}

export interface ExpertConsultant {
  id: string;
  name: string;
  industry: string;
  country: string;
  expertise: string[];
  experience: string;
  fee: string;
  rating: number;
}

export interface CareerSession {
  id: string;
  service: string;
  expert: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface AiMatchResult {
  jobTitle: string;
  company: string;
  matchPercent: number;
}

export interface AiCourseRecommendation {
  title: string;
  provider: string;
  matchPercent: number;
}

export interface AiMentorRecommendation {
  name: string;
  specialty: string;
  matchPercent: number;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  applicants: number;
  status: 'open' | 'closed' | 'draft';
  postedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
  score: number;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  joinDate: string;
  status: 'active' | 'on_leave';
}

export interface Department {
  id: string;
  name: string;
  head: string;
  employees: number;
}

export interface PerformanceReview {
  id: string;
  employee: string;
  period: string;
  rating: number;
  status: 'draft' | 'completed';
}

export interface InternalCourse {
  id: string;
  title: string;
  enrolled: number;
  completed: number;
  compliance: boolean;
}

export interface ExpertProfile {
  id: string;
  name: string;
  avatarUrl: string;
  industry: string;
  country: string;
  biography: string;
  expertise: string[];
  experience: string;
  certifications: string[];
  rating: number;
}

export interface ExpertEvent {
  id: string;
  title: string;
  category: 'webinar' | 'workshop' | 'trade_forum' | 'networking';
  date: string;
  time: string;
  speakers: string[];
  registered: number;
  capacity: number;
  isOnline: boolean;
}
