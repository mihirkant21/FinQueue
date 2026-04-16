import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, User } from 'lucide-react';

const roleBadgeColor = {
  Admin: 'bg-purple-100 text-purple-700 border-purple-200',
  Agent: 'bg-teal-100 text-teal-700 border-teal-200',
  Customer: 'bg-blue-100 text-blue-700 border-blue-200',
};

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="glassmorphism sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4 py-3.5 flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold text-primary tracking-tight">FinQueue</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest -mt-0.5">Bank Queue System</span>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex gap-3 items-center">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-dark">{user.name}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block ${roleBadgeColor[user.role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {user.role === 'Agent' ? 'Bank Teller' : user.role}
                  </span>
                </div>
              </div>
              <button
                id="logout-btn"
                onClick={logout}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                id="nav-login-link"
                className="text-gray-600 hover:text-primary font-medium transition-colors text-sm px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                id="nav-register-link"
                className="bg-primary hover:bg-[#16325a] text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
