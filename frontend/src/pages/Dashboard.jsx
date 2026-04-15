import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Database, Search, Trash2, CheckCircle2, AlertCircle, Loader2, Activity, Zap, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  // Stats State
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('bloomStats');
    return saved ? JSON.parse(saved) : { totalQueries: 0, hits: 0, misses: 0, falsePositives: 0 };
  });

  // Activity Log State
  const [activityFeed, setActivityFeed] = useState(() => {
    const saved = localStorage.getItem('bloomActivity');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bloomStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('bloomActivity', JSON.stringify(activityFeed));
  }, [activityFeed]);

  const addActivity = (type, key, result, statusType) => {
    setActivityFeed(prev => [
      { id: Date.now(), type, key, result, statusType, time: new Date().toLocaleTimeString() },
      ...prev
    ].slice(0, 50)); // Keep only last 50
  };

  // States for SET operation
  const [setKey, setSetKey] = useState('');
  const [setValue, setSetValue] = useState('');
  const [setLoading, setSetLoading] = useState(false);

  // States for GET operation
  const [getKey, setGetKey] = useState('');
  const [getResult, setGetResult] = useState(null);
  const [getLoading, setGetLoading] = useState(false);

  // States for INVALIDATE operation
  const [invKey, setInvKey] = useState('');
  const [invLoading, setInvLoading] = useState(false);

  // Global toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSet = async (e) => {
    e.preventDefault();
    if (!setKey || !setValue) return showToast('Key and Value are required', 'error');
    
    setSetLoading(true);
    try {
      const res = await api.post('/set', { key: setKey, value: setValue });
      showToast(res.data.message || 'Key set successfully', 'success');
      addActivity('Set', setKey, 'Success', 'success');
      setSetKey('');
      setSetValue('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to set key', 'error');
      addActivity('Set', setKey, 'Failed', 'error');
    } finally {
      setSetLoading(false);
    }
  };

  const handleGet = async (e) => {
    e.preventDefault();
    if (!getKey) return showToast('Key is required', 'error');
    
    setGetLoading(true);
    setGetResult(null);
    setStats(s => ({ ...s, totalQueries: s.totalQueries + 1 }));

    try {
      const res = await api.get(`/get/${getKey}`);
      
      let statusStr = 'Hit';
      let logType = 'Hit';
      let logStatus = 'success';
      
      // Backend returns { key, value, meta: { source, bloomFilterStatus } }
      if (res.data.meta && res.data.meta.bloomFilterStatus === 'Possibly Invalid') {
         // Bloom filter thought it was invalid, forced a DB check, but data existed = false positive (or actual update)
         statusStr = 'Hit (F. Positive)';
         setStats(s => ({ ...s, falsePositives: s.falsePositives + 1, hits: s.hits + 1 }));
         logType = 'False Pos.';
         logStatus = 'warning';
      } else {
         setStats(s => ({ ...s, hits: s.hits + 1 }));
      }

      setGetResult({
         status: statusStr,
         data: { value: res.data.value },
         message: `Source: ${res.data.meta?.source || 'Backend'}`
      });
      
      showToast(`Data retrieved from ${res.data.meta?.source || 'Cache'}`, 'success');
      addActivity('Get', getKey, logType, logStatus);

    } catch (err) {
      if (err.response?.status === 404) {
         setGetResult({ status: 'Miss', message: 'Key not found in DB.' });
         setStats(s => ({ ...s, misses: s.misses + 1 }));
         addActivity('Get', getKey, 'Miss', 'error');
      } else {
         showToast(err.response?.data?.message || 'Failed to get key', 'error');
         addActivity('Get', getKey, 'Error', 'error');
      }
    } finally {
      setGetLoading(false);
    }
  };

  const handleInvalidate = async (e) => {
    e.preventDefault();
    if (!invKey) return showToast('Key is required', 'error');
    
    setInvLoading(true);
    try {
      const res = await api.post('/invalidate', { key: invKey });
      showToast(res.data.message || 'Key invalidated successfully', 'success');
      addActivity('Invalidate', invKey, 'Invalidated', 'success');
      setInvKey('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to invalidate key', 'error');
      addActivity('Invalidate', invKey, 'Failed', 'error');
    } finally {
      setInvLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-900 text-white relative flex flex-col font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[20%] w-[700px] h-[700px] bg-green-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      {/* Navbar Minimalist */}
      <header className="glass sticky top-0 z-50 border-b border-white/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl shadow-lg shadow-primary-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
            Bloom Filter Central
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 relative z-10 flex flex-col gap-8">
        
        {/* Statistics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Queries" value={stats.totalQueries} icon={Activity} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
          <StatCard title="Cache Hits" value={stats.hits} icon={CheckCircle} color="text-green-400" bg="bg-green-500/10" border="border-green-500/20" />
          <StatCard title="True Misses" value={stats.misses} icon={XCircle} color="text-red-400" bg="bg-red-500/10" border="border-red-500/20" />
          <StatCard title="False Positives" value={stats.falsePositives} icon={Zap} color="text-yellow-400" bg="bg-yellow-500/10" border="border-yellow-500/20" />
        </div>

        {/* Action Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* SET Block */}
          <div className="glass rounded-2xl p-6 border border-white/5 shadow-2xl hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">Set Data</h2>
            </div>
            <form onSubmit={handleSet} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={setKey}
                  onChange={(e) => setSetKey(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-sm placeholder:text-gray-600 outline-none"
                  placeholder="Enter Key..."
                />
              </div>
              <div>
                <input
                  type="text"
                  value={setValue}
                  onChange={(e) => setSetValue(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono text-sm placeholder:text-gray-600 outline-none"
                  placeholder="Enter Data Value..."
                />
              </div>
              <button
                type="submit"
                disabled={setLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-base-900 font-bold rounded-xl py-3 px-4 flex items-center justify-center transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
              >
                {setLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Store in Cache'}
              </button>
            </form>
          </div>

          {/* GET Block */}
          <div className="glass rounded-2xl p-6 border border-white/5 shadow-2xl hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Search className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">Retrieve Data</h2>
            </div>
            <form onSubmit={handleGet} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={getKey}
                  onChange={(e) => setGetKey(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm placeholder:text-gray-600 outline-none"
                  placeholder="Search key..."
                />
              </div>
              <button
                type="submit"
                disabled={getLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 px-4 flex items-center justify-center transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
              >
                {getLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Query Bloom Filter'}
              </button>
            </form>

            <AnimatePresence>
              {getResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-6 p-4 bg-black/30 rounded-xl border border-white/5 backdrop-blur-md relative overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                    getResult.status === 'Hit' ? 'bg-green-500' :
                    getResult.status.includes('Miss') ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex items-center justify-between mb-3 ml-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Result</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                      getResult.status === 'Hit' ? 'bg-green-500/20 text-green-400' :
                      getResult.status.includes('Miss') ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {getResult.status}
                    </span>
                  </div>
                  {getResult.data && (
                    <div className="ml-2 bg-black/50 p-3 rounded-lg border border-white/5">
                      <pre className="text-xs font-mono text-primary-200 overflow-x-auto">
                        {JSON.stringify(getResult.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-3 ml-2">{getResult.message}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* INVALIDATE Block */}
          <div className="glass rounded-2xl p-6 border border-white/5 shadow-2xl hover:border-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">Invalidate Cache</h2>
            </div>
            <form onSubmit={handleInvalidate} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={invKey}
                  onChange={(e) => setInvKey(e.target.value)}
                  className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-mono text-sm placeholder:text-gray-600 outline-none text-red-200"
                  placeholder="Key to invalidate"
                />
              </div>
              <button
                type="submit"
                disabled={invLoading}
                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 disabled:opacity-50 text-red-400 font-semibold rounded-xl py-3 px-4 flex items-center justify-center transition-all"
              >
                {invLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Invalidate Key'}
              </button>
            </form>
          </div>

        </div>

        {/* Activity Feed */}
        <div className="glass rounded-2xl p-6 border border-white/5 mt-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" />
              Live Activity Feed
            </h2>
            <button 
              onClick={() => {
                 if(window.confirm('Clear all statistics and activity history?')) {
                    setStats({ totalQueries: 0, hits: 0, misses: 0, falsePositives: 0 });
                    setActivityFeed([]);
                    localStorage.removeItem('bloomStats');
                    localStorage.removeItem('bloomActivity');
                 }
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 font-semibold hover:bg-red-500/20 border border-red-500/20 transition-all"
            >
              Clear History
            </button>
          </div>
          {activityFeed.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No activity recorded yet in this session.
            </div>
          ) : (
            <div className="overflow-hidden relative">
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-white/5">
                      <th className="pb-3 px-4 font-medium">Time</th>
                      <th className="pb-3 px-4 font-medium">Action</th>
                      <th className="pb-3 px-4 font-medium">Key</th>
                      <th className="pb-3 px-4 font-medium text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <AnimatePresence>
                      {activityFeed.map((log) => (
                        <motion.tr 
                          key={log.id}
                          initial={{ opacity: 0, backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
                          animate={{ opacity: 1, backgroundColor: 'transparent' }}
                          className="border-b border-white/5 hover:bg-white/[0.02]"
                        >
                          <td className="py-3 px-4 text-gray-400 text-xs tabular-nums">{log.time}</td>
                          <td className="py-3 px-4 text-gray-300 font-medium">{log.type}</td>
                          <td className="py-3 px-4 font-mono text-primary-300">{log.key}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                              log.statusType === 'success' ? 'bg-green-500/10 text-green-400' :
                              log.statusType === 'error' ? 'bg-red-500/10 text-red-400' :
                              'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {log.result}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl glass border ${
              toast.type === 'error' ? 'border-red-500/50 bg-red-950/80 text-red-100' : 
              toast.type === 'warning' ? 'border-yellow-500/50 bg-yellow-950/80 text-yellow-100' :
              'border-emerald-500/50 bg-emerald-950/80 text-emerald-100'
            }`}
          >
            {toast.type === 'error' ? <XCircle className="w-5 h-5 text-red-400" /> : 
             toast.type === 'warning' ? <AlertCircle className="w-5 h-5 text-yellow-400" /> :
             <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Component for Stats
function StatCard({ title, value, icon: Icon, color, bg, border }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass rounded-2xl p-5 border ${border} relative overflow-hidden flex items-center gap-4`}
    >
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</h3>
        <p className="text-2xl font-bold tracking-tight text-white tabular-nums">{value}</p>
      </div>
    </motion.div>
  );
}
