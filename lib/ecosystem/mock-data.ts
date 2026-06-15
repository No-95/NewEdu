import type {
  AiCourseRecommendation,
  AiMatchResult,
  AiMentorRecommendation,
  Candidate,
  CareerProfile,
  CareerService,
  CareerSession,
  ChartPoint,
  Department,
  Employee,
  ExpertEvent,
  ExpertProfile,
  InternalCourse,
  JobListing,
  JobPosting,
  Lead,
  MetricStat,
  ModuleItem,
  Partner,
  PerformanceReview,
  Referral,
  Resource,
  Student,
  Teacher,
  TrainingClass,
} from './types';

export const TRAINING_METRICS: MetricStat[] = [
  { label: 'Tổng học viên', value: '1,248', accent: true },
  { label: 'Lớp đang hoạt động', value: '36' },
  { label: 'Giáo viên', value: '28' },
  { label: 'Tỷ lệ điểm danh', value: '94.2%' },
  { label: 'Hoàn thành khóa', value: '87.5%', accent: true },
];

export const TRAINING_MODULES: ModuleItem[] = [
  { id: 'students', title: 'Quản lý học viên', description: 'Hồ sơ, tiến độ và phân lớp' },
  { id: 'teachers', title: 'Quản lý giáo viên', description: 'Phân công và lịch dạy' },
  { id: 'classes', title: 'Quản lý lớp học', description: 'Lịch học và sĩ số' },
  { id: 'attendance', title: 'Điểm danh', description: 'Theo dõi chuyên cần' },
  { id: 'grades', title: 'Quản lý điểm', description: 'Bảng điểm và đánh giá' },
  { id: 'scheduling', title: 'Lịch khóa học', description: 'Xếp lịch và phòng học' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Nguyễn Minh Anh', email: 'minhanh@email.com', className: 'IELTS 7.0 - T2', status: 'active', attendanceRate: 96 },
  { id: 's2', name: 'Trần Quốc Bảo', email: 'qbao@email.com', className: 'TOEIC 800 - T1', status: 'active', attendanceRate: 88 },
  { id: 's3', name: 'Lê Thị Hương', email: 'huong.le@email.com', className: 'Tiếng Hàn A2', status: 'active', attendanceRate: 92 },
  { id: 's4', name: 'Phạm Đức Kiên', email: 'kien.p@email.com', className: 'Lập trình Web', status: 'inactive', attendanceRate: 71 },
  { id: 's5', name: 'Hoàng Mai Linh', email: 'linh.h@email.com', className: 'Kế toán thực hành', status: 'graduated', attendanceRate: 98 },
];

export const MOCK_TEACHERS: Teacher[] = [
  { id: 't1', name: 'TS. Vũ Thanh Hà', subject: 'IELTS', classes: 4, students: 68, status: 'active' },
  { id: 't2', name: 'ThS. Đỗ Minh Tuấn', subject: 'TOEIC', classes: 3, students: 52, status: 'active' },
  { id: 't3', name: 'Nguyễn Thu Trang', subject: 'Tiếng Hàn', classes: 2, students: 34, status: 'active' },
  { id: 't4', name: 'Lê Hoàng Nam', subject: 'Lập trình', classes: 3, students: 45, status: 'on_leave' },
];

export const MOCK_CLASSES: TrainingClass[] = [
  { id: 'c1', name: 'IELTS 7.0 - T2', teacher: 'TS. Vũ Thanh Hà', schedule: 'T2, T4, T6 · 18:00', students: 18, capacity: 20, completionRate: 89 },
  { id: 'c2', name: 'TOEIC 800 - T1', teacher: 'ThS. Đỗ Minh Tuấn', schedule: 'T3, T5 · 19:30', students: 16, capacity: 18, completionRate: 84 },
  { id: 'c3', name: 'Tiếng Hàn A2', teacher: 'Nguyễn Thu Trang', schedule: 'T7 · 09:00', students: 14, capacity: 16, completionRate: 91 },
  { id: 'c4', name: 'Lập trình Web Fullstack', teacher: 'Lê Hoàng Nam', schedule: 'T2, T5 · 20:00', students: 22, capacity: 24, completionRate: 76 },
];

export const CRM_METRICS: MetricStat[] = [
  { label: 'Lead mới (tháng)', value: '142', accent: true },
  { label: 'Tỷ lệ chuyển đổi', value: '28.4%' },
  { label: 'Doanh thu tuyển sinh', value: '485M ₫', accent: true },
  { label: 'Cần follow-up', value: '23' },
];

export const LEAD_STAGES = [
  { key: 'new_lead', label: 'Lead mới' },
  { key: 'contacted', label: 'Đã liên hệ' },
  { key: 'interested', label: 'Quan tâm' },
  { key: 'trial_class', label: 'Học thử' },
  { key: 'enrolled', label: 'Đã ghi danh' },
] as const;

export const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'Võ Thị Lan', phone: '0901 234 567', source: 'Facebook Ads', stage: 'new_lead', followUpDate: '2026-06-10', notes: 'Quan tâm khóa IELTS' },
  { id: 'l2', name: 'Bùi Hữu Phúc', phone: '0912 345 678', source: 'Website', stage: 'contacted', followUpDate: '2026-06-09', notes: 'Đã gọi, hẹn tư vấn' },
  { id: 'l3', name: 'Đặng Kim Ngân', phone: '0987 654 321', source: 'Giới thiệu', stage: 'interested', followUpDate: '2026-06-11', notes: 'Muốn học thử TOEIC' },
  { id: 'l4', name: 'Ngô Văn Đạt', phone: '0933 221 100', source: 'Zalo OA', stage: 'trial_class', followUpDate: '2026-06-12', notes: 'Học thử T7 14:00' },
  { id: 'l5', name: 'Trịnh Bảo Châu', phone: '0909 888 777', source: 'Hội thảo', stage: 'enrolled', followUpDate: '—', notes: 'Đã đóng học phí khóa A2' },
  { id: 'l6', name: 'Lý Minh Quân', phone: '0977 112 233', source: 'Google Ads', stage: 'contacted', followUpDate: '2026-06-10', notes: 'Hỏi về lịch buổi tối' },
];

