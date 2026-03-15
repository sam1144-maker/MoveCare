import { useState, useEffect } from 'react';
import { Search, ShieldCheck, Mail, Award, Briefcase, GraduationCap, Clock } from 'lucide-react';
import { apiFetch, API_BASE } from '../config';

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  specialization?: string;
  experience?: string;
  license?: string;
  createdAt: string;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/api/admin/doctors`);
      const data = await res.json();
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Fetch Doctors Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.fullName.toLowerCase().includes(search.toLowerCase()) || 
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 border-b-2 border-slate-100 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Doctor Directory</h1>
            <p className="text-slate-500 font-medium">Verified medical professionals in the network</p>
          </div>
        </div>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="bg-emerald-500 rounded-2xl px-8 py-3.5 flex items-center gap-4 text-white shadow-lg shadow-emerald-200">
          <div className="text-sm font-bold uppercase tracking-widest opacity-80">Network Status</div>
          <div className="text-2xl font-black">{doctors.length} Verified</div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-3xl border-2 border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-3xl border-2 border-slate-100 p-6 hover:border-emerald-500 transition-all group hover:shadow-xl hover:shadow-emerald-50">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center font-black text-2xl text-emerald-400 shadow-md">
                  {doctor.fullName.charAt(0)}
                </div>
                <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-wider">
                  Verified License
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                  Dr. {doctor.fullName}
                </h3>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <Award className="w-4 h-4" />
                  {doctor.specialization || 'General Practice'}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-500">
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">{doctor.experience || 'Not specified'} years exp.</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">License: {doctor.license || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold tracking-tight lowercase">{doctor.email}</span>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5" />
                  Joined {new Date(doctor.createdAt).toLocaleDateString()}
                </div>
                <button className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline">
                  View Case Log
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredDoctors.length === 0 && (
        <div className="p-20 text-center bg-white rounded-3xl border-2 border-slate-100">
          <Award className="w-16 h-16 text-slate-100 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-300">No doctors matched your criteria</h3>
        </div>
      )}
    </div>
  );
}
