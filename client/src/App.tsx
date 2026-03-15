import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ChatbotPage from './pages/ChatbotPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import RecordsPage from './pages/RecordsPage';
import DoctorRecordsPage from './pages/DoctorRecordsPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import TeleconsultationPage from './pages/TeleconsultationPage';
import AdminPatientsPage from './pages/AdminPatientsPage';
import AdminDoctorsPage from './pages/AdminDoctorsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
// import ExerciseGamesPage from './pages/ExerciseGamesPage';
  
// Role-based records page
const RoleBasedRecords = () => {
  const role = localStorage.getItem('movecare_role') || 'patient';
  return role === 'doctor' ? <DoctorRecordsPage /> : <RecordsPage />;
};

// Simple protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('movecare_role') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Routes>
        <Route path="/" element={
          <>
            <Navbar />
            <main className="flex-grow">
              <LandingPage />
            </main>
            <Footer />
        </>
      } />
      <Route path="/login" element={<AuthPage />} />
      
      {/* Authenticated Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/teleconsultation" element={
        <ProtectedRoute>
          <DashboardLayout>
            <TeleconsultationPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      {/* <Route path="/exercise-games" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ExerciseGamesPage />
          </DashboardLayout>
        </ProtectedRoute>
      } /> */}
      <Route path="/chatbot" element={
        <ProtectedRoute>
          <DashboardLayout>
            <ChatbotPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/records" element={
        <ProtectedRoute>
          <DashboardLayout>
            <RoleBasedRecords />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/patients" element={
        <ProtectedRoute>
          <DashboardLayout>
            <PatientsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/patients/:id" element={
        <ProtectedRoute>
          <DashboardLayout>
            <PatientDetailPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Admin Specific Routes */}
      <Route path="/admin/patients" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AdminPatientsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/doctors" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AdminDoctorsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/analytics" element={
        <ProtectedRoute>
          <DashboardLayout>
            <AdminAnalyticsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  </div>
  );
}

export default App;