export const LEAD_SOURCE_CHART: ChartPoint[] = [
  { label: 'Facebook', value: 38 },
  { label: 'Website', value: 24 },
  { label: 'Giới thiệu', value: 18 },
  { label: 'Zalo', value: 12 },
  { label: 'Khác', value: 8 },
];

export const BUSINESS_METRICS: MetricStat[] = [
  { label: 'Doanh thu tháng', value: '1.2B ₫', accent: true },
  { label: 'Đối tác hoạt động', value: '34' },
  { label: 'Tỷ lệ chuyển đổi', value: '31.2%' },
  { label: 'Hoa hồng tháng', value: '186M ₫' },
];

export const MOCK_PARTNERS: Partner[] = [
  { id: 'p1', name: 'EduLink Việt Nam', type: 'Affiliate', referrals: 48, revenue: '320M ₫', commission: '48M ₫', status: 'active' },
  { id: 'p2', name: 'Study Abroad Hub', type: 'Đại lý', referrals: 22, revenue: '185M ₫', commission: '27M ₫', status: 'active' },
  { id: 'p3', name: 'SmartEdu Partners', type: 'Franchise', referrals: 15, revenue: '142M ₫', commission: '21M ₫', status: 'active' },
  { id: 'p4', name: 'Global Path Co.', type: 'Affiliate', referrals: 6, revenue: '38M ₫', commission: '5.7M ₫', status: 'pending' },
];

export const MOCK_REFERRALS: Referral[] = [
  { id: 'r1', partner: 'EduLink Việt Nam', student: 'Nguyễn Minh Anh', date: '2026-05-28', amount: '12M ₫', status: 'converted' },
  { id: 'r2', partner: 'Study Abroad Hub', student: 'Trần Quốc Bảo', date: '2026-06-02', amount: '8.5M ₫', status: 'converted' },
  { id: 'r3', partner: 'SmartEdu Partners', student: 'Lê Thị Hương', date: '2026-06-05', amount: '9M ₫', status: 'pending' },
];

