import { useState, useEffect } from 'react';
import { Activity, Users, FileText, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { apiFetch, API_BASE } from '../config';

interface AnalyticsData {
  totalPatients: number;
  totalDoctors: number;
  totalRecords: number;
  reportTypeStats: { _id: string; count: number }[];
  recentActivity: any[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/api/admin/analytics`);
      const result = await res.json();
      if (result.success) {
        setData(result.stats);
      }
    } catch (error) {
      console.error('Analytics Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">System Analytics</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Real-time Health Monitoring Overview</p>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-4xl shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="w-20 h-20 text-slate-900" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Patients</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-black text-slate-900 leading-none">{data?.totalPatients || 0}</h2>
            <div className="flex items-center text-emerald-500 font-bold text-xs mb-1">
              <ArrowUpRight className="w-4 h-4" />
              +12%
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-4xl shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-20 h-20 text-slate-900" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Verified Doctors</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-black text-slate-900 leading-none">{data?.totalDoctors || 0}</h2>
            <div className="flex items-center text-blue-500 font-bold text-xs mb-1">
              <ArrowUpRight className="w-4 h-4" />
              +4%
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-4xl shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <FileText className="w-20 h-20 text-slate-900" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Health Records</p>
          <div className="flex items-end gap-3">
            <h2 className="text-5xl font-black text-slate-900 leading-none">{data?.totalRecords || 0}</h2>
            <div className="flex items-center text-amber-500 font-bold text-xs mb-1">
              <ArrowUpRight className="w-4 h-4" />
              +28%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Report Distribution Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Report Type Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.reportTypeStats || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="count"
                  nameKey="_id"
                >
                  {data?.reportTypeStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {data?.reportTypeStats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[11px] font-black text-slate-500 uppercase truncate">{stat._id} ({stat.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Activity Log */}
        <div className="bg-white p-8 rounded-4xl border-2 border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Recent System Activity
          </h3>
          <div className="space-y-6">
            {data?.recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-slate-900 transition-colors">
                  <Activity className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
                </div>
                <div className="flex-1 border-b-2 border-slate-50 pb-4">
                  <p className="text-sm font-bold text-slate-900"> New {activity.reportType} created</p>
                  <p className="text-xs text-slate-500 mt-0.5">Patient: <span className="font-black text-slate-700">{activity.patientId?.fullName || 'Anonymous'}</span></p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                  {new Date(activity.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-4 rounded-2xl border-2 border-slate-100 font-black text-xs text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors">
            View Full System Log
          </button>
        </div>
      </div>
    </div>
  );
}
