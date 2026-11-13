import React, { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { ActiveScreen, CentreProfile, LicenceInfo, Student, Batch, Teacher, AttendanceRecord, FeePayment, ProgressReport } from './types';
import { AppStorage, INITIAL_CENTRE, INITIAL_LICENCE } from './lib/storage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { SplashScreen } from './screens/SplashScreen';
import { ActivationScreen } from './screens/ActivationScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { StudentsScreen } from './screens/StudentsScreen';
import { AttendanceScreen } from './screens/AttendanceScreen';
import { FeesScreen } from './screens/FeesScreen';
import { TimetableScreen } from './screens/TimetableScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SuperAdminScreen } from './screens/SuperAdminScreen';

export function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('splash');
  const [centre, setCentre] = useState<CentreProfile>(INITIAL_CENTRE);
  const [licence, setLicence] = useState<LicenceInfo | null>(INITIAL_LICENCE);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'centre_owner' | 'teacher'>('centre_owner');
  const [userName, setUserName] = useState('Prof. Rajesh Sharma');

  // Core Data Collections
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [reports, setReports] = useState<ProgressReport[]>([]);

  // Hydrate from Storage on Mount
  useEffect(() => {
    const loadedLicence = AppStorage.getLicence();
    const loadedCentre = AppStorage.getCentre();
    setLicence(loadedLicence);
    setCentre(loadedCentre);
    setStudents(AppStorage.getStudents());
    setBatches(AppStorage.getBatches());
    setTeachers(AppStorage.getTeachers());
    setAttendance(AppStorage.getAttendance());
    setPayments(AppStorage.getPayments());
    setReports(AppStorage.getReports());

    // Android Hardware Back Button Handler
    try {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (currentScreen !== 'dashboard' && isAuthenticated) {
          setCurrentScreen('dashboard');
        } else if (!canGoBack) {
          CapApp.exitApp();
        }
      });
    } catch {
      // Browser fallback
    }
  }, [currentScreen, isAuthenticated]);

  // Handle Splash Complete
  const handleSplashComplete = () => {
    if (!licence || licence.status !== 'active') {
      setCurrentScreen('activation');
    } else if (!isAuthenticated) {
      setCurrentScreen('login');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  // Handlers for Data Updates
  const handleAddStudent = (s: Student) => {
    const updated = AppStorage.addStudent(s);
    setStudents(updated);
  };

  const handleUpdateStudent = (s: Student) => {
    const updated = AppStorage.updateStudent(s);
    setStudents(updated);
  };

  const handleDeleteStudent = (id: string) => {
    const updated = AppStorage.deleteStudent(id);
    setStudents(updated);
  };

  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    const updated = AppStorage.markAttendance(records);
    setAttendance(updated);
  };

  const handleRecordPayment = (payment: FeePayment) => {
    const updated = AppStorage.addPayment(payment);
    setPayments(updated);
    setStudents(AppStorage.getStudents()); // Reload updated balances
  };

  const handleAddBatch = (batch: Batch) => {
    const updated = AppStorage.addBatch(batch);
    setBatches(updated);
  };

  const handleAddReport = (report: ProgressReport) => {
    const updated = AppStorage.addReport(report);
    setReports(updated);
  };

  const handleUpdateCentre = (updatedCentre: CentreProfile) => {
    setCentre(updatedCentre);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  // Render standalone full-screen overlays (Splash, Activation, Login, Register)
  if (currentScreen === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (currentScreen === 'activation') {
    return (
      <ActivationScreen
        onActivated={(actLicence, actCentre) => {
          setLicence(actLicence);
          setCentre(actCentre);
          setIsAuthenticated(true);
          setCurrentScreen('dashboard');
        }}
      />
    );
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        centre={centre}
        onLoginSuccess={(role, name) => {
          setUserRole(role);
          setUserName(name);
          setIsAuthenticated(true);
          setCurrentScreen('dashboard');
        }}
        onNavigateToRegister={() => setCurrentScreen('register')}
        onNavigateToActivation={() => setCurrentScreen('activation')}
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onRegisterSuccess={(newCentre) => {
          setCentre(newCentre);
          setIsAuthenticated(true);
          setCurrentScreen('dashboard');
        }}
        onNavigateToLogin={() => setCurrentScreen('login')}
      />
    );
  }

  // Main Authenticated Application Frame
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Sticky Header */}
      <Header
        centre={centre}
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
      />

      {/* Main Scrollable Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 pb-24">
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            centre={centre}
            students={students}
            batches={batches}
            attendance={attendance}
            payments={payments}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}

        {currentScreen === 'students' && (
          <StudentsScreen
            students={students}
            batches={batches}
            centre={centre}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}

        {currentScreen === 'attendance' && (
          <AttendanceScreen
            students={students}
            batches={batches}
            attendance={attendance}
            centre={centre}
            onSaveAttendance={handleSaveAttendance}
          />
        )}

        {currentScreen === 'fees' && (
          <FeesScreen
            students={students}
            payments={payments}
            centre={centre}
            onRecordPayment={handleRecordPayment}
          />
        )}

        {currentScreen === 'timetable' && (
          <TimetableScreen
            batches={batches}
            teachers={teachers}
            centre={centre}
            onAddBatch={handleAddBatch}
          />
        )}

        {currentScreen === 'reports' && (
          <ReportsScreen
            students={students}
            reports={reports}
            centre={centre}
            onAddReport={handleAddReport}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            centre={centre}
            licence={licence}
            onUpdateCentre={handleUpdateCentre}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onLogout={handleLogout}
          />
        )}

        {currentScreen === 'superadmin' && (
          <SuperAdminScreen onBack={() => setCurrentScreen('dashboard')} />
        )}
      </main>

      {/* Fixed Bottom Navigation (only shown when authenticated and not in superadmin) */}
      {currentScreen !== 'superadmin' && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
