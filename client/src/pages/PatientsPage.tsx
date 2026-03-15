import { useState, useEffect } from 'react';
import { Users, Activity, Phone, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, apiFetch } from '../config';
import { useVitalsSocket } from '../hooks/useVitalsSocket';
import { PatientCard } from './DoctorDashboard';

interface DBPatient {
  _id: string;
  fullName: string;
  email: string;
  age?: string;
  caregiver?: {
    fullName: string;
    relationship: string;
    phone: string;
    email?: string;
    city?: string;
    availableHours?: string;
  };
  createdAt: string;
}

export default function PatientsPage() {
  const { patients: simPatients } = useVitalsSocket();
  const [dbPatients, setDbPatients] = useState<DBPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch(`${API_BASE}/api/auth/patients`)
      .then(r => r.json())
      .then(data => { setDbPatients(data.patients || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Directory</h1>
            <p className="text-sm text-slate-400">Live monitored patients & registered users</p>
          </div>
        </div>
      </header>

      {/* Simulated Live Patients */}
      <section className="mb-10">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          Live Monitored
          <span className="text-[10px] font-medium text-slate-300 normal-case">(Simulated Vitals)</span>
        </h2>

        {simPatients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {simPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} onClick={() => navigate(`/patients/${patient.id}`)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-200">
            <Activity className="w-8 h-8 text-slate-300 mb-3 animate-pulse" />
            <p className="text-sm text-slate-400 font-medium">Connecting to live vitals stream...</p>
          </div>
        )}
      </section>

      {/* Registered DB Patients */}
      <section>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          Registered Patients
          <span className="text-[10px] font-medium text-slate-300">({dbPatients.length})</span>
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-200">
            <Activity className="w-8 h-8 text-slate-300 mb-3 animate-pulse" />
            <p className="text-sm text-slate-400 font-medium">Loading patients...</p>
          </div>
        ) : dbPatients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {dbPatients.map((patient) => (
              <div key={patient._id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{patient.fullName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{patient.email}</p>
                    {patient.age && <p className="text-[11px] text-slate-400 mt-0.5">Age: {patient.age}</p>}
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700">
                    Patient
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">Tests Pending</p>
                      <p className="text-[11px] text-amber-600 mt-0.5">Health tests needed to display vitals.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  {patient.caregiver && patient.caregiver.fullName ? (
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs">
                      <Users className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="font-bold text-slate-700 truncate">{patient.caregiver.fullName}</span>
                      <span className="text-slate-400">({patient.caregiver.relationship})</span>
                      <span className="ml-auto flex items-center gap-1 text-emerald-600 font-medium flex-shrink-0">
                        <Phone className="w-3 h-3" />
                        {patient.caregiver.phone}
                      </span>
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-xs text-slate-400 italic">
                      <Users className="w-3 h-3 flex-shrink-0" />
                      No caregiver assigned
                    </div>
                  )}
                </div>

                <div className="mt-2.5 flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  Joined {new Date(patient.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-sm text-slate-400 font-medium">No patients registered yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