export const REVENUE_CHART: ChartPoint[] = [
  { label: 'T1', value: 820 },
  { label: 'T2', value: 940 },
  { label: 'T3', value: 880 },
  { label: 'T4', value: 1020 },
  { label: 'T5', value: 1150 },
  { label: 'T6', value: 1200 },
];

export const REPORTING_METRICS: MetricStat[] = [
  { label: 'Doanh thu tháng', value: '1.2B ₫', accent: true },
  { label: 'Học viên mới', value: '+86' },
  { label: 'Hoàn thành khóa', value: '87.5%' },
  { label: 'Đánh giá GV', value: '4.7/5' },
];

export const STUDENT_GROWTH_CHART: ChartPoint[] = [
  { label: 'T1', value: 980 },
  { label: 'T2', value: 1020 },
  { label: 'T3', value: 1080 },
  { label: 'T4', value: 1120 },
  { label: 'T5', value: 1180 },
  { label: 'T6', value: 1248 },
];

export const COMPLETION_CHART: ChartPoint[] = [
  { label: 'IELTS', value: 89 },
  { label: 'TOEIC', value: 84 },
  { label: 'Tiếng Hàn', value: 91 },
  { label: 'Lập trình', value: 76 },
  { label: 'Kế toán', value: 88 },
];

export const MOCK_RESOURCES: Resource[] = [
  { id: 'res1', title: 'Giáo án IELTS Speaking Unit 5', category: 'Lesson Plans', format: 'PDF', uploadedBy: 'TS. Vũ Thanh Hà', downloads: 124, updatedAt: '2026-06-01' },
  { id: 'res2', title: 'Slide TOEIC Listening Part 3', category: 'Teaching Materials', format: 'PPTX', uploadedBy: 'ThS. Đỗ Minh Tuấn', downloads: 89, updatedAt: '2026-05-28' },
  { id: 'res3', title: 'Mẫu hợp đồng học viên', category: 'Contracts', format: 'DOCX', uploadedBy: 'Phòng Đào tạo', downloads: 56, updatedAt: '2026-05-15' },
  { id: 'res4', title: 'Checklist onboarding giáo viên', category: 'Training Guides', format: 'PDF', uploadedBy: 'HR Center', downloads: 42, updatedAt: '2026-05-10' },
  { id: 'res5', title: 'Template báo cáo tháng', category: 'Templates', format: 'XLSX', uploadedBy: 'Ban quản lý', downloads: 67, updatedAt: '2026-06-03' },
];

export const RESOURCE_CATEGORIES = [
  'Lesson Plans',
  'Teaching Materials',
  'Templates',
  'Contracts',
  'Training Guides',
];

export const MOCK_CAREER_PROFILE: CareerProfile = {
  fullName: 'Nguyễn Thị Mai',
  email: 'mai.nguyen@email.com',
  phone: '0903 456 789',
  location: 'Hà Nội, Việt Nam',
  headline: 'Chuyên viên Marketing số · 3 năm kinh nghiệm',
  completionScore: 78,
  education: [
    { school: 'ĐH Kinh tế Quốc dân', degree: 'Cử nhân Marketing', year: '2022' },
    { school: 'HDP EDU', degree: 'Chứng chỉ Digital Marketing', year: '2024' },
  ],
  skills: [
    { name: 'SEO/SEM', level: 85 },
    { name: 'Content Marketing', level: 80 },
    { name: 'Google Analytics', level: 75 },
    { name: 'Social Media', level: 90 },
  ],
  certificates: [
    { name: 'Google Ads Search', issuer: 'Google', year: '2024' },
    { name: 'Meta Blueprint', issuer: 'Meta', year: '2023' },
  ],
  experience: [
    { company: 'BrightAds Agency', role: 'Marketing Executive', period: '2023 – nay', description: 'Quản lý chiến dịch quảng cáo đa kênh' },
    { company: 'Nova Retail', role: 'Marketing Intern', period: '2022 – 2023', description: 'Hỗ trợ content và social media' },
  ],
  languages: [
    { name: 'Tiếng Việt', level: 'Bản ngữ' },
    { name: 'Tiếng Anh', level: 'IELTS 6.5' },
  ],
};

