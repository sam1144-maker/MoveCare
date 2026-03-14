import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ChatbotPage from './pages/ChatbotPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import RecordsPage from './pages/RecordsPage';

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
            <RecordsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/patients" element={
        <ProtectedRoute>
          <DashboardLayout>
            <RecordsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  </div>
  );
}

export default App;
