import React, { useState, useEffect, useCallback } from 'react';
import { App as CapApp } from '@capacitor/app';
import {
  ActiveScreen,
  CentreProfile,
  LicenceInfo,
  Student,
  Batch,
  Teacher,
  AttendanceRecord,
  FeePayment,
  ProgressReport,
} from './types';
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
import { DownloadAppScreen } from './screens/DownloadAppScreen';
import { UpdateModal } from './components/common/UpdateModal';
import { checkForAppUpdate, UpdateManifest } from './services/updateService';
import { LiveUpdateService } from './services/liveUpdateService';
import { CURRENT_APP_VERSION, AppVersionInfo } from './config/appVersion';

export function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('splash');
  const [centre, setCentre] = useState<CentreProfile>(INITIAL_CENTRE);
  const [licence, setLicence] = useState<LicenceInfo | null>(INITIAL_LICENCE);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'centre_owner' | 'teacher'>('centre_owner');
  const [userName, setUserName] = useState('');

  // Core Data Collections (Strictly isolated by active centre ID)
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // In-App Auto Update Modal State
  const [updateModalData, setUpdateModalData] = useState<{
    isOpen: boolean;
    manifest: UpdateManifest | null;
    installedVersion: AppVersionInfo;
    isMandatory: boolean;
  }>({
    isOpen: false,
    manifest: null,
    installedVersion: CURRENT_APP_VERSION,
    isMandatory: false,
  });

  // Background Automatic Update Check & Hybrid Live Boot Watchdog
  useEffect(() => {
    // 1. Initialize Hybrid Live Web Update Watchdog
    LiveUpdateService.initBootWatchdog().catch((err) =>
      console.warn('LiveUpdate watchdog non-blocking warning:', err)
    );

    // 2. Run In-App APK Update Check
    const runAutoUpdateCheck = async () => {
      try {
        const res = await checkForAppUpdate({ force: false });
        if (res.hasUpdate && res.latestManifest) {
          setUpdateModalData({
            isOpen: true,
            manifest: res.latestManifest,
            installedVersion: res.installedVersion,
            isMandatory: res.isMandatory,
          });
        }
      } catch (e) {
        console.warn('Background auto update check error (safe fallback):', e);
      }
    };

    const timer = setTimeout(runAutoUpdateCheck, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleTriggerUpdateModal = (manifest: UpdateManifest, isMandatory: boolean) => {
    setUpdateModalData({
      isOpen: true,
      manifest,
      installedVersion: CURRENT_APP_VERSION,
      isMandatory,
    });
  };

  // Capture PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Hydrate organization-specific data from Storage
  const rehydrateCentreData = useCallback((targetCentreId: string) => {
    setStudents(AppStorage.getStudents(targetCentreId));
    setBatches(AppStorage.getBatches(targetCentreId));
    setTeachers(AppStorage.getTeachers(targetCentreId));
    setAttendance(AppStorage.getAttendance(targetCentreId));
    setPayments(AppStorage.getPayments(targetCentreId));
    setReports(AppStorage.getReports(targetCentreId));
  }, []);

  // Hydrate from Storage on Mount and Screen Change
  useEffect(() => {
    const loadedCentre = AppStorage.getCentre();
    const loadedLicence = AppStorage.getLicence(loadedCentre.id);
    setCentre(loadedCentre);
    setLicence(loadedLicence);
    rehydrateCentreData(loadedCentre.id);

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
  }, [currentScreen, isAuthenticated, rehydrateCentreData]);

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

  // Handlers for Data Updates (Strictly multi-tenant scoped by centre.id)
  const handleAddStudent = (s: Student) => {
    const updated = AppStorage.addStudent(s, centre.id);
    setStudents(updated);
  };

  const handleUpdateStudent = (s: Student) => {
    const updated = AppStorage.updateStudent(s, centre.id);
    setStudents(updated);
  };

  const handleDeleteStudent = (id: string) => {
    const updated = AppStorage.deleteStudent(id, centre.id);
    setStudents(updated);
  };

  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    const updated = AppStorage.markAttendance(records, centre.id);
    setAttendance(updated);
  };

  const handleRecordPayment = (payment: FeePayment) => {
    const updated = AppStorage.addPayment(payment, centre.id);
    setPayments(updated);
    setStudents(AppStorage.getStudents(centre.id)); // Reload updated balances
  };

  const handleAddBatch = (batch: Batch) => {
    const updated = AppStorage.addBatch(batch, centre.id);
    setBatches(updated);
  };

  const handleAddReport = (report: ProgressReport) => {
    const updated = AppStorage.addReport(report, centre.id);
    setReports(updated);
  };

  const handleUpdateCentre = (updatedCentre: CentreProfile) => {
    AppStorage.setCentre(updatedCentre);
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
          rehydrateCentreData(actCentre.id);
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
          const activeCentre = AppStorage.getCentre();
          const activeLicence = AppStorage.getLicence(activeCentre.id);
          setCentre(activeCentre);
          setLicence(activeLicence);
          setUserRole(role);
          setUserName(name);
          rehydrateCentreData(activeCentre.id);
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
          const activeLicence = AppStorage.getLicence(newCentre.id);
          setCentre(newCentre);
          setLicence(activeLicence);
          setUserRole('centre_owner');
          setUserName(newCentre.owner_name);
          rehydrateCentreData(newCentre.id);
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
            onTriggerUpdateModal={handleTriggerUpdateModal}
          />
        )}

        {currentScreen === 'superadmin' && (
          <SuperAdminScreen onBack={() => setCurrentScreen('dashboard')} />
        )}

        {currentScreen === 'download' && (
          <DownloadAppScreen
            centre={centre}
            onBack={() => setCurrentScreen('dashboard')}
            deferredPrompt={deferredPrompt}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      {currentScreen !== 'superadmin' && currentScreen !== 'download' && (
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}

      {/* Global In-App Update Dialog */}
      {updateModalData.isOpen && updateModalData.manifest && (
        <UpdateModal
          manifest={updateModalData.manifest}
          installedVersion={updateModalData.installedVersion}
          isMandatory={updateModalData.isMandatory}
          onClose={() =>
            setUpdateModalData((prev) => ({ ...prev, isOpen: false }))
          }
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