export const MOCK_JOB_LISTINGS: JobListing[] = [];

export const CAREER_SERVICES: CareerService[] = [
  { id: 'cv', name: 'Review CV', description: 'Chuyên gia HR đánh giá và tối ưu CV', duration: '45 phút', price: '299.000 ₫' },
  { id: 'interview', name: 'Phỏng vấn thử', description: 'Mock interview với feedback chi tiết', duration: '60 phút', price: '499.000 ₫' },
  { id: 'consult', name: 'Tư vấn nghề nghiệp', description: 'Định hướng lộ trình phát triển', duration: '90 phút', price: '699.000 ₫' },
];

export const CAREER_EXPERTS = [
  { id: 'e1', name: 'Nguyễn Thị Hạnh', specialty: 'HR & Recruitment' },
  { id: 'e2', name: 'Trần Minh Đức', specialty: 'Tech Career' },
  { id: 'e3', name: 'Lê Phương Anh', specialty: 'Marketing & Brand' },
];

export const MOCK_SESSIONS: CareerSession[] = [
  { id: 'sess1', service: 'Review CV', expert: 'Nguyễn Thị Hạnh', date: '2026-06-12', time: '14:00', status: 'upcoming' },
  { id: 'sess2', service: 'Phỏng vấn thử', expert: 'Trần Minh Đức', date: '2026-06-05', time: '10:00', status: 'completed' },
];

export const AI_MATCH_JOBS: AiMatchResult[] = [
  { jobTitle: 'Digital Marketing Specialist', company: 'FPT Digital', matchPercent: 92 },
  { jobTitle: 'Content Creator', company: 'Vingroup Media', matchPercent: 87 },
  { jobTitle: 'Growth Marketing Lead', company: 'Tiki', matchPercent: 81 },
];

export const AI_MATCH_COURSES: AiCourseRecommendation[] = [
  { title: 'Advanced Google Ads', provider: 'HDP EDU', matchPercent: 94 },
  { title: 'Data Analytics for Marketers', provider: 'HDP EDU', matchPercent: 88 },
  { title: 'Content Strategy Masterclass', provider: 'HDP EDU', matchPercent: 85 },
];

export const AI_MATCH_MENTORS: AiMentorRecommendation[] = [
  { name: 'Lê Phương Anh', specialty: 'Digital Marketing', matchPercent: 91 },
  { name: 'Phạm Quốc Huy', specialty: 'Growth & SEO', matchPercent: 86 },
];

export const RECRUITMENT_METRICS: MetricStat[] = [
  { label: 'Vị trí đang tuyển', value: '12', accent: true },
  { label: 'Hồ sơ nhận được', value: '284' },
  { label: 'Đang phỏng vấn', value: '18' },
  { label: 'Offer chờ duyệt', value: '4' },
];

export const MOCK_JOB_POSTINGS: JobPosting[] = [
  { id: 'jp1', title: 'Senior Frontend Developer', department: 'Engineering', applicants: 42, status: 'open', postedAt: '2026-05-20' },
  { id: 'jp2', title: 'Product Manager', department: 'Product', applicants: 28, status: 'open', postedAt: '2026-05-25' },
  { id: 'jp3', title: 'HR Business Partner', department: 'HR', applicants: 15, status: 'open', postedAt: '2026-06-01' },
  { id: 'jp4', title: 'Sales Executive', department: 'Sales', applicants: 56, status: 'closed', postedAt: '2026-04-10' },
];

export const MOCK_CANDIDATES: Candidate[] = [
  { id: 'ca1', name: 'Hoàng Văn Long', position: 'Senior Frontend Developer', stage: 'interview', score: 88 },
  { id: 'ca2', name: 'Đỗ Thị Ngọc', position: 'Product Manager', stage: 'screening', score: 82 },
  { id: 'ca3', name: 'Phan Minh Tuấn', position: 'Senior Frontend Developer', stage: 'offer', score: 91 },
  { id: 'ca4', name: 'Vũ Lan Chi', position: 'HR Business Partner', stage: 'applied', score: 76 },
];

