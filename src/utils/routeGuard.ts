import { UserRole, User } from '../types';

export type RouteId =
  | 'landing'
  | 'how-it-works'
  | 'login'
  | 'admin-login'
  | 'register'
  | 'onboarding'
  | 'dashboard'
  | 'organizer-dashboard'
  | 'professional-dashboard'
  | 'events'
  | 'find-staff'
  | 'applications'
  | 'workforce'
  | 'attendance'
  | 'payments'
  | 'earnings'
  | 'find-jobs'
  | 'my-applications'
  | 'my-assignments'
  | 'assignments'
  | 'profile'
  | 'organizer-profile'
  | 'professional-profile'
  | 'admin-console'
  | 'admin-dashboard'
  | 'admin-verifications'
  | 'admin-users';

export interface RouteAccessResult {
  allowed: boolean;
  reason?: 'UNAUTHENTICATED' | 'ROLE_MISMATCH' | 'UNKNOWN_ROUTE';
  requiredRole?: UserRole | 'AUTHENTICATED';
  redirectRoute?: string;
  message?: string;
}

// Public routes accessible without authentication
const PUBLIC_ROUTES = new Set<string>([
  'landing',
  'how-it-works',
  'login',
  'admin-login',
  'register',
]);

// Routes exclusive to Event Organizers
const ORGANIZER_ROUTES = new Set<string>([
  'organizer-dashboard',
  'events',
  'find-staff',
  'applications',
  'workforce',
  'payments',
  'organizer-profile',
]);

// Routes exclusive to Event Professionals
const PROFESSIONAL_ROUTES = new Set<string>([
  'professional-dashboard',
  'find-jobs',
  'my-applications',
  'my-assignments',
  'assignments',
  'earnings',
  'professional-profile',
]);

// Routes exclusive to Admins
const ADMIN_ROUTES = new Set<string>([
  'admin-console',
  'admin-dashboard',
  'admin-verifications',
  'admin-users',
]);

/**
 * Validates whether the given user has permission to access the requested route
 */
export function validateRouteAccess(
  route: string,
  user: User | null,
  activeRole: UserRole
): RouteAccessResult {
  // Public routes are always accessible
  if (PUBLIC_ROUTES.has(route)) {
    return { allowed: true };
  }

  // If not authenticated, reject all non-public routes
  if (!user) {
    return {
      allowed: false,
      reason: 'UNAUTHENTICATED',
      requiredRole: 'AUTHENTICATED',
      redirectRoute: 'login',
      message: 'Authentication required. Please log in to access this portal section.',
    };
  }

  // Shared routes accessible by any authenticated user (their specific view is rendered based on role)
  if (route === 'dashboard' || route === 'profile' || route === 'attendance' || route === 'onboarding') {
    return { allowed: true };
  }

  // Organizer routes
  if (ORGANIZER_ROUTES.has(route)) {
    if (activeRole === 'ORGANIZER' || user.role === 'ORGANIZER' || user.role === 'ADMIN') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'ROLE_MISMATCH',
      requiredRole: 'ORGANIZER',
      redirectRoute: 'dashboard',
      message: 'Access restricted to Event Organizers. Professionals cannot manage events or workforce command.',
    };
  }

  // Professional routes
  if (PROFESSIONAL_ROUTES.has(route)) {
    if (activeRole === 'PROFESSIONAL' || user.role === 'PROFESSIONAL' || user.role === 'ADMIN') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'ROLE_MISMATCH',
      requiredRole: 'PROFESSIONAL',
      redirectRoute: 'dashboard',
      message: 'Access restricted to Event Professionals. Organizers cannot apply for jobs or view professional earnings.',
    };
  }

  // Admin routes
  if (ADMIN_ROUTES.has(route)) {
    if (activeRole === 'ADMIN' || user.role === 'ADMIN') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'ROLE_MISMATCH',
      requiredRole: 'ADMIN',
      redirectRoute: 'admin-login',
      message: 'Access restricted to StaffX Platform Administrators for governance and KYC compliance.',
    };
  }

  // Default allowed
  return { allowed: true };
}
