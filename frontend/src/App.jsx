import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import CustomerDashboard from './pages/Dashboard/CustomerDashboard';
import AgentDashboard from './pages/Dashboard/AgentDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen flex flex-col bg-light font-sans text-dark transition-all duration-300">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['Customer', 'Agent', 'Admin']} />}>
                  <Route path="/dashboard/customer" element={<CustomerDashboard />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['Agent', 'Admin']} />}>
                  <Route path="/dashboard/agent" element={<AgentDashboard />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                  <Route path="/dashboard/admin" element={<AdminDashboard />} />
                </Route>
              </Routes>
            </main>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