export const HR_METRICS: MetricStat[] = [
  { label: 'Nhân viên', value: '156' },
  { label: 'Phòng ban', value: '8' },
  { label: 'Đánh giá quý', value: '42' },
  { label: 'Tỷ lệ giữ chân', value: '94%' },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'em1', name: 'Nguyễn Văn Hùng', department: 'Engineering', role: 'Tech Lead', joinDate: '2021-03-15', status: 'active' },
  { id: 'em2', name: 'Trần Thị Mai', department: 'HR', role: 'HR Manager', joinDate: '2020-08-01', status: 'active' },
  { id: 'em3', name: 'Lê Quang Huy', department: 'Sales', role: 'Sales Director', joinDate: '2019-11-20', status: 'active' },
  { id: 'em4', name: 'Phạm Thu Hà', department: 'Marketing', role: 'CMO', joinDate: '2022-01-10', status: 'on_leave' },
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Engineering', head: 'Nguyễn Văn Hùng', employees: 48 },
  { id: 'd2', name: 'Product', head: 'Đỗ Minh Khang', employees: 22 },
  { id: 'd3', name: 'Sales', head: 'Lê Quang Huy', employees: 34 },
  { id: 'd4', name: 'HR', head: 'Trần Thị Mai', employees: 12 },
];

export const MOCK_REVIEWS: PerformanceReview[] = [
  { id: 'rv1', employee: 'Nguyễn Văn Hùng', period: 'Q2 2026', rating: 4.8, status: 'completed' },
  { id: 'rv2', employee: 'Trần Thị Mai', period: 'Q2 2026', rating: 4.6, status: 'completed' },
  { id: 'rv3', employee: 'Lê Quang Huy', period: 'Q2 2026', rating: 4.2, status: 'draft' },
];

export const TRAINING_LMS_METRICS: MetricStat[] = [
  { label: 'Hoàn thành đào tạo', value: '82%', accent: true },
  { label: 'Khóa nội bộ', value: '24' },
  { label: 'Chứng chỉ cấp', value: '118' },
  { label: 'Tuân thủ', value: '96%' },
];

export const MOCK_INTERNAL_COURSES: InternalCourse[] = [
  { id: 'ic1', title: 'Onboarding nhân viên mới', enrolled: 45, completed: 42, compliance: true },
  { id: 'ic2', title: 'An toàn thông tin', enrolled: 156, completed: 148, compliance: true },
  { id: 'ic3', title: 'Kỹ năng lãnh đạo', enrolled: 28, completed: 18, compliance: false },
  { id: 'ic4', title: 'Excel nâng cao', enrolled: 62, completed: 55, compliance: false },
];

