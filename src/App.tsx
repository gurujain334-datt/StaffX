import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Background7D } from './components/ui/Background7D';
import { ToastContainer } from './components/ui/Toast';
import { BackendStatusModal } from './components/backend/BackendStatusModal';

// Public views
import { LandingPage } from './components/public/LandingPage';
import { HowItWorksPage } from './components/public/HowItWorksPage';
import { LoginForm } from './components/public/LoginForm';
import { RegisterForm } from './components/public/RegisterForm';
import { AdminLoginForm } from './components/admin/AdminLoginForm';

// Authenticated views
import { OrganizerDashboard } from './components/organizer/OrganizerDashboard';
import { EventsListView } from './components/organizer/EventsListView';
import { FindStaffView } from './components/organizer/FindStaffView';
import { ApplicationsView } from './components/organizer/ApplicationsView';
import { WorkforceManagementView } from './components/organizer/WorkforceManagementView';
import { PaymentsView } from './components/organizer/PaymentsView';
import { OrganizerProfileView } from './components/organizer/OrganizerProfileView';

import { ProfessionalDashboard } from './components/professional/ProfessionalDashboard';
import { JobFeedView } from './components/professional/JobFeedView';
import { MyAssignmentsView } from './components/professional/MyAssignmentsView';
import { ProfessionalEarningsView } from './components/professional/ProfessionalEarningsView';
import { ProfessionalProfileView } from './components/professional/ProfessionalProfileView';

import { AdminDashboard } from './components/admin/AdminDashboard';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { UnauthorizedView } from './components/shared/UnauthorizedView';
import { validateRouteAccess } from './utils/routeGuard';

import { Chatbot } from './components/ui/Chatbot';

const AppContent: React.FC = () => {
  const {
    currentRoute,
    activeRole,
    currentUser,
    isBackendModalOpen,
    setIsBackendModalOpen,
  } = useApp();

  const isPublicRoute = ['landing', 'how-it-works', 'about', 'login', 'admin-login', 'register'].includes(currentRoute);

  const renderCurrentView = () => {
    // Check route permissions
    const access = validateRouteAccess(currentRoute, currentUser, activeRole);
    if (!access.allowed && !isPublicRoute) {
      return (
        <UnauthorizedView
          requiredRole={access.requiredRole === 'AUTHENTICATED' ? undefined : access.requiredRole}
          customMessage={access.message}
        />
      );
    }

    switch (currentRoute) {
      // Public routes
      case 'landing':
        return <LandingPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'login':
        return <LoginForm />;
      case 'admin-login':
        return <AdminLoginForm />;
      case 'register':
        return <RegisterForm />;
      case 'onboarding':
        return <OnboardingFlow />;

      // Core Dashboards
      case 'dashboard':
        if (activeRole === 'ADMIN') return <AdminDashboard />;
        if (activeRole === 'PROFESSIONAL') return <ProfessionalDashboard />;
        return <OrganizerDashboard />;

      case 'organizer-dashboard':
        return <OrganizerDashboard />;
      case 'professional-dashboard':
        return <ProfessionalDashboard />;
      case 'admin-dashboard':
      case 'admin-console':
      case 'admin-verifications':
      case 'admin-users':
        return <AdminDashboard />;

      // Organizer Workflow
      case 'events':
        return <EventsListView />;
      case 'find-staff':
        return <FindStaffView />;
      case 'applications':
        return <ApplicationsView />;
      case 'workforce':
        return <WorkforceManagementView />;
      case 'attendance':
        return activeRole === 'PROFESSIONAL' ? <MyAssignmentsView /> : <WorkforceManagementView />;
      case 'payments':
        return <PaymentsView />;
      case 'organizer-profile':
        return <OrganizerProfileView />;

      // Professional Workflow
      case 'find-jobs':
        return <JobFeedView />;
      case 'my-applications':
        return <JobFeedView />;
      case 'my-assignments':
      case 'assignments':
        return <MyAssignmentsView />;
      case 'earnings':
        return <ProfessionalEarningsView />;
      case 'professional-profile':
        return <ProfessionalProfileView />;

      // Shared Profile Fallback
      case 'profile':
        if (activeRole === 'ORGANIZER') return <OrganizerProfileView />;
        if (activeRole === 'PROFESSIONAL') return <ProfessionalProfileView />;
        return <AdminDashboard />;

      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col relative selection:bg-cyan-500/30 selection:text-white">
      {/* 7D Cyber Telemetry Background */}
      <Background7D />

      {/* Navigation Bar */}
      <Navbar />

      {/* Main Viewport Container */}
      <div className="flex-1 flex w-full relative z-10">
        {/* Sidebar rendered for protected dashboard routes */}
        {!isPublicRoute && <Sidebar />}

        {/* Dynamic Route View */}
        <main className={`flex-1 w-full ${!isPublicRoute ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto' : ''}`}>
          {renderCurrentView()}
        </main>
      </div>

      {/* Mobile Navigation for Small Screens */}
      {!isPublicRoute && <MobileNav />}

      {/* System Modals & Telemetry Toasts */}
      <ToastContainer />
      <BackendStatusModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
      />
      <Chatbot />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
