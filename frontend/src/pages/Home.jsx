import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Clock, Bell, BarChart3, ChevronRight, Shield, Zap, Users } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  if (user) {
    const dashboardPath = user.role === 'Admin' ? '/dashboard/admin' : user.role === 'Agent' ? '/dashboard/agent' : '/dashboard/customer';
    return <Navigate to={dashboardPath} />;
  }

  const steps = [
    { number: '01', title: 'Register & Sign In', desc: 'Create your free account in seconds and log in securely.' },
    { number: '02', title: 'Select Your Service', desc: 'Choose from Account Services, Loans, Foreign Exchange and more.' },
    { number: '03', title: 'Track & Get Notified', desc: 'Monitor your queue position live and get an email alert before your turn.' },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full opacity-80 pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-secondary/10 blur-[130px] rounded-full opacity-80 pointer-events-none" />

      {/* ── Hero ── */}
      <section className="w-full max-w-6xl px-4 pt-20 pb-28 flex flex-col items-center text-center animate-fade-in-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-5 py-2 rounded-full mb-8 border border-primary/20">
          <Zap className="w-4 h-4 fill-current" />
          Digital Banking Queue Management
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          Smart Banking,
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary mt-2">
            Zero Wait Time
          </span>
        </h1>

        <p className="text-xl text-gray-500 mb-12 max-w-2xl leading-relaxed">
          Join the future of banking. Skip the physical lines — take a digital token, track your position in real-time, and walk in only when it's your turn.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/register"
            className="group flex items-center justify-center gap-2 bg-primary hover:bg-[#16325a] text-white px-9 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-dark px-9 py-4 rounded-full text-lg font-semibold transition-all hover:bg-gray-50 hover:shadow-md hover:-translate-y-1"
          >
            Sign In
          </Link>
        </div>

        {/* Floating stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 w-full max-w-lg">
          {[
            { value: '6+', label: 'Banking Services' },
            { value: '< 1s', label: 'Token Generation' },
            { value: '24/7', label: 'Live Tracking' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black text-primary">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="w-full max-w-6xl px-4 pb-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Everything You Need</h2>
          <p className="text-gray-500 max-w-xl mx-auto">A complete digital queue solution built specifically for modern banking environments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Clock className="w-7 h-7 text-primary" />,
              bg: 'bg-blue-50',
              title: 'Real-time Tracking',
              desc: 'See exactly where you stand in the queue with live position updates and accurate wait time estimates.',
            },
            {
              icon: <Bell className="w-7 h-7 text-secondary" />,
              bg: 'bg-amber-50',
              title: 'Smart Notifications',
              desc: 'Receive instant email alerts the moment your token is called so you never miss your turn.',
            },
            {
              icon: <BarChart3 className="w-7 h-7 text-accent" />,
              bg: 'bg-teal-50',
              title: 'Advanced Analytics',
              desc: 'Admins get powerful dashboards to monitor service times, counter performance, and daily traffic.',
            },
            {
              icon: <Shield className="w-7 h-7 text-purple-600" />,
              bg: 'bg-purple-50',
              title: 'Secure & Private',
              desc: 'JWT-secured accounts ensure your personal and account information stays safe at all times.',
            },
            {
              icon: <Users className="w-7 h-7 text-rose-500" />,
              bg: 'bg-rose-50',
              title: 'Multi-Role Access',
              desc: 'Separate portals for Customers, Bank Tellers, and Administrators with role-based access.',
            },
            {
              icon: <Zap className="w-7 h-7 text-orange-500" />,
              bg: 'bg-orange-50',
              title: 'Instant Token',
              desc: 'Get your queue token in under a second. No app download, no physical ticket — purely digital.',
            },
          ].map((f, i) => (
            <div
              key={i}
              className="glassmorphism p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group"
            >
              <div className={`w-14 h-14 ${f.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="w-full max-w-6xl px-4 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How It Works</h2>
          <p className="text-gray-500">Three simple steps to a seamless banking experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-[16.6%] right-[16.6%] h-0.5 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30" />

          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent text-white rounded-2xl flex flex-col items-center justify-center mb-6 shadow-lg shadow-primary/25 z-10">
                <span className="text-xs font-bold opacity-70">STEP</span>
                <span className="text-2xl font-black">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="w-full max-w-5xl px-4 pb-20">
        <div className="bg-gradient-to-br from-primary to-[#16325a] rounded-3xl p-14 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -ml-20 -mb-20" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Skip the Queue?</h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto text-lg">
              Join thousands of customers already using FinQueue to save time at the bank.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-secondary hover:bg-[#b5923c] text-white px-10 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Create Free Account <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