export const MOCK_EXPERTS: ExpertProfile[] = [
  {
    id: 'ex1',
    name: 'PGS.TS Nguyễn Đình Tuấn',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=faces&fit=crop&w=256&h=256&q=80',
    industry: 'Giáo dục',
    country: 'Việt Nam',
    biography: '30 năm kinh nghiệm đào tạo và tư vấn chiến lược giáo dục. Cựu Hiệu trưởng, cố vấn cho hơn 40 trung tâm đào tạo tại Việt Nam và khu vực.',
    expertise: ['Chiến lược đào tạo', 'Quản trị trung tâm', 'EdTech'],
    experience: '30 năm',
    certifications: ['PhD Education Leadership', 'Cambridge DELTA'],
    rating: 4.9,
  },
  {
    id: 'ex2',
    name: 'Dr. Sarah Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=faces&fit=crop&w=256&h=256&q=80',
    industry: 'Công nghệ',
    country: 'Singapore',
    biography: 'Chuyên gia AI và chuyển đổi số doanh nghiệp tại APAC. Từng dẫn dắt các dự án công nghệ quy mô lớn cho tập đoàn đa quốc gia.',
    expertise: ['AI Strategy', 'Digital Transformation', 'Product Innovation'],
    experience: '18 năm',
    certifications: ['AWS Solutions Architect', 'MIT AI Program'],
    rating: 4.8,
  },
  {
    id: 'ex3',
    name: 'Trần Hoàng Long',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?crop=faces&fit=crop&w=256&h=256&q=80',
    industry: 'Tài chính',
    country: 'Việt Nam',
    biography: 'Cựu Giám đốc đầu tư tại quỹ đầu tư tư nhân, chuyên tư vấn M&A, quản trị rủi ro và chiến lược tài chính doanh nghiệp.',
    expertise: ['Đầu tư', 'M&A', 'Risk Management'],
    experience: '22 năm',
    certifications: ['CFA', 'FRM'],
    rating: 4.7,
  },
  {
    id: 'ex4',
    name: 'Prof. Kim Min-jae',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=faces&fit=crop&w=256&h=256&q=80',
    industry: 'Xuất khẩu lao động',
    country: 'Hàn Quốc',
    biography: 'Giáo sư tư vấn việc làm và định cư nghề nghiệp tại Hàn Quốc. Hỗ trợ hàng nghìn lao động Việt Nam làm việc tại các doanh nghiệp Hàn.',
    expertise: ['EPS', 'Visa E-7', 'Korean Workplace Culture'],
    experience: '15 năm',
    certifications: ['TOPIK Level 6', 'Korean Employment Law Certificate'],
    rating: 4.6,
  },
  {
    id: 'ex5',
    name: 'Dr. Park Ji-hoon',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=faces&fit=crop&w=256&h=256&q=80',
    industry: 'Giáo dục',
    country: 'Hàn Quốc',
    biography: 'Tiến sĩ Ngôn ngữ học, chuyên gia đào tạo tiếng Hàn cho người Việt. Phát triển chương trình TOPIK và giáo trình giao tiếp thực tế.',
    expertise: ['TOPIK Preparation', 'Korean Linguistics', 'Curriculum Design'],
    experience: '12 năm',
    certifications: ['PhD Korean Linguistics', 'TOPIK Examiner'],
    rating: 4.9,
  },
  {
    id: 'ex6',
    name: 'Lê Phương Anh',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=faces&fit=crop&w=256&h=256&q=80',
    industry: 'Nhân sự',
    country: 'Việt Nam',
    biography: 'Cựu Giám đốc Nhân sự tại tập đoàn đa quốc gia, chuyên tư vấn tuyển dụng, phát triển năng lực và xây dựng văn hóa doanh nghiệp.',
    expertise: ['Talent Acquisition', 'Employer Branding', 'HR Strategy'],
    experience: '16 năm',
    certifications: ['SHRM-SCP', 'CIPD Level 7'],
    rating: 4.8,
  },
  {
    id: 'ex7',
    name: 'James Morrison',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=faces&fit=crop&w=256&h=256&q=80',
    industry: 'Ngoại thương',
    country: 'Singapore',
    biography: 'Chuyên gia thương mại quốc tế với kinh nghiệm xây dựng chuỗi cung ứng Việt Nam – ASEAN – Hàn Quốc cho doanh nghiệp SME.',
    expertise: ['Import/Export', 'Supply Chain', 'Trade Compliance'],
    experience: '20 năm',
    certifications: ['CITP', 'Incoterms 2020 Certified'],
    rating: 4.7,
  },
  {
    id: 'ex8',
    name: 'Ngô Minh Khang',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=faces&fit=crop&w=256&h=256&q=80',
    industry: 'Luật',
    country: 'Việt Nam',
    biography: 'Luật sư tư vấn pháp lý lao động, định cư và hợp đồng quốc tế. Hỗ trợ doanh nghiệp và cá nhân trong các thủ tục xuất khẩu lao động.',
    expertise: ['Labor Law', 'Immigration', 'International Contracts'],
    experience: '14 năm',
    certifications: ['Bar Association VN', 'ILO Labor Standards'],
    rating: 4.6,
  },
  {
    id: 'ex9',
    name: 'Dr. Yuki Tanaka',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?crop=faces&fit=crop&w=256&h=256&q=80',
    industry: 'Công nghệ',
    country: 'Nhật Bản',
    biography: 'Kỹ sư trưởng với kinh nghiệm phát triển sản phẩm công nghệ giáo dục tại Tokyo. Tư vấn EdTech và trải nghiệm học tập số.',
    expertise: ['EdTech Product', 'UX for Learning', 'SaaS Growth'],
    experience: '11 năm',
    certifications: ['PMP', 'Google UX Design'],
    rating: 4.8,
  },
  {
    id: 'ex10',
    name: 'Phạm Thu Hà',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=faces&fit=crop&w=256&h=256&q=80',
    industry: 'Giáo dục',
    country: 'Việt Nam',
    biography: 'Chuyên gia thiết kế chương trình đào tạo tiếng Hàn cho doanh nghiệp. Đã triển khai chương trình đào tạo nội bộ cho 25+ công ty.',
    expertise: ['Corporate Training', 'Korean for Business', 'Learning Design'],
    experience: '10 năm',
    certifications: ['TOPIK Level 5', 'Instructional Design Certificate'],
    rating: 4.7,
  },
  {
    id: 'ex11',
    name: 'Dr. Elena Vasquez',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=faces&fit=crop&w=256&h=256&q=80',
    industry: 'Ngoại thương',
    country: 'Việt Nam',
    biography: 'Cố vấn thương mại và phát triển thị trường, chuyên kết nối doanh nghiệp Việt với đối tác Hàn Quốc và châu Âu.',
    expertise: ['Market Entry', 'B2B Partnerships', 'Cross-border Trade'],
    experience: '13 năm',
    certifications: ['MBA International Business', 'KOTRA Trade Advisor'],
    rating: 4.9,
  },
  {
    id: 'ex12',
    name: 'Hoàng Quốc Bảo',
    avatarUrl: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?crop=faces&fit=crop&w=256&h=256&q=80',
    industry: 'Nhân sự',
    country: 'Hàn Quốc',
    biography: 'Chuyên gia tuyển dụng và hội nhập lao động Việt tại Hàn Quốc. Tư vấn hồ sơ, phỏng vấn và thích nghi môi trường làm việc.',
    expertise: ['Korean Job Market', 'CV & Interview', 'Cultural Integration'],
    experience: '9 năm',
    certifications: ['TOPIK Level 6', 'Career Coach Certification'],
    rating: 4.5,
  },
];

