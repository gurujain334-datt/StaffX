export type UserRole = 'ORGANIZER' | 'PROFESSIONAL' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type RequirementStatus = 'DRAFT' | 'PUBLISHED' | 'FILLED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'CANCELLED';

export type AssignmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type AttendanceStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizerProfile {
  id: string;
  userId: string;
  organizationName: string;
  organizationType: string;
  description: string;
  location: string;
  website?: string;
  completedEventsCount: number;
  rating: number;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  name: string;
  skills: string[];
  primaryCategory: string;
  experienceYears: number;
  location: string;
  availability: 'Available' | 'Busy' | 'Weekends Only';
  hourlyRate: number;
  rating: number;
  completedJobsCount: number;
  verificationStatus: VerificationStatus;
  bio: string;
  profileImage?: string;
  phone?: string;
  createdAt: string;
}

export interface StaffingRequirement {
  id: string;
  eventId: string;
  role: string;
  requiredQuantity: number;
  filledQuantity: number;
  payAmount: number;
  requiredSkills: string[];
  experienceRequired?: string;
  shiftStart: string;
  shiftEnd: string;
  description: string;
  status: RequirementStatus;
  createdAt: string;
}

export interface EventItem {
  id: string;
  organizerId: string;
  organizerName: string;
  name: string;
  eventType: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  description: string;
  status: EventStatus;
  imageUrl?: string;
  qrCodeToken: string;
  createdAt: string;
  updatedAt: string;
  requirements?: StaffingRequirement[];
}

export type Event = EventItem;

export interface Application {
  id: string;
  requirementId: string;
  eventId: string;
  professionalId: string;
  professionalName: string;
  professionalRating: number;
  professionalExperience: number;
  professionalVerified: boolean;
  role: string;
  status: ApplicationStatus;
  message?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  requirementId: string;
  eventId: string;
  professionalId: string;
  professionalName: string;
  role: string;
  status: AssignmentStatus;
  agreedRate: number;
  assignedAt: string;
  completedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  assignmentId: string;
  eventId: string;
  professionalId: string;
  professionalName: string;
  role: string;
  checkInAt?: string;
  checkOutAt?: string;
  status: AttendanceStatus;
  durationFormatted?: string;
  verificationMethod?: 'QR_SCAN' | 'MANUAL_OVERRIDE';
}

export interface PaymentRecord {
  id: string;
  assignmentId: string;
  eventId: string;
  eventName: string;
  organizerId: string;
  professionalId: string;
  professionalName: string;
  role: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionReference?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  assignmentId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: UserRole;
  reviewedUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  type: 'APPLICATION' | 'HIRING' | 'ATTENDANCE' | 'PAYMENT' | 'VERIFICATION' | 'SYSTEM';
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

export interface SmartMatchResult {
  professional: ProfessionalProfile;
  matchScore: number;
  breakdown: {
    skillMatch: boolean;
    locationMatch: boolean;
    availabilityMatch: boolean;
    experienceMatch: boolean;
    ratingMatch: boolean;
  };
  explanation: string;
}
