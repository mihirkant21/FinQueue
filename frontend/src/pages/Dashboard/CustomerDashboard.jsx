import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import {
  Ticket, Clock, CheckCircle2, AlertCircle, PlusCircle,
  Building2, Phone, X, ChevronRight, User, Hourglass, Ban,
} from 'lucide-react';

const SERVICE_TYPES = [
  { value: 'Account Services', label: 'Account Services', duration: '~10 min', color: 'bg-blue-100 text-blue-700' },
  { value: 'Loan Services', label: 'Loan Services', duration: '~20 min', color: 'bg-purple-100 text-purple-700' },
  { value: 'Foreign Exchange', label: 'Foreign Exchange', duration: '~15 min', color: 'bg-orange-100 text-orange-700' },
  { value: 'General Inquiry', label: 'General Inquiry', duration: '~5 min', color: 'bg-teal-100 text-teal-700' },
  { value: 'Card Services', label: 'Card Services', duration: '~12 min', color: 'bg-rose-100 text-rose-700' },
  { value: 'Fixed Deposits', label: 'Fixed Deposits', duration: '~15 min', color: 'bg-amber-100 text-amber-700' },
];

const serviceColorMap = {
  'Account Services': 'bg-blue-100 text-blue-700',
  'Loan Services': 'bg-purple-100 text-purple-700',
  'Foreign Exchange': 'bg-orange-100 text-orange-700',
  'General Inquiry': 'bg-teal-100 text-teal-700',
  'Card Services': 'bg-rose-100 text-rose-700',
  'Fixed Deposits': 'bg-amber-100 text-amber-700',
};