export const MOCK_EVENTS: ExpertEvent[] = [
  { id: 'ev1', title: 'Xu hướng EdTech 2026', category: 'webinar', date: '2026-06-15', time: '19:00', speakers: ['PGS.TS Nguyễn Đình Tuấn'], registered: 186, capacity: 300, isOnline: true },
  { id: 'ev2', title: 'Workshop: AI cho Doanh nghiệp SME', category: 'workshop', date: '2026-06-20', time: '09:00', speakers: ['Dr. Sarah Chen', 'Trần Hoàng Long'], registered: 42, capacity: 50, isOnline: false },
  { id: 'ev3', title: 'Diễn đàn Xuất khẩu lao động Hàn Quốc', category: 'trade_forum', date: '2026-07-05', time: '14:00', speakers: ['Prof. Kim Min-jae'], registered: 320, capacity: 500, isOnline: true },
  { id: 'ev4', title: 'Networking: Founders & Investors', category: 'networking', date: '2026-06-28', time: '18:30', speakers: ['Trần Hoàng Long'], registered: 68, capacity: 80, isOnline: false },
];

export const EVENT_CATEGORY_LABELS: Record<ExpertEvent['category'], string> = {
  webinar: 'Webinar',
  workshop: 'Workshop',
  trade_forum: 'Diễn đàn',
  networking: 'Networking',
};

export const JOB_TYPE_LABELS: Record<JobListing['jobType'], string> = {
  full_time: 'Toàn thời gian',
  part_time: 'Bán thời gian',
  contract: 'Hợp đồng',
  remote: 'Remote',
};

export const APPLICATION_STATUS_LABELS: Record<NonNullable<JobListing['applicationStatus']>, string> = {
  applied: 'Đã ứng tuyển',
  reviewing: 'Đang xem xét',
  interview: 'Phỏng vấn',
  offer: 'Offer',
  rejected: 'Từ chối',
};
