import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import {
  BarChart3, Users, Clock, Settings, Building2, Trash2,
  Power, AlertCircle, CheckCircle2, TrendingUp, Activity,
  UserCheck, Ticket, PlusCircle, RefreshCw,
} from 'lucide-react';

const serviceColors = {
  'Account Services': { bar: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  'Loan Services': { bar: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700' },
  'Foreign Exchange': { bar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
  'General Inquiry': { bar: 'bg-teal-500', badge: 'bg-teal-100 text-teal-700' },
  'Card Services': { bar: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700' },
  'Fixed Deposits': { bar: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
};

const TABS = ['Overview', 'Counters', 'Analytics'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [counters, setCounters] = useState([]);
  const [newCounterName, setNewCounterName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0, waiting: 0, inService: 0, completed: 0,
    avgServiceTime: '0m', performance: 'N/A', serviceBreakdown: {},
  });
  const [agents, setAgents] = useState([]);
  const [allTokens, setAllTokens] = useState([]);
  const [error, setError] = useState('');
  const socket = useSocket();

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [countersRes, statsRes, agentsRes, tokensRes] = await Promise.all([
        axios.get('/counters'),
        axios.get('/queue/stats'),
        axios.get('/auth/agents'),
        axios.get('/queue/all'),
      ]);
      setCounters(countersRes.data);
      setStats(statsRes.data);
      setAgents(agentsRes.data);
      setAllTokens(tokensRes.data);
      setError('');
    } catch (err) {
      console.error('Error fetching admin data', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const createCounter = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/counters', { counterName: newCounterName });
      setNewCounterName('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create counter');
    }
  };

  const handleAssignAgent = async (counterId, agentId) => {
    try {
      await axios.put(`/counters/${counterId}/assign`, { agentId: agentId || null });
      fetchData();
    } catch (err) {
      setError('Failed to assign agent');
    }
  };

  const handleToggleCounter = async (counterId) => {
    try {
      await axios.put(`/counters/${counterId}/toggle`);
      fetchData();
    } catch (err) {
      setError('Failed to toggle counter');
    }
  };

  const handleDeleteCounter = async (counterId, name) => {
    if (!window.confirm(`Delete counter "${name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/counters/${counterId}`);
      fetchData();
    } catch (err) {
      setError('Failed to delete counter');
    }
  };

  const activeCounters = counters.filter(c => c.status === 'Active').length;
  const totalBreakdown = Object.values(stats.serviceBreakdown || {}).reduce((a, b) => a + b, 0) || 1;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="text-gray-500 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-16 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-dark">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Full control over counters, staff, and queue analytics.</p>
        </div>
        <button
          id="refresh-btn"
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 glassmorphism px-4 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-primary/5 transition-all border border-primary/20"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Users className="w-5 h-5 text-primary" />, bg: 'bg-primary/10', label: 'Total Today', value: stats.totalCustomers },
          { icon: <Activity className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', label: 'Waiting', value: stats.waiting },
          { icon: <UserCheck className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50', label: 'In Service', value: stats.inService },
          { icon: <Settings className="w-5 h-5 text-violet-600" />, bg: 'bg-violet-50', label: 'Active Counters', value: activeCounters },
        ].map((s, i) => (
          <div key={i} className="glassmorphism rounded-2xl p-5 hover:-translate-y-1 transition-transform duration-300">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-2xl font-black text-dark">{s.value}</p>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 mb-8 bg-gray-100/70 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            id={`tab-${tab.toLowerCase()}`}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-white text-primary shadow-sm border border-primary/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Performance + Avg Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glassmorphism rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Avg Service Time</p>
                  <p className="text-2xl font-black text-dark">{stats.avgServiceTime}</p>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (parseFloat(stats.avgServiceTime) / 30) * 100)}%` }}
                />
              </div>
            </div>

            <div className="glassmorphism rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Performance</p>
                  <p className={`text-2xl font-black ${
                    stats.performance === 'Excellent' ? 'text-emerald-600'
                    : stats.performance === 'Good' ? 'text-amber-600'
                    : 'text-red-500'
                  }`}>{stats.performance}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                {stats.performance === 'Excellent' ? 'Great! Service times are well within limits.'
                  : stats.performance === 'Good' ? 'Good performance. Monitor wait times closely.'
                  : 'Warning! Service times are too high. Take action.'}
              </p>
            </div>
          </div>

          {/* Live Queue Table */}
          <div className="glassmorphism rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" /> Live Queue
              <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                {allTokens.filter(t => t.status === 'Waiting' || t.status === 'Called').length} active
              </span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    {['Token', 'Customer', 'Service', 'Status', 'Counter'].map(h => (
                      <th key={h} className="pb-3 text-xs text-gray-400 font-bold uppercase tracking-wider px-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTokens.filter(t => t.status === 'Waiting' || t.status === 'Called').length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-400">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        Queue is currently empty
                      </td>
                    </tr>
                  ) : (
                    allTokens.filter(t => t.status === 'Waiting' || t.status === 'Called').map(token => (
                      <tr key={token._id} className="border-b border-gray-50 last:border-0 hover:bg-primary/5 transition-colors">
                        <td className="py-3.5 px-2"><span className="font-black text-primary">{token.tokenNumber}</span></td>
                        <td className="py-3.5 px-2">
                          <div className="text-sm font-semibold text-dark">{token.customerName}</div>
                          <div className="text-xs text-gray-400">{token.phoneNumber}</div>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${serviceColors[token.serviceType]?.badge || 'bg-gray-100 text-gray-600'}`}>
                            {token.serviceType}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${token.status === 'Called' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {token.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-xs text-gray-500">
                          {token.serviceCounterId?.counterName || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── COUNTERS TAB ── */}
      {activeTab === 'Counters' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Counters Table */}
          <div className="lg:col-span-2 glassmorphism rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6">Service Counters</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    {['Counter Name', 'Assigned Teller', 'Status', 'Actions'].map(h => (
                      <th key={h} className="pb-3 text-xs text-gray-400 font-bold uppercase tracking-wider px-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {counters.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-gray-400">No service counters found. Create one →</td>
                    </tr>
                  ) : (
                    counters.map((counter) => (
                      <tr key={counter._id} className="border-b border-gray-50 last:border-0 hover:bg-primary/5 transition-colors">
                        <td className="py-4 px-2 font-bold text-dark">{counter.counterName}</td>
                        <td className="py-4 px-2">
                          <select
                            id={`assign-agent-${counter._id}`}
                            value={counter.assignedAgent?._id || ''}
                            onChange={(e) => handleAssignAgent(counter._id, e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary/40 outline-none bg-white min-w-[140px]"
                          >
                            <option value="">Unassigned</option>
                            {agents.map(agent => (
                              <option key={agent._id} value={agent._id}>{agent.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            counter.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {counter.status}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <button
                              id={`toggle-counter-${counter._id}`}
                              onClick={() => handleToggleCounter(counter._id)}
                              title={counter.status === 'Active' ? 'Deactivate' : 'Activate'}
                              className={`p-2 rounded-lg transition-colors ${
                                counter.status === 'Active'
                                  ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              id={`delete-counter-${counter._id}`}
                              onClick={() => handleDeleteCounter(counter._id, counter.counterName)}
                              title="Delete Counter"
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Counter Form */}
          <div className="glassmorphism rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <PlusCircle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">Create Counter</h2>
            </div>
            <form onSubmit={createCounter} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Counter Name</label>
                <input
                  id="new-counter-name-input"
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/40 focus:border-transparent outline-none transition-all bg-white/60"
                  placeholder="e.g. Counter 1 or Service Desk A"
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                />
              </div>
              <button
                id="create-counter-btn"
                type="submit"
                className="w-full bg-primary hover:bg-[#16325a] text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" /> Add Service Counter
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Summary</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Counters</span>
                  <span className="font-bold">{counters.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Active</span>
                  <span className="font-bold text-emerald-600">{activeCounters}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Inactive</span>
                  <span className="font-bold text-gray-400">{counters.length - activeCounters}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">With Teller</span>
                  <span className="font-bold">{counters.filter(c => c.assignedAgent).length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {activeTab === 'Analytics' && (
        <div className="space-y-6">
          {/* Service Type Breakdown */}
          <div className="glassmorphism rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" /> Service Type Breakdown
            </h2>
            {Object.keys(stats.serviceBreakdown || {}).length === 0 ? (
              <p className="text-gray-400 text-center py-8">No data yet. Tokens will appear here once customers join the queue.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.serviceBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => {
                    const percent = Math.round((count / totalBreakdown) * 100);
                    const colors = serviceColors[type] || { bar: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600' };
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors.badge}`}>{type}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-dark">{count}</span>
                            <span className="text-xs text-gray-400">{percent}%</span>
                          </div>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors.bar} rounded-full transition-all duration-700`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Token History */}
          <div className="glassmorphism rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Token History (Today)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    {['Token', 'Customer', 'Service', 'Status', 'Time'].map(h => (
                      <th key={h} className="pb-3 text-xs text-gray-400 font-bold uppercase tracking-wider px-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTokens.slice(0, 20).map(token => (
                    <tr key={token._id} className="border-b border-gray-50 last:border-0 hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-2 font-black text-primary text-sm">{token.tokenNumber}</td>
                      <td className="py-3 px-2">
                        <div className="text-sm font-semibold">{token.customerName}</div>
                        <div className="text-xs text-gray-400">{token.phoneNumber}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${serviceColors[token.serviceType]?.badge || 'bg-gray-100 text-gray-600'}`}>
                          {token.serviceType}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          token.status === 'Completed' ? 'bg-emerald-100 text-emerald-700'
                          : token.status === 'Called' ? 'bg-blue-100 text-blue-700'
                          : token.status === 'Cancelled' ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-700'
                        }`}>
                          {token.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-400">
                        {new Date(token.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
