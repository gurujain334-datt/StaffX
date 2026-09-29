import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ColorTheme, COLOR_THEMES } from '../lib/theme';
import {
  User,
  UserRole,
  EventItem,
  StaffingRequirement,
  ProfessionalProfile,
  OrganizerProfile,
  Application,
  Assignment,
  AttendanceRecord,
  PaymentRecord,
  Review,
  NotificationItem
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ORGANIZER_PROFILE,
  INITIAL_PROFESSIONALS,
  INITIAL_EVENTS,
  INITIAL_REQUIREMENTS,
  INITIAL_APPLICATIONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_PAYMENTS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import { isSupabaseConfigured, checkSupabaseHealth } from '../services/supabaseClient';
import { authService } from '../services/authService';
import { eventService } from '../services/eventService';
import { staffingService } from '../services/staffingService';
import { applicationService } from '../services/applicationService';
import { hiringService } from '../services/hiringService';
import { notificationService } from '../services/notificationService';
import { attendanceService } from '../services/attendanceService';
import { paymentService } from '../services/paymentService';
import { reviewService } from '../services/reviewService';
import { profileService } from '../services/profileService';


export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  activeRole: UserRole;
  currentRoute: string;
  selectedEventId: string | null;
  selectedJobId: string | null;
  organizerProfile: OrganizerProfile;
  professionals: ProfessionalProfile[];
  currentProfessional: ProfessionalProfile;
  events: EventItem[];
  requirements: StaffingRequirement[];
  applications: Application[];
  assignments: Assignment[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
  reviews: Review[];
  notifications: NotificationItem[];
  toasts: ToastMessage[];

  // Theme & 7D state
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (colorTheme: ColorTheme) => void;
  spatial7DEnabled: boolean;
  toggle7D: () => void;

  // Navigation & role
  navigationHistory: string[];
  goBack: () => void;
  canGoBack: boolean;
  setCurrentRoute: (route: string) => void;
  setSelectedEventId: (id: string | null) => void;
  setSelectedJobId: (id: string | null) => void;
  switchRole: (role: UserRole) => void;
  loginUser: (email: string, role: UserRole, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    extraMetadata?: Record<string, unknown>
  ) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => void;

  // Backend & Supabase (Phase 2 Foundation)
  isSupabaseReady: boolean;
  isBackendLive: boolean;
  backendLatency: number | null;
  backendMessage: string;
  checkBackend: () => Promise<void>;
  isBackendModalOpen: boolean;
  setIsBackendModalOpen: (open: boolean) => void;


  // Actions
  createEvent: (eventData: Partial<EventItem>, initialRequirements?: Partial<StaffingRequirement>[]) => EventItem;
  addStaffRequirement: (requirementData: Partial<StaffingRequirement>) => StaffingRequirement;
  applyForJob: (requirementId: string, eventId: string, message?: string) => { success: boolean; error?: string };
  withdrawApplication: (appId: string) => { success: boolean; error?: string };
  updateApplicationStatus: (appId: string, status: Application['status']) => void;
  hireApplicant: (applicationId: string) => { success: boolean; error?: string };
  acceptOffer: (assignmentId: string) => void;
  recordCheckIn: (token: string) => { success: boolean; error?: string; record?: AttendanceRecord };
  recordCheckOut: (assignmentId: string) => { success: boolean; error?: string };
  completeEvent: (eventId: string) => void;
  cancelEvent: (eventId: string) => void;
  updatePaymentStatus: (paymentId: string, status: PaymentRecord['status']) => void;
  submitReview: (assignmentId: string, targetUserId: string, rating: number, comment: string) => void;
  verifyProfessional: (professionalId: string, status: 'VERIFIED' | 'REJECTED') => void;
  updateOrganizerProfile: (updates: Partial<OrganizerProfile>) => Promise<void> | void;
  updateProfessionalProfile: (updates: Partial<ProfessionalProfile>) => Promise<void> | void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addToast: (message: string, type?: ToastMessage['type'], title?: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const isLoggedOut = localStorage.getItem('staffx_explicit_logout');
      if (isLoggedOut === 'true') return null;

      const saved = localStorage.getItem('staffx_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USERS[0];
  });
  const [activeRole, setActiveRole] = useState<UserRole>('ORGANIZER');
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>('evt-1');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Theme Management (Default to dark theme as requested)
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('staffx_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  // Futuristic Color Theme Management (Cyber Cyan, Quantum Violet, Matrix Emerald, Solaris Amber, Cosmic Indigo)
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    try {
      const saved = localStorage.getItem('staffx_color_theme') as ColorTheme;
      if (saved && COLOR_THEMES[saved]) return saved;
    } catch {
      // ignore
    }
    return 'cyan';
  });

  // 7D Spatial Dynamic Transition Engine State
  const [spatial7DEnabled, setSpatial7DEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('staffx_7d_mode');
      if (saved !== null) return saved === 'true';
    } catch {
      // ignore
    }
    return true;
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('staffx_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('staffx_theme', 'light');
      }
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-color-theme', colorTheme);
      localStorage.setItem('staffx_color_theme', colorTheme);
    } catch {
      // ignore
    }
  }, [colorTheme]);

  useEffect(() => {
    try {
      localStorage.setItem('staffx_7d_mode', String(spatial7DEnabled));
    } catch {
      // ignore
    }
  }, [spatial7DEnabled]);

  const toggleTheme = () => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      addToast(`Switched to ${next === 'dark' ? 'Dark Futuristic' : 'Clean Light'} theme`, 'info', 'Theme Updated');
      return next;
    });
  };

  const setTheme = (t: 'dark' | 'light') => {
    setThemeState(t);
  };

  const setColorTheme = (newColorTheme: ColorTheme) => {
    setColorThemeState(newColorTheme);
    const themeDef = COLOR_THEMES[newColorTheme];
    addToast(`Colour palette activated: ${themeDef.name}`, 'info', 'Colour Theme');
  };

  const toggle7D = () => {
    setSpatial7DEnabled(prev => {
      const next = !prev;
      addToast(`7D Spatial Transition Engine: ${next ? 'Activated' : 'Standard 2D'}`, 'info', '7D Physics');
      return next;
    });
  };

  const navigateToRoute = (newRoute: string) => {
    if (newRoute === currentRoute) return;
    setNavigationHistory(prev => [...prev, currentRoute]);
    setCurrentRoute(newRoute);
  };

  const goBack = () => {
    if (navigationHistory.length > 0) {
      const prev = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(old => old.slice(0, -1));
      setCurrentRoute(prev);
    } else {
      // Smart Fallback
      if (currentRoute !== 'landing' && currentRoute !== 'dashboard') {
        setCurrentRoute('dashboard');
      } else if (currentRoute === 'dashboard') {
        setCurrentRoute('landing');
      }
    }
  };

  const canGoBack = navigationHistory.length > 0 || currentRoute !== 'landing';

  const [organizerProfileState, setOrganizerProfile] = useState<OrganizerProfile>(INITIAL_ORGANIZER_PROFILE);

  const organizerProfile = useMemo<OrganizerProfile>(() => {
    return {
      ...organizerProfileState,
      id: currentUser?.role === 'ORGANIZER' ? `org-${currentUser.id}` : organizerProfileState.id,
      contactPerson: currentUser?.role === 'ORGANIZER' ? currentUser.fullName : organizerProfileState.contactPerson,
      email: currentUser?.role === 'ORGANIZER' ? currentUser.email : organizerProfileState.email,
      phone: (currentUser?.role === 'ORGANIZER' && currentUser.phone) ? currentUser.phone : organizerProfileState.phone,
    };
  }, [organizerProfileState, currentUser]);

  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>(() => {
    try {
      const saved = localStorage.getItem('staffx_professionals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_PROFESSIONALS;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      const saved = localStorage.getItem('staffx_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_EVENTS;
  });

  const [requirements, setRequirements] = useState<StaffingRequirement[]>(() => {
    try {
      const saved = localStorage.getItem('staffx_requirements');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_REQUIREMENTS;
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const saved = localStorage.getItem('staffx_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_APPLICATIONS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem('staffx_assignments');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_ASSIGNMENTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem('staffx_attendance');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_ATTENDANCE;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state changes to localStorage for 100% data persistence guarantee
  useEffect(() => {
    try { localStorage.setItem('staffx_events', JSON.stringify(events)); } catch {}
  }, [events]);

  useEffect(() => {
    try { localStorage.setItem('staffx_requirements', JSON.stringify(requirements)); } catch {}
  }, [requirements]);

  useEffect(() => {
    try { localStorage.setItem('staffx_applications', JSON.stringify(applications)); } catch {}
  }, [applications]);

  useEffect(() => {
    try { localStorage.setItem('staffx_assignments', JSON.stringify(assignments)); } catch {}
  }, [assignments]);

  useEffect(() => {
    try { localStorage.setItem('staffx_attendance', JSON.stringify(attendance)); } catch {}
  }, [attendance]);

  useEffect(() => {
    try { localStorage.setItem('staffx_professionals', JSON.stringify(professionals)); } catch {}
  }, [professionals]);

  // Backend & Supabase Live State (Phase 2 Foundation)
  const [isSupabaseReady] = useState<boolean>(isSupabaseConfigured());
  const [isBackendLive, setIsBackendLive] = useState<boolean>(false);
  const [backendLatency, setBackendLatency] = useState<number | null>(null);
  const [backendMessage, setBackendMessage] = useState<string>('Checking backend connection...');
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);

  const checkBackend = useCallback(async () => {
    const health = await checkSupabaseHealth();
    setIsBackendLive(health.connected);
    setBackendLatency(health.latencyMs ?? null);
    setBackendMessage(health.message);
  }, []);

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  // Fetch active user's profile and ensure Supabase public.profiles sync
  useEffect(() => {
    if (!isSupabaseConfigured() || !currentUser?.id) return;
    
    // Automatically ensure active user is written to public.profiles table in Supabase
    authService.syncProfileToSupabase(currentUser);

    let isMounted = true;
    const loadProfile = async () => {
      try {
        if (currentUser.role === 'ORGANIZER') {
          const profile = await profileService.getOrganizerProfile(currentUser.id);
          if (isMounted && profile) {
            setOrganizerProfile(profile);
          }
        } else if (currentUser.role === 'PROFESSIONAL') {
          const profile = await profileService.getProfessionalProfile(currentUser.id);
          if (isMounted && profile) {
            // Also need to inject it into `professionals` if it's not there, so that currentProfessional finds it
            setProfessionals(prev => {
              const existingIdx = prev.findIndex(p => p.userId === profile.userId);
              if (existingIdx >= 0) {
                const next = [...prev];
                next[existingIdx] = profile;
                return next;
              }
              return [profile, ...prev];
            });
          }
        }
      } catch (e) {
        console.warn('Profile fetch error:', e);
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, [currentUser?.id, currentUser?.role]);

  // Fetch real database records from Supabase if connected
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    const fetchRemoteData = async () => {
      try {
        const [
          remoteEvents,
          remoteStaff,
          remoteReqs,
          remoteApps,
          remoteAssignments,
          remoteAttendance,
          remotePayments,
          remoteReviews,
        ] = await Promise.all([
          eventService.getEvents(),
          profileService.getAllProfessionals(),
          staffingService.getRequirements(),
          applicationService.getApplications(),
          hiringService.getAssignments(),
          attendanceService.getAttendance(),
          paymentService.getPayments(),
          reviewService.getReviews(),
        ]);

        if (!isMounted) return;

        if (remoteEvents && remoteEvents.length > 0) {
          setEvents(remoteEvents);
          setSelectedEventId(prev => {
            if (!prev || !remoteEvents.some(e => e.id === prev)) {
              return remoteEvents[0].id;
            }
            return prev;
          });
        }
        if (remoteStaff && remoteStaff.length > 0) {
          setProfessionals(remoteStaff);
        }
        if (remoteReqs && remoteReqs.length > 0) {
          setRequirements(remoteReqs);
        }
        if (remoteApps && remoteApps.length > 0) {
          setApplications(remoteApps);
        }
        if (remoteAssignments && remoteAssignments.length > 0) {
          setAssignments(remoteAssignments);
        }
        if (remoteAttendance && remoteAttendance.length > 0) {
          setAttendance(remoteAttendance);
        }
        if (remotePayments && remotePayments.length > 0) {
          setPayments(remotePayments);
        }
        if (remoteReviews && remoteReviews.length > 0) {
          setReviews(remoteReviews);
        }
      } catch (err) {
        console.warn('Supabase remote fetch warning:', err);
      }
    };

    fetchRemoteData();
    return () => {
      isMounted = false;
    };
  }, [isBackendLive]);

  // Supabase auth subscription
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const sub = authService.onAuthStateChange(user => {
      if (user) {
        setCurrentUser(user);
        setActiveRole(user.role);
        try {
          localStorage.setItem('staffx_auth_user', JSON.stringify(user));
          localStorage.removeItem('staffx_explicit_logout');
        } catch {}
      } else if (isSupabaseConfigured()) {
        setCurrentUser(null);
        try {
          localStorage.removeItem('staffx_auth_user');
          localStorage.setItem('staffx_explicit_logout', 'true');
        } catch {}
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  const addToast = (message: string, type: ToastMessage['type'] = 'success', title?: string) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) {
      setCurrentRoute('login');
      addToast(`Please login to access the ${role.toLowerCase()} portal`, 'info', 'Authentication Required');
      return;
    }

    // Role Enforcement: If current account is locked to a specific role, prevent mutating its role
    if (currentUser.role && currentUser.role !== role && currentUser.role !== 'ADMIN') {
      const currentRoleName = currentUser.role === 'ORGANIZER' ? 'Organizer' : currentUser.role === 'PROFESSIONAL' ? 'Staff' : 'Admin';
      const targetRoleName = role === 'ORGANIZER' ? 'Organizer' : role === 'PROFESSIONAL' ? 'Staff' : 'Admin';
      addToast(
        `Role Restricted: Your account (${currentUser.email}) is registered as an ${currentRoleName}. You cannot switch to the ${targetRoleName} portal with these credentials. Please log out to sign in as a ${targetRoleName}.`,
        'warning',
        'Access Denied'
      );
      return;
    }

    setActiveRole(role);
    setCurrentRoute(role === 'ADMIN' ? 'admin-dashboard' : 'dashboard');
    addToast(`Navigated to ${role.toLowerCase()} dashboard`, 'info', 'Dashboard Active');
  };

  const loginUser = async (
    email: string,
    role: UserRole,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const rawInput = (email || '').trim().toLowerCase();
    const safeRole: UserRole = role || 'ORGANIZER';

    // Normalize shorthand usernames (e.g. "guru" -> "guru@staffx.com", "harshit" -> "harshit@staffx.com", "satwik" -> "satwik@staffx.com")
    let targetEmail = rawInput;
    if (rawInput && !rawInput.includes('@')) {
      targetEmail = `${rawInput}@staffx.com`;
    }

    // Helper to finalize login and force Supabase profile sync
    const finalizeLogin = async (user: User) => {
      // Strict Role Validation: Account role must match selected tab role
      if (user.role && user.role !== safeRole) {
        const registeredRoleLabel = user.role === 'ORGANIZER' ? 'Organizer' : user.role === 'PROFESSIONAL' ? 'Staff' : 'Admin';
        const selectedRoleLabel = safeRole === 'ORGANIZER' ? 'Organizer' : safeRole === 'PROFESSIONAL' ? 'Staff' : 'Admin';
        return {
          success: false,
          error: `Role Mismatch: Account (${user.email || user.fullName}) is registered as an ${user.role} (${registeredRoleLabel}). You cannot log in under the ${selectedRoleLabel} tab with these credentials. Please select the ${registeredRoleLabel} tab.`
        };
      }

      const syncedUser = await authService.syncProfileToSupabase(user);
      setCurrentUser(syncedUser);
      setActiveRole(syncedUser.role || safeRole);
      try {
        localStorage.setItem('staffx_auth_user', JSON.stringify(syncedUser));
        localStorage.removeItem('staffx_explicit_logout');
      } catch {}
      setCurrentRoute(syncedUser.role === 'ADMIN' ? 'admin-dashboard' : 'dashboard');
      addToast(`Welcome back, ${syncedUser.fullName}!`, 'success', 'Login Successful');
      return { success: true };
    };

    // 1. Attempt remote Supabase login if configured
    if (isSupabaseConfigured() && password) {
      try {
        const res = await authService.signIn(targetEmail, password);
        if (res.user) {
          return await finalizeLogin(res.user);
        }
      } catch (err) {
        console.warn('Supabase sign-in network exception, falling back to local workspace:', err);
      }
    }

    // 1.5. If Supabase is configured, search existing public.profiles table by username or email
    if (isSupabaseConfigured() && rawInput) {
      try {
        const dbProfile = await authService.findProfileByQuery(rawInput) || await authService.findProfileByQuery(targetEmail);
        if (dbProfile) {
          return await finalizeLogin(dbProfile);
        }
      } catch (err) {
        console.warn('Supabase profile query notice:', err);
      }
    }

    // 2. Check stored custom registered users
    try {
      const storedCustomUsersRaw = localStorage.getItem('staffx_custom_users');
      if (storedCustomUsersRaw) {
        const customUsers: User[] = JSON.parse(storedCustomUsersRaw);
        const matchedCustom = customUsers.find(
          u => u.email.toLowerCase() === targetEmail ||
               u.fullName.toLowerCase().includes(rawInput) ||
               u.id.toLowerCase().includes(rawInput)
        );
        if (matchedCustom) {
          return await finalizeLogin(matchedCustom);
        }
      }
    } catch {}

    // 3. Match initial seed users (Guru, Harshit, Satwik, Rajesh, Rahul, Admin)
    const matchedSeedUser = INITIAL_USERS.find(
      u => u.email.toLowerCase() === targetEmail ||
           u.fullName.toLowerCase().includes(rawInput) ||
           u.id.toLowerCase().includes(rawInput)
    );
    if (matchedSeedUser) {
      return await finalizeLogin(matchedSeedUser);
    }

    // 4. Fallback match by role in INITIAL_USERS if email matches default patterns
    const roleMatchedUser = INITIAL_USERS.find(u => u.role === safeRole);
    if (roleMatchedUser && !rawInput) {
      return await finalizeLogin(roleMatchedUser);
    }

    // 5. Dynamic demo user creation for any valid username or email (e.g. guru, harshit, satwik)
    if (rawInput.length >= 2) {
      const derivedName = rawInput.includes('@') ? rawInput.split('@')[0] : rawInput;
      const formattedName = derivedName.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const dynamicUser: User = {
        id: `usr-${safeRole.toLowerCase()}-${Date.now()}`,
        email: targetEmail,
        phone: '+91 98765 43210',
        role: safeRole,
        fullName: formattedName,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Append to saved custom users list
      try {
        const existingListRaw = localStorage.getItem('staffx_custom_users');
        const customList: User[] = existingListRaw ? JSON.parse(existingListRaw) : [];
        if (!customList.some(u => u.email === dynamicUser.email)) {
          customList.push(dynamicUser);
          localStorage.setItem('staffx_custom_users', JSON.stringify(customList));
        }
      } catch {}

      return await finalizeLogin(dynamicUser);
    }

    return { success: false, error: 'Invalid credentials. Please enter a valid email or username.' };
  };

  const registerUser = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    extraMetadata?: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string }> => {
    // Pre-check if account already exists with a different role
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (normalizedEmail) {
      const existingSeed = INITIAL_USERS.find(u => u.email.toLowerCase() === normalizedEmail || u.fullName.toLowerCase() === normalizedEmail);
      if (existingSeed) {
        if (existingSeed.role !== role) {
          return { success: false, error: `Account (${email}) is already registered as an ${existingSeed.role}. You cannot register the same account under a different role.` };
        }
        return { success: false, error: `Account (${email}) already exists. Please log in with your existing password.` };
      }
    }

    // If Supabase is configured, attempt remote registration first
    if (isSupabaseConfigured()) {
      try {
        const res = await authService.signUp(email, password, fullName, role, extraMetadata);
        if (res.user) {
          setCurrentUser(res.user);
          setActiveRole(role);
          try {
            localStorage.setItem('staffx_auth_user', JSON.stringify(res.user));
            localStorage.removeItem('staffx_explicit_logout');
          } catch {
            // ignore
          }

          if (role === 'ORGANIZER' && extraMetadata) {
            setOrganizerProfile(prev => ({
              ...prev,
              organizationName: (extraMetadata.organization_name as string) || (extraMetadata.organizationName as string) || prev.organizationName,
              organizationType: (extraMetadata.organization_type as string) || (extraMetadata.organizationType as string) || prev.organizationType,
              location: (extraMetadata.location as string) || prev.location,
            }));
          }

          const hasProfileDetails = Boolean(extraMetadata?.organization_name || extraMetadata?.primary_category);
          setCurrentRoute(hasProfileDetails ? 'dashboard' : 'onboarding');
          addToast(`Account created as ${role.toLowerCase()}!`, 'success', 'Welcome to StaffX');
          return { success: true };
        }

        // Check if the error is a network/fetch failure
        const isNetworkErr = res.error && (
          res.error.toLowerCase().includes('failed to fetch') ||
          res.error.toLowerCase().includes('network') ||
          res.error.toLowerCase().includes('fetch failed') ||
          res.error.toLowerCase().includes('connection')
        );

        if (!isNetworkErr && res.error && !res.error.includes('not configured')) {
          // Genuine backend error like password too short or email in use
          addToast(res.error, 'error', 'Registration Failed');
          return { success: false, error: res.error };
        }
      } catch (err) {
        console.warn('Supabase sign-up network error, seamlessly falling back to local workspace:', err);
      }
    }

    // Local / Offline workspace registration
    const newUser: User = {
      id: `usr-${role.toLowerCase()}-${Date.now()}`,
      email,
      phone: (extraMetadata?.phone as string) || '',
      role,
      fullName: fullName.trim() || email.split('@')[0],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Ensure profile is synced to Supabase database public.profiles immediately
    const syncedUser = await authService.syncProfileToSupabase(newUser, extraMetadata);

    setCurrentUser(syncedUser);
    setActiveRole(role);

    // Save to active session storage
    try {
      localStorage.setItem('staffx_auth_user', JSON.stringify(syncedUser));
      localStorage.removeItem('staffx_explicit_logout');

      // Also append to saved custom users list
      const existingListRaw = localStorage.getItem('staffx_custom_users');
      const customList: User[] = existingListRaw ? JSON.parse(existingListRaw) : [];
      customList.push(syncedUser);
      localStorage.setItem('staffx_custom_users', JSON.stringify(customList));
    } catch {
      // ignore
    }

    // Immediately apply role profile details
    if (role === 'ORGANIZER') {
      const updatedOrg: Partial<OrganizerProfile> = {
        organizationName: (extraMetadata?.organization_name as string) || (extraMetadata?.organizationName as string) || `${newUser.fullName}'s Events`,
        organizationType: (extraMetadata?.organization_type as string) || (extraMetadata?.organizationType as string) || 'Corporate & Social Events',
        location: (extraMetadata?.location as string) || 'Bhopal',
      };
      setOrganizerProfile(prev => ({ ...prev, ...updatedOrg }));
      try {
        localStorage.setItem('staffx_organizer_profile', JSON.stringify({ ...organizerProfileState, ...updatedOrg }));
      } catch {}
    } else if (role === 'PROFESSIONAL') {
      const primaryCat = (extraMetadata?.primary_category as string) || 'Security Guard';
      const updatedPro: ProfessionalProfile = {
        id: `pro-${newUser.id}`,
        userId: newUser.id,
        name: newUser.fullName,
        skills: Array.isArray(extraMetadata?.skills) && extraMetadata.skills.length > 0
          ? extraMetadata.skills
          : [primaryCat, 'Event Safety', 'Team Coordination'],
        primaryCategory: primaryCat,
        experienceYears: Number(extraMetadata?.experience_years) || 2,
        hourlyRate: Number(extraMetadata?.hourly_rate) || 250,
        location: (extraMetadata?.location as string) || 'Bhopal',
        availability: 'Available',
        rating: 5.0,
        completedJobsCount: 0,
        verificationStatus: 'VERIFIED',
        bio: (extraMetadata?.bio as string) || `Experienced ${primaryCat} in Bhopal ready for prestigious events.`,
        phone: (extraMetadata?.phone as string) || '',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        createdAt: new Date().toISOString(),
      };
      setProfessionals(prev => [updatedPro, ...prev.filter(p => p.id !== updatedPro.id)]);
      try {
        localStorage.setItem('staffx_professionals', JSON.stringify([updatedPro, ...professionals]));
      } catch {}
    }

    const hasProfileDetails = Boolean(extraMetadata?.organization_name || extraMetadata?.primary_category);
    setCurrentRoute(hasProfileDetails ? 'dashboard' : 'onboarding');
    addToast(`Account created for ${newUser.fullName}! Welcome to StaffX.`, 'success', 'Registration Successful');
    return { success: true };
  };

  const logoutUser = () => {
    if (isSupabaseConfigured()) {
      authService.signOut().catch(() => {});
    }
    try {
      localStorage.removeItem('staffx_auth_user');
      localStorage.setItem('staffx_explicit_logout', 'true');
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setCurrentRoute('landing');
    addToast('You have been logged out securely.', 'info', 'Logged Out');
  };

  // Memoized current professional profile with safe robust fallback
  const currentProfessional = useMemo<ProfessionalProfile>(() => {
    const found = professionals.find(p => (currentUser?.id && p.userId === currentUser.id) || (currentUser?.id && p.id === currentUser.id));
    if (found) {
      return {
        ...found,
        name: currentUser?.fullName || found.name,
        phone: currentUser?.phone || found.phone,
      };
    }

    const fallbackPro = professionals[0];
    if (fallbackPro && currentUser?.role !== 'PROFESSIONAL') return fallbackPro;

    return {
      id: currentUser?.id ? `pro-${currentUser.id}` : 'pro-1',
      userId: currentUser?.id || 'usr-pro-1',
      name: currentUser?.fullName || (fallbackPro ? fallbackPro.name : 'Rahul Sharma'),
      skills: ['Security', 'Crowd Control', 'Event Safety', 'VIP Escort'],
      primaryCategory: 'Security Guard',
      experienceYears: 4,
      location: 'Bhopal',
      availability: 'Available',
      hourlyRate: 250,
      rating: 4.8,
      completedJobsCount: 42,
      verificationStatus: 'VERIFIED',
      bio: 'Certified security specialist with 4+ years of proven background handling executive conferences, weddings, and concert crowds.',
      profileImage: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      phone: currentUser?.phone || '+91 98765 43210',
      createdAt: '2026-08-01T10:00:00Z',
    };
  }, [professionals, currentUser]);

  // Organizer: Create Event
  const createEvent = (eventData: Partial<EventItem>, initialReqs?: Partial<StaffingRequirement>[]) => {
    const newEventId = `evt-${Date.now()}`;
    const newEvent: EventItem = {
      id: newEventId,
      organizerId: organizerProfile.id,
      organizerName: organizerProfile.organizationName,
      name: eventData.name || 'Untitled Event',
      eventType: eventData.eventType || 'Corporate Event',
      venue: eventData.venue || 'City Hall',
      location: eventData.location || 'Bhopal',
      startDate: eventData.startDate || new Date().toISOString().split('T')[0],
      endDate: eventData.endDate || eventData.startDate || new Date().toISOString().split('T')[0],
      startTime: eventData.startTime || '09:00',
      endTime: eventData.endTime || '18:00',
      description: eventData.description || 'Specialized temporary event requiring professional staffing.',
      status: 'PUBLISHED',
      imageUrl: eventData.imageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
      qrCodeToken: `STAFFX-QR-${newEventId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEvents(prev => [newEvent, ...prev]);
    setSelectedEventId(newEventId);

    if (initialReqs && initialReqs.length > 0) {
      const createdReqs: StaffingRequirement[] = initialReqs.map((req, idx) => ({
        id: `req-${Date.now()}-${idx}`,
        eventId: newEventId,
        role: req.role || 'Event Assistant',
        requiredQuantity: Number(req.requiredQuantity) || 5,
        filledQuantity: 0,
        payAmount: Number(req.payAmount) || 1200,
        requiredSkills: req.requiredSkills || ['Event Coordination'],
        experienceRequired: req.experienceRequired || '1+ year',
        shiftStart: req.shiftStart || newEvent.startTime,
        shiftEnd: req.shiftEnd || newEvent.endTime,
        description: req.description || 'Deliver assigned responsibilities during event shift.',
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
      }));
      setRequirements(prev => [...createdReqs, ...prev]);
    }

    // Persist to Supabase in background
    if (isSupabaseConfigured()) {
      eventService.createEvent(
        {
          organizerId: currentUser?.id || 'usr-org-1',
          name: newEvent.name,
          eventType: newEvent.eventType,
          venue: newEvent.venue,
          location: newEvent.location,
          startDate: newEvent.startDate,
          endDate: newEvent.endDate,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          description: newEvent.description,
          status: 'PUBLISHED',
          imageUrl: newEvent.imageUrl,
          qrCodeToken: newEvent.qrCodeToken,
        },
        initialReqs ? initialReqs.map(r => ({
          role: r.role || 'Event Assistant',
          requiredQuantity: Number(r.requiredQuantity) || 5,
          payAmount: Number(r.payAmount) || 1200,
          shiftStart: r.shiftStart || newEvent.startTime,
          shiftEnd: r.shiftEnd || newEvent.endTime,
          requiredSkills: r.requiredSkills || ['Event Coordination'],
          description: r.description || 'Deliver assigned responsibilities during event shift.',
        })) : []
      ).then(createdRemote => {
        if (createdRemote) {
          setEvents(prev => prev.map(e => e.id === newEventId ? createdRemote : e));
          setSelectedEventId(createdRemote.id);
          staffingService.getRequirements(createdRemote.id).then(reqs => {
            if (reqs && reqs.length > 0) {
              setRequirements(prev => [
                ...reqs,
                ...prev.filter(r => r.eventId !== newEventId && r.eventId !== createdRemote.id)
              ]);
            }
          });
        }
      }).catch(err => console.warn('Supabase createEvent sync error:', err));
    }

    addToast(`Event "${newEvent.name}" published successfully.`, 'success', 'Event Created');
    return newEvent;
  };

  // Add Staff Requirement
  const addStaffRequirement = (reqData: Partial<StaffingRequirement>) => {
    const newReq: StaffingRequirement = {
      id: `req-${Date.now()}`,
      eventId: reqData.eventId || selectedEventId || events[0]?.id,
      role: reqData.role || 'Security Guard',
      requiredQuantity: Number(reqData.requiredQuantity) || 1,
      filledQuantity: 0,
      payAmount: Number(reqData.payAmount) || 1000,
      requiredSkills: reqData.requiredSkills || ['Event Safety'],
      experienceRequired: reqData.experienceRequired || 'Any',
      shiftStart: reqData.shiftStart || '09:00',
      shiftEnd: reqData.shiftEnd || '17:00',
      description: reqData.description || 'General event assistance.',
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
    };

    setRequirements(prev => [newReq, ...prev]);

    // Persist to Supabase in background
    if (isSupabaseConfigured()) {
      staffingService.createRequirement({
        eventId: newReq.eventId,
        role: newReq.role,
        requiredQuantity: newReq.requiredQuantity,
        payAmount: newReq.payAmount,
        requiredSkills: newReq.requiredSkills,
        experienceRequired: newReq.experienceRequired,
        shiftStart: newReq.shiftStart,
        shiftEnd: newReq.shiftEnd,
        description: newReq.description,
        status: newReq.status,
      }).then(remoteReq => {
        if (remoteReq) {
          setRequirements(prev => prev.map(r => r.id === newReq.id ? remoteReq : r));
        }
      }).catch(err => console.warn('Supabase createRequirement sync error:', err));
    }

    addToast(`Staffing requirement for ${newReq.role} added.`, 'success');
    return newReq;
  };

  // Professional: Apply for Job
  const applyForJob = (requirementId: string, eventId: string, message?: string) => {
    // Pre-check authentication
    if (!currentUser) {
      addToast('Please log in to apply for staffing jobs.', 'error', 'Authentication Required');
      return { success: false, error: 'UNAUTHENTICATED' };
    }

    if (activeRole !== 'PROFESSIONAL' && currentUser.role !== 'PROFESSIONAL') {
      addToast('Only registered professionals can apply for staffing roles.', 'error', 'Role Restriction');
      return { success: false, error: 'INVALID_ROLE' };
    }

    const currentPro = currentProfessional;
    const requirement = requirements.find(r => r.id === requirementId);

    if (!requirement) {
      addToast('Job details are currently unavailable.', 'error', 'Missing Data');
      return { success: false, error: 'REQUIREMENT_NOT_FOUND' };
    }

    const matchedEvent = events.find(e => e.id === eventId);
    if (matchedEvent && matchedEvent.status === 'CANCELLED') {
      addToast('Cannot apply: This event has been cancelled.', 'error', 'Event Cancelled');
      return { success: false, error: 'EVENT_CANCELLED' };
    }

    if (matchedEvent && matchedEvent.status === 'COMPLETED') {
      addToast('Cannot apply: This event has already completed.', 'error', 'Event Completed');
      return { success: false, error: 'EVENT_COMPLETED' };
    }

    // Pre-check requirement capacity
    if (requirement.filledQuantity >= requirement.requiredQuantity || requirement.status === 'FILLED' || requirement.status === 'CLOSED') {
      addToast('This position has already been filled.', 'warning', 'Job Filled');
      return { success: false, error: 'JOB_FILLED' };
    }

    // Pre-check if already hired
    const isAlreadyHired = assignments.some(
      a => a.requirementId === requirementId && a.professionalId === currentPro.id && a.status !== 'CANCELLED'
    );
    if (isAlreadyHired) {
      addToast('You are already hired for this position.', 'info', 'Already Hired');
      return { success: false, error: 'ALREADY_HIRED' };
    }

    // Check duplicate active application
    const existing = applications.find(
      a => a.requirementId === requirementId && a.professionalId === currentPro.id && a.status !== 'WITHDRAWN' && a.status !== 'REJECTED'
    );
    if (existing) {
      addToast('You have already applied for this job.', 'warning', 'Already Applied');
      return { success: false, error: 'APPLICATION_EXISTS' };
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      requirementId,
      eventId,
      professionalId: currentPro.id,
      professionalName: currentPro.name,
      professionalRating: currentPro.rating,
      professionalExperience: currentPro.experienceYears,
      professionalVerified: currentPro.verificationStatus === 'VERIFIED',
      role: requirement?.role || 'Staff',
      status: 'APPLIED',
      message: message || `Excited to apply for ${requirement?.role || 'this'} role. Fully available.`,
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setApplications(prev => [newApp, ...prev]);

    // Persist to Supabase in background
    if (isSupabaseConfigured()) {
      applicationService.applyForJob(
        requirementId,
        eventId,
        currentUser?.id || 'usr-pro-1',
        newApp.message
      ).then(res => {
        if (res.success && res.application) {
          setApplications(prev => prev.map(a => a.id === newApp.id ? res.application! : a));
        }
      }).catch(err => console.warn('Supabase applyForJob sync error:', err));
    }

    // Send notification to organizer
    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientId: 'usr-org-1',
      type: 'APPLICATION',
      title: 'New Application Received',
      message: `${currentPro.name} applied for ${newApp.role}.`,
      readStatus: false,
      createdAt: 'Just now',
    };
    setNotifications(prev => [newNotification, ...prev]);

    addToast('Your application was submitted successfully.', 'success', 'Application Sent');
    return { success: true };
  };

  // Withdraw Application
  const withdrawApplication = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return { success: false, error: 'APPLICATION_NOT_FOUND' };

    if (app.status === 'ACCEPTED') {
      addToast('Cannot withdraw an accepted or hired application.', 'error', 'Withdrawal Blocked');
      return { success: false, error: 'CANNOT_WITHDRAW_HIRED' };
    }

    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'WITHDRAWN', updatedAt: new Date().toISOString() } : a));

    if (isSupabaseConfigured()) {
      applicationService.updateApplicationStatus(appId, 'WITHDRAWN').catch(err => console.warn('Withdraw error:', err));
    }

    addToast('Application withdrawn successfully.', 'info', 'Application Withdrawn');
    return { success: true };
  };

  // Update Application Status
  const updateApplicationStatus = (appId: string, status: Application['status']) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status, updatedAt: new Date().toISOString() } : a));

    if (isSupabaseConfigured()) {
      applicationService.updateApplicationStatus(appId, status)
        .catch(err => console.warn('Supabase updateApplicationStatus sync error:', err));
    }

    addToast(`Application status updated to ${status}.`, 'info');
  };

  // Organizer: Hire Applicant (Enforces strict capacity control EC-001 / FR-019)
  const hireApplicant = (applicationId: string) => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return { success: false, error: 'RESOURCE_NOT_FOUND' };

    const req = requirements.find(r => r.id === app.requirementId);
    if (!req) return { success: false, error: 'RESOURCE_NOT_FOUND' };

    if (req.filledQuantity >= req.requiredQuantity) {
      addToast(`Staffing limit reached: all ${req.requiredQuantity} positions filled.`, 'error', 'Capacity Reached');
      return { success: false, error: 'JOB_CAPACITY_REACHED' };
    }

    // Update Application
    setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status: 'ACCEPTED', updatedAt: new Date().toISOString() } : a));

    // Increment filled count
    setRequirements(prev => prev.map(r => {
      if (r.id === app.requirementId) {
        const newFilled = r.filledQuantity + 1;
        return {
          ...r,
          filledQuantity: newFilled,
          status: newFilled >= r.requiredQuantity ? 'FILLED' : r.status
        };
      }
      return r;
    }));

    // Create Assignment
    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      requirementId: req.id,
      eventId: req.eventId,
      professionalId: app.professionalId,
      professionalName: app.professionalName,
      role: req.role,
      status: 'CONFIRMED',
      agreedRate: req.payAmount,
      assignedAt: new Date().toISOString(),
    };
    setAssignments(prev => [newAsg, ...prev]);

    // Create Attendance Record (Not Checked In)
    const newAtt: AttendanceRecord = {
      id: `att-${Date.now()}`,
      assignmentId: newAsg.id,
      eventId: req.eventId,
      professionalId: app.professionalId,
      professionalName: app.professionalName,
      role: req.role,
      status: 'NOT_CHECKED_IN',
      durationFormatted: 'Not arrived',
    };
    setAttendance(prev => [newAtt, ...prev]);

    // Create Payment Record (Pending)
    const matchedEvent = events.find(e => e.id === req.eventId);
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      assignmentId: newAsg.id,
      eventId: req.eventId,
      eventName: matchedEvent?.name || 'Event Assignment',
      organizerId: organizerProfile.id,
      professionalId: app.professionalId,
      professionalName: app.professionalName,
      role: req.role,
      amount: req.payAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPayments(prev => [newPayment, ...prev]);

    // Persist hire to Supabase
    if (isSupabaseConfigured()) {
      hiringService.hireApplicant({
        requirementId: req.id,
        eventId: req.eventId,
        organizerId: currentUser?.id || 'usr-org-1',
        professionalId: app.professionalId,
        role: req.role,
        agreedRate: req.payAmount,
        applicationId: app.id,
      }).then(res => {
        if (res.success && res.assignment) {
          setAssignments(prev => prev.map(a => a.id === newAsg.id ? res.assignment! : a));
        }
      }).catch(err => console.warn('Supabase hireApplicant sync error:', err));
    }

    // Notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      recipientId: app.professionalId,
      type: 'HIRING',
      title: 'Congratulations! You are Hired',
      message: `You have been selected for ${req.role} at ${matchedEvent?.name || 'the event'}.`,
      readStatus: false,
      createdAt: 'Just now',
    };
    setNotifications(prev => [notif, ...prev]);

    addToast(`Hired ${app.professionalName} for ${req.role}. Workforce roster updated!`, 'success', 'Staff Confirmed');
    return { success: true };
  };

  const acceptOffer = (assignmentId: string) => {
    setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status: 'CONFIRMED' } : a));
    addToast('Offer accepted. You are confirmed for this assignment.', 'success');
  };

  // QR Attendance Check-In (Validates QR token and updates status)
  const recordCheckIn = (token: string) => {
    const matchedEvent = events.find(e => e.qrCodeToken.toLowerCase() === token.trim().toLowerCase());
    if (!matchedEvent) {
      addToast('Invalid Event QR Token. Please scan an authorized event code.', 'error', 'Check-in Failed');
      return { success: false, error: 'ATTENDANCE_INVALID' };
    }

    if (matchedEvent.status === 'CANCELLED') {
      addToast('Cannot check in: This event has been cancelled.', 'error', 'Event Cancelled');
      return { success: false, error: 'EVENT_CANCELLED' };
    }

    if (matchedEvent.status === 'DRAFT') {
      addToast('Cannot check in: This event is not published yet.', 'error', 'Event Not Active');
      return { success: false, error: 'EVENT_NOT_PUBLISHED' };
    }

    const currentPro = currentProfessional;
    if (!currentPro) {
      addToast('Please login as a Professional to check-in.', 'error', 'Unauthenticated');
      return { success: false, error: 'AUTH_FORBIDDEN' };
    }

    // Find assignment for this pro at this event
    const userAssignment = assignments.find(a => a.eventId === matchedEvent.id && a.professionalId === currentPro.id);
    if (!userAssignment) {
      addToast(`You are not assigned to "${matchedEvent.name}". Attendance rejected.`, 'error', 'Authorization Error');
      return { success: false, error: 'AUTH_FORBIDDEN' };
    }

    if (userAssignment.status === 'CANCELLED') {
      addToast('Your shift assignment has been cancelled.', 'error', 'Shift Cancelled');
      return { success: false, error: 'SHIFT_CANCELLED' };
    }

    if (userAssignment.status !== 'CONFIRMED') {
      addToast('Your assignment must be confirmed before checking in.', 'error', 'Assignment Not Confirmed');
      return { success: false, error: 'ASSIGNMENT_NOT_CONFIRMED' };
    }

    // Check duplicate check-in or checkout
    const existingAtt = attendance.find(a => a.assignmentId === userAssignment.id);
    if (existingAtt) {
      if (existingAtt.status === 'CHECKED_IN') {
        addToast('You are already checked in for this event.', 'warning', 'Duplicate Check-in');
        return { success: false, error: 'ATTENDANCE_INVALID' };
      }
      if (existingAtt.status === 'CHECKED_OUT') {
        addToast('You have already completed this shift and checked out.', 'error', 'Already Checked Out');
        return { success: false, error: 'ATTENDANCE_INVALID' };
      }
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let updatedRecord: AttendanceRecord;

    if (existingAtt) {
      updatedRecord = {
        ...existingAtt,
        checkInAt: timeStr,
        status: 'CHECKED_IN',
        durationFormatted: 'Active shift',
        verificationMethod: 'QR_SCAN',
      };
      setAttendance(prev => prev.map(a => a.id === existingAtt.id ? updatedRecord : a));
    } else {
      updatedRecord = {
        id: `att-${Date.now()}`,
        assignmentId: userAssignment.id,
        eventId: matchedEvent.id,
        professionalId: currentPro.id,
        professionalName: currentPro.name,
        role: userAssignment.role,
        checkInAt: timeStr,
        status: 'CHECKED_IN',
        durationFormatted: 'Active shift',
        verificationMethod: 'QR_SCAN',
      };
      setAttendance(prev => [updatedRecord, ...prev]);
    }

    // Persist check-in to Supabase in background
    if (isSupabaseConfigured()) {
      attendanceService.recordCheckIn(token, currentUser.id).then(res => {
        if (res.success && res.record) {
          setAttendance(prev => prev.map(a => a.id === updatedRecord.id ? res.record! : a));
        }
      }).catch(err => console.warn('Supabase recordCheckIn sync error:', err));
    }

    addToast(`Successfully checked in at ${matchedEvent.name} (${timeStr})!`, 'success', 'QR Verified');
    return { success: true, record: updatedRecord };
  };

  // QR Attendance Check-Out
  const recordCheckOut = (assignmentId: string) => {
    const existing = attendance.find(a => a.assignmentId === assignmentId);
    if (!existing || existing.status !== 'CHECKED_IN') {
      addToast('Must be checked in before performing check out.', 'error', 'Check-out Failed');
      return { success: false, error: 'ATTENDANCE_INVALID' };
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAttendance(prev => prev.map(a => a.id === existing.id ? {
      ...a,
      checkOutAt: timeStr,
      status: 'CHECKED_OUT',
      durationFormatted: 'Completed (approx 6h)',
    } : a));

    // Update assignment to completed
    setAssignments(prev => prev.map(as => as.id === assignmentId ? { ...as, status: 'COMPLETED', completedAt: new Date().toISOString() } : as));

    // Persist check-out to Supabase in background
    if (isSupabaseConfigured()) {
      attendanceService.recordCheckOut(assignmentId)
        .catch(err => console.warn('Supabase recordCheckOut sync error:', err));
    }

    // Create pending payment if it doesn't exist
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      setPayments(prev => {
        if (prev.some(p => p.assignmentId === assignmentId)) return prev;
        
        const ev = events.find(e => e.id === assignment.eventId);
        
        const newPayment: PaymentRecord = {
          id: `pay-${Date.now()}`,
          assignmentId: assignment.id,
          eventId: assignment.eventId,
          eventName: ev?.name || 'Event Shift',
          professionalId: assignment.professionalId,
          professionalName: assignment.professionalName,
          organizerId: ev?.organizerId || 'org-unknown',
          amount: assignment.agreedRate,
          status: 'PENDING',
          paymentMethod: 'UPI',
          role: assignment.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [newPayment, ...prev];
      });
    }

    addToast(`Check-out recorded at ${timeStr}. Work shift completed!`, 'success', 'Shift Concluded');
    return { success: true };
  };

  // Payments: Pending -> Approved -> Paid
  const completeEvent = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'COMPLETED', updatedAt: new Date().toISOString() } : e));
    if (isSupabaseConfigured()) {
      eventService.updateEvent(eventId, { status: 'COMPLETED' })
        .catch(err => console.warn('Supabase completeEvent sync error:', err));
    }
    addToast('Event marked as completed.', 'success', 'Event Completed');
  };

  const cancelEvent = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: 'CANCELLED', updatedAt: new Date().toISOString() } : e));
    if (isSupabaseConfigured()) {
      eventService.updateEvent(eventId, { status: 'CANCELLED' })
        .catch(err => console.warn('Supabase cancelEvent sync error:', err));
    }
    addToast('Event has been cancelled.', 'warning', 'Event Cancelled');
  };

  const updatePaymentStatus = (paymentId: string, status: PaymentRecord['status']) => {
    setPayments(prev => prev.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status,
          paidAt: status === 'PAID' ? new Date().toISOString() : p.paidAt,
          paymentMethod: status === 'PAID' ? (p.paymentMethod || 'UPI / Instant Bank Transfer') : p.paymentMethod,
          transactionReference: status === 'PAID' ? (p.transactionReference || `TXN-${Math.floor(100000 + Math.random() * 900000)}`) : p.transactionReference,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    }));

    if (isSupabaseConfigured()) {
      paymentService.updatePaymentStatus(paymentId, status)
        .catch(err => console.warn('Supabase updatePaymentStatus sync error:', err));
    }

    addToast(`Payment marked as ${status}.`, 'info', 'Payment Updated');
  };

  // Reviews & Rating
  const submitReview = (assignmentId: string, targetUserId: string, rating: number, comment: string) => {
    if (!currentUser) {
      addToast('Please login to submit a review.', 'error', 'Unauthenticated');
      return;
    }

    if (currentUser.id === targetUserId) {
      addToast('You cannot review yourself.', 'error', 'Action Blocked');
      return;
    }

    // Check duplicate review
    const duplicate = reviews.find(r => r.assignmentId === assignmentId && r.reviewerId === currentUser.id);
    if (duplicate) {
      addToast('You have already submitted a review for this assignment.', 'warning', 'Duplicate Review');
      return;
    }

    // Check if the assignment is completed/valid
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      addToast('No matching assignment found for this review.', 'error', 'Action Blocked');
      return;
    }

    const attendanceRec = attendance.find(a => a.assignmentId === assignmentId);
    if (assignment.status !== 'COMPLETED' && (!attendanceRec || attendanceRec.status !== 'CHECKED_OUT')) {
      addToast('You can only submit reviews after the shift/assignment is completed.', 'error', 'Job Incomplete');
      return;
    }

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      assignmentId,
      reviewerId: currentUser.id,
      reviewerName: currentUser.fullName || 'Verified User',
      reviewerRole: activeRole,
      reviewedUserId: targetUserId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    setReviews(prev => [newRev, ...prev]);

    if (isSupabaseConfigured()) {
      reviewService.createReview({
        assignmentId: newRev.assignmentId,
        reviewerId: currentUser?.id || 'usr-1',
        reviewerRole: activeRole,
        reviewedUserId: targetUserId,
        rating,
        comment,
      }).then(res => {
        if (res) {
          setReviews(prev => prev.map(r => r.id === newRev.id ? res : r));
        }
      }).catch(err => console.warn('Supabase submitReview sync error:', err));
    }

    addToast('Review & rating submitted successfully!', 'success', 'Review Recorded');
  };

  // Admin Verification
  const verifyProfessional = (professionalId: string, status: 'VERIFIED' | 'REJECTED') => {
    setProfessionals(prev => prev.map(p => p.id === professionalId ? { ...p, verificationStatus: status } : p));

    if (isSupabaseConfigured()) {
      profileService.setVerificationStatus(professionalId, 'PROFESSIONAL', status)
        .catch(err => console.warn('Supabase setVerificationStatus sync error:', err));
    }

    addToast(`Professional verification status set to ${status}.`, status === 'VERIFIED' ? 'success' : 'warning');
  };

  const updateOrganizerProfile = async (updates: Partial<OrganizerProfile>) => {
    setOrganizerProfile(prev => ({ ...prev, ...updates }));
    if (isSupabaseConfigured()) {
      await profileService.updateOrganizerProfile(currentUser?.id || 'usr-org-1', updates);
    }
    addToast('Organization profile updated.', 'success');
  };

  const updateProfessionalProfile = async (updates: Partial<ProfessionalProfile>) => {
    setProfessionals(prev => prev.map(p => (p.userId === currentUser?.id || p.id === currentUser?.id) ? { ...p, ...updates } : p));
    if (isSupabaseConfigured()) {
      await profileService.updateProfessionalProfile(currentUser?.id || 'usr-pro-1', updates);
    }
    addToast('Professional profile updated.', 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
    if (isSupabaseConfigured()) {
      notificationService.markAsRead(id).catch(err => console.warn('Supabase markAsRead error:', err));
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    if (isSupabaseConfigured() && currentUser?.id) {
      notificationService.markAllAsRead(currentUser.id).catch(err => console.warn('Supabase markAllAsRead error:', err));
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        currentRoute,
        selectedEventId,
        selectedJobId,
        organizerProfile,
        professionals,
        currentProfessional,
        events,
        requirements,
        applications,
        assignments,
        attendance,
        payments,
        reviews,
        notifications,
        toasts,

        // Theme & 7D
        theme,
        setTheme,
        toggleTheme,
        colorTheme,
        setColorTheme,
        spatial7DEnabled,
        toggle7D,

        // Navigation & role
        navigationHistory,
        goBack,
        canGoBack,
        setCurrentRoute: navigateToRoute,
        setSelectedEventId,
        setSelectedJobId,
        switchRole,
        loginUser,
        registerUser,
        logoutUser,

        // Backend & Supabase (Phase 2)
        isSupabaseReady,
        isBackendLive,
        backendLatency,
        backendMessage,
        checkBackend,
        isBackendModalOpen,
        setIsBackendModalOpen,


        createEvent,
        addStaffRequirement,
        applyForJob,
        withdrawApplication,
        updateApplicationStatus,
        hireApplicant,
        acceptOffer,
        recordCheckIn,
        recordCheckOut,
        completeEvent,
        cancelEvent,
        updatePaymentStatus,
        submitReview,
        verifyProfessional,
        updateOrganizerProfile,
        updateProfessionalProfile,
        markNotificationRead,
        markAllNotificationsRead,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
