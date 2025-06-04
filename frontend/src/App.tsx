import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import PracticePage from './pages/PracticePage';
import MockInterview from './pages/MockInterview';
import Dashboard from './pages/Dashboard';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen w-screen bg-gray-900 text-white overflow-x-hidden">
        <Header />
        <main className="flex-grow w-full">
          <div className="w-full h-full">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route
                  path="/roles"
                  element={
                    <ProtectedRoute>
                      <RoleSelection />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/practice/:role"
                  element={
                    <ProtectedRoute>
                      <PracticePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview"
                  element={
                    <ProtectedRoute>
                      <MockInterview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
