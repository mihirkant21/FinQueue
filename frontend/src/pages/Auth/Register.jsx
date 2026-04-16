import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glassmorphism w-full max-w-md p-10 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -ml-10 -mt-10"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-[40px] -mr-10 -mb-10"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-gray-500 mt-2">Join FinQueue — The Bank's Digital Queue System</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-6 text-sm relative z-10">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white/50"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white/50"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white/50"
            >
              <option value="Customer">Customer</option>
              <option value="Agent">Bank Teller</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-primary hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg mt-2">
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm relative z-10">
          <span className="text-gray-500">Already have an account? </span>
          <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
