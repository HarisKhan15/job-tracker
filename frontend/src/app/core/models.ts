export type ApplicationStatus = 'WISHLIST' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'GHOSTED';
export type JobType = 'WERKSTUDENT' | 'HIWI' | 'INTERNSHIP' | 'FULL_TIME' | 'OTHER';

export interface JobApplication {
  id: number;
  company: string;
  position: string;
  type: JobType;
  status: ApplicationStatus;
  location: string | null;
  jobUrl: string | null;
  appliedDate: string | null;   // yyyy-MM-dd
  followUpDate: string | null;  // yyyy-MM-dd
  contactPerson: string | null;
  contactEmail: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type JobApplicationRequest = Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>;

export const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'WISHLIST', label: 'Wishlist' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'GHOSTED', label: 'No reply' },
];

export const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'WERKSTUDENT', label: 'Werkstudent' },
  { value: 'HIWI', label: 'HiWi' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'OTHER', label: 'Other' },
];

export const statusLabel = (s: ApplicationStatus) => STATUSES.find(x => x.value === s)?.label ?? s;
export const typeLabel = (t: JobType) => JOB_TYPES.find(x => x.value === t)?.label ?? t;