const CustomerDashboard = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [serviceType, setServiceType] = useState('Account Services');

  const socket = useSocket();

  const fetchMyTokens = async () => {
    try {
      const { data } = await axios.get('/queue/my-tokens');
      setTokens(data.tokens);
      setError('');
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Failed to fetch token information.');
      } else {
        setTokens([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTokens();
    if (socket) {
      socket.on('queue_updated', fetchMyTokens);
      socket.on('token_called', (data) => {
        setTokens(prev => {
          if (prev.some(t => t.token._id === data.token._id)) fetchMyTokens();
          return prev;
        });
      });
    }
    return () => {
      if (socket) {
        socket.off('queue_updated');
        socket.off('token_called');
      }
    };
  }, [socket]);

  const joinQueue = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await axios.post('/queue', { customerName, phoneNumber, serviceType });
      await fetchMyTokens();
      setIsFormVisible(false);
      setCustomerName('');
      setPhoneNumber('');
      setServiceType('Account Services');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join queue.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelToken = async (tokenId) => {
    if (!window.confirm('Are you sure you want to cancel this token?')) return;
    setCancellingId(tokenId);
    try {
      await axios.delete(`/queue/${tokenId}`);
      await fetchMyTokens();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel token.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading && tokens.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-gray-500 font-medium">Loading your tokens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-8 pb-16 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dark">My Queue Tokens</h1>
          <p className="text-gray-500 mt-1">Track your position and manage your bank visit.</p>
        </div>
        {tokens.length > 0 && !isFormVisible && (
          <button
            id="add-token-btn"
            onClick={() => setIsFormVisible(true)}
            disabled={submitting}
            className="flex items-center gap-2 bg-primary hover:bg-[#16325a] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70"
          >
            <PlusCircle className="w-4 h-4" /> Queue Again
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Join Queue Form */}
      {(tokens.length === 0 || isFormVisible) && (
        <div className="glassmorphism rounded-3xl p-10 relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Request a Token</h2>
                <p className="text-gray-500 text-sm">Join the digital queue — no waiting in line needed.</p>
              </div>
            </div>

            <form onSubmit={joinQueue} className="max-w-lg flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <User className="w-4 h-4 inline mr-1.5 text-gray-400" />Full Name
                </label>
                <input
                  id="customer-name-input"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />Phone Number
                </label>
                <input
                  id="phone-number-input"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <Ticket className="w-4 h-4 inline mr-1.5 text-gray-400" />Service Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_TYPES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      id={`service-${s.value.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setServiceType(s.value)}
                      className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
                        serviceType === s.value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-100 bg-white/60 hover:border-primary/30 hover:bg-primary/5'
                      }`}
                    >
                      <span className="text-sm font-semibold text-dark">{s.label}</span>
                      <span className="text-xs text-gray-400 mt-0.5">{s.duration}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                {tokens.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsFormVisible(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                )}
                <button
                  id="get-token-btn"
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-[#16325a] text-white px-6 py-3.5 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Generating...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Ticket className="w-4 h-4" /> Get My Token <ChevronRight className="w-4 h-4" /></span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Token Cards */}
      {tokens.length > 0 && !isFormVisible && (
        <div className="flex flex-col gap-8">
          {tokens.map((item) => {
            const isCalled = item.token.status === 'Called';
            const counterName = item.token.serviceCounterId?.counterName || item.token.serviceCounterId || '';
            const svcColor = serviceColorMap[item.token.serviceType] || 'bg-gray-100 text-gray-600';

            return (
              <div
                key={item.token._id}
                className={`relative rounded-3xl overflow-hidden shadow-xl transition-all duration-500 ${
                  isCalled ? 'ring-2 ring-emerald-400 ring-offset-2' : 'ring-1 ring-white/50'
                }`}
              >
                <div className={`h-1.5 w-full ${isCalled ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-primary to-accent'}`} />

                <div className="glassmorphism p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Token Display */}
                    <div className="flex flex-col items-center justify-center text-center py-4 relative">
                      {isCalled && <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl animate-pulse" />}

                      <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 ${svcColor}`}>
                        {item.token.serviceType}
                      </span>

                      <p className="text-gray-400 text-sm font-medium mb-1">{item.token.customerName}</p>
                      <p className="text-gray-300 text-xs mb-1">{item.token.phoneNumber}</p>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4">
                        Generated at: {new Date(item.token.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>

                      <div
                        className={`text-8xl font-black token-display mb-6 ${isCalled ? 'text-emerald-600' : 'text-primary'}`}
                        style={{ textShadow: isCalled ? '0 4px 24px rgba(16,185,129,0.2)' : '0 4px 24px rgba(30,58,95,0.15)' }}
                      >
                        {item.token.tokenNumber}
                      </div>

                      <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm border ${
                        isCalled
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse-badge'
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {isCalled ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        {isCalled ? 'Called — Please Proceed!' : 'Waiting in Queue'}
                      </div>

                      {isCalled && (
                        <div className="mt-5 w-full bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2">
                          <ChevronRight className="w-4 h-4" />
                          Proceed to Service Counter: <span className="ml-1 font-black">{counterName}</span>
                        </div>
                      )}
                    </div>

                    {/* Info Panel */}
                    <div className="flex flex-col gap-4">
                      <div className="bg-white/60 rounded-2xl p-5 flex items-center justify-between border border-white/50 hover:-translate-y-0.5 transition-transform">
                        <div>
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Queue Position</p>
                          <p className="text-4xl font-black text-dark">{isCalled ? '—' : `#${item.token.queuePosition}`}</p>
                        </div>
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <Ticket className="w-7 h-7 text-primary" />
                        </div>
                      </div>

                      <div className="bg-white/60 rounded-2xl p-5 flex items-center justify-between border border-white/50 hover:-translate-y-0.5 transition-transform">
                        <div>
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Est. Wait Time</p>
                          <p className="text-4xl font-black text-dark">
                            {isCalled ? 'Now!' : item.estimatedWaitTime > 0 ? `${item.estimatedWaitTime} min` : 'Next Up'}
                          </p>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isCalled ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                          {isCalled ? <CheckCircle2 className="w-7 h-7 text-emerald-500" /> : <Hourglass className="w-7 h-7 text-amber-500" />}
                        </div>
                      </div>

                      {!isCalled && (
                        <button
                          id={`cancel-token-${item.token._id}`}
                          onClick={() => cancelToken(item.token._id)}
                          disabled={cancellingId === item.token._id}
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-red-200 text-red-500 hover:bg-red-50 font-semibold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
                        >
                          {cancellingId === item.token._id
                            ? <span className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent" /> Cancelling...</span>
                            : <span className="flex items-center gap-2"><Ban className="w-4 h-4" /> Cancel This Token</span>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
