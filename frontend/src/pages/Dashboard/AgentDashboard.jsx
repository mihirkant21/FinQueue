import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import {
  Users, PhoneCall, CheckSquare, Clock, ChevronRight,
  Ticket, AlertCircle, Building2, UserCheck, Activity,
} from 'lucide-react';

const serviceColorMap = {
  'Account Services': 'bg-blue-100 text-blue-700',
  'Loan Services': 'bg-purple-100 text-purple-700',
  'Foreign Exchange': 'bg-orange-100 text-orange-700',
  'General Inquiry': 'bg-teal-100 text-teal-700',
  'Card Services': 'bg-rose-100 text-rose-700',
  'Fixed Deposits': 'bg-amber-100 text-amber-700',
};

const AgentDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [calledTokens, setCalledTokens] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState('');
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [error, setError] = useState('');
  const socket = useSocket();

  const fetchData = async () => {
    try {
      const [queueRes, countersRes, userRes] = await Promise.all([
        axios.get('/queue'),
        axios.get('/counters'),
        axios.get('/auth/me'),
      ]);

      const allTokens = queueRes.data;
      setQueue(allTokens.filter(t => t.status === 'Waiting'));
      setCalledTokens(allTokens.filter(t => t.status === 'Called'));

      const myAssignedCounters = countersRes.data.filter(
        c => c.assignedAgent && c.assignedAgent._id === userRes.data._id
      );

      if (myAssignedCounters.length > 0) {
        setCounters(myAssignedCounters);
        if (!selectedCounter || !myAssignedCounters.find(b => b._id === selectedCounter)) {
          setSelectedCounter(myAssignedCounters[0]._id);
        }
      } else {
        setCounters(countersRes.data);
        if (!selectedCounter && countersRes.data.length > 0) {
          setSelectedCounter(countersRes.data[0]._id);
        }
      }
      setError('');
    } catch (err) {
      console.error('Error fetching data', err);
      setError('Failed to fetch queue data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (socket) {
      socket.on('queue_updated', fetchData);
    }
    return () => {
      if (socket) socket.off('queue_updated', fetchData);
    };
  }, [socket]);

  const callNext = async () => {
    if (!selectedCounter) {
      setError('Please select your service counter first.');
      return;
    }
    setCalling(true);
    setError('');
    try {
      await axios.put('/queue/call-next', { counterId: selectedCounter });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to call next customer');
    } finally {
      setCalling(false);
    }
  };

  const completeService = async (tokenId) => {
    setCompletingId(tokenId);
    try {
      await axios.put(`/queue/${tokenId}/complete`);
      fetchData();
    } catch (err) {
      setError('Failed to complete service');
    } finally {
      setCompletingId(null);
    }
  };

  const selectedCounterName = counters.find(c => c._id === selectedCounter)?.counterName || 'N/A';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-gray-500 font-medium">Loading queue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-16 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dark">Teller Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your service counter and process customer tokens.</p>
        </div>

        {/* Counter Selector */}
        <div className="flex items-center gap-3 glassmorphism px-4 py-3 rounded-2xl shadow-sm">
          <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Active Counter</span>
            <select
              id="counter-selector"
              value={selectedCounter}
              onChange={(e) => setSelectedCounter(e.target.value)}
              className="bg-transparent border-none font-bold text-primary outline-none cursor-pointer text-sm"
            >
              <option value="" disabled>Select Counter</option>
              {counters.map(c => (
                <option key={c._id} value={c._id}>{c.counterName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: <Users className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', label: 'Waiting', value: queue.length },
          { icon: <Activity className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', label: 'In Service', value: calledTokens.length },
          { icon: <Building2 className="w-5 h-5 text-primary" />, bg: 'bg-primary/10', label: 'My Counter', value: selectedCounterName },
        ].map((s, i) => (
          <div key={i} className="glassmorphism rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-black text-dark">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Waiting Queue ── */}
        <div className="lg:col-span-2 glassmorphism rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Waiting Queue
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{queue.length}</span>
            </h2>
            <button
              id="call-next-btn"
              onClick={callNext}
              disabled={queue.length === 0 || calling}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all shadow-md ${
                queue.length > 0 && !calling
                  ? 'bg-primary hover:bg-[#16325a] text-white hover:-translate-y-0.5 hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {calling
                ? <span className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Calling...</span>
                : <span className="flex items-center gap-2"><PhoneCall className="w-4 h-4" /> Call Next</span>
              }
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="pb-3 text-xs text-gray-400 font-bold uppercase tracking-wider px-3">Token</th>
                  <th className="pb-3 text-xs text-gray-400 font-bold uppercase tracking-wider px-3">Customer</th>
                  <th className="pb-3 text-xs text-gray-400 font-bold uppercase tracking-wider px-3">Service</th>
                  <th className="pb-3 text-xs text-gray-400 font-bold uppercase tracking-wider px-3">Position</th>
                </tr>
              </thead>
              <tbody>
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-gray-400">
                      <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No customers currently waiting</p>
                    </td>
                  </tr>
                ) : (
                  queue.map((token, idx) => (
                    <tr key={token._id} className="border-b border-gray-50 last:border-0 hover:bg-primary/5 transition-colors">
                      <td className="py-4 px-3">
                        <span className="text-lg font-black text-primary">{token.tokenNumber}</span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="font-semibold text-dark text-sm">{token.customerName}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{token.phoneNumber}</div>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${serviceColorMap[token.serviceType] || 'bg-gray-100 text-gray-600'}`}>
                          {token.serviceType}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-sm font-bold text-gray-600">#{idx + 1}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── In Service Panel ── */}
        <div className="flex flex-col gap-4">
          <div className="glassmorphism rounded-3xl p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-5">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              In Service
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{calledTokens.length}</span>
            </h3>

            {calledTokens.length === 0 ? (
              <div className="text-center py-10">
                <CheckSquare className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-400 text-sm">No tokens currently in service</p>
                <p className="text-gray-300 text-xs mt-1">Press "Call Next" to begin</p>
              </div>
            ) : (
              <div className="space-y-4">
                {calledTokens.map((token) => (
                  <div key={token._id} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/30 rounded-full blur-xl -mr-4 -mt-4" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-black text-emerald-700">{token.tokenNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${serviceColorMap[token.serviceType] || 'bg-gray-100 text-gray-600'}`}>
                          {token.serviceType}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-dark">{token.customerName}</p>
                      <p className="text-xs text-gray-500 mb-1">{token.phoneNumber}</p>
                      {token.serviceCounterId && (
                        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {token.serviceCounterId.counterName}
                        </p>
                      )}
                      <button
                        id={`complete-btn-${token._id}`}
                        onClick={() => completeService(token._id)}
                        disabled={completingId === token._id}
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                      >
                        {completingId === token._id
                          ? <span className="flex items-center gap-2"><div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" /> Completing...</span>
                          : <span className="flex items-center gap-2"><CheckSquare className="w-3.5 h-3.5" /> Mark as Done <ChevronRight className="w-3.5 h-3.5" /></span>
                        }
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick tips */}
          <div className="glassmorphism rounded-3xl p-5 border border-primary/10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Guide</p>
            {[
              'Select your counter using the dropdown at the top.',
              'Click "Call Next" to pull the next waiting customer.',
              'Mark as Done once you finish serving.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                <span className="text-xs font-black text-primary mt-0.5">{i + 1}.</span>
                <p className="text-xs text-gray-500">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
