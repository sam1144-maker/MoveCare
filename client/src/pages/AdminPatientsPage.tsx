import React, { useState, useEffect } from 'react';
import { Search, Users, ShieldCheck, ChevronDown, ChevronUp, Mail, Phone, MapPin, Clock, Calendar, X } from 'lucide-react';
import { apiFetch, API_BASE } from '../config';

interface CaregiverInfo {
  fullName: string;
  relationship: string;
  phone: string;
  email: string;
  city: string;
  availableHours: string;
}

interface Patient {
  _id: string;
  fullName: string;
  email: string;
  age?: string;
  createdAt: string;
  caregiver?: CaregiverInfo;
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/api/admin/patients`);
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients);
      }
    } catch (error) {
      console.error('Fetch Patients Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Directory</h1>
            <p className="text-slate-500 font-medium">Manage patients and their emergency contacts</p>
          </div>
        </div>
      </header>

      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 focus:bg-white outline-none transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="bg-white border-2 border-slate-100 rounded-2xl px-6 py-3.5 flex items-center gap-4">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Patients</div>
          <div className="text-2xl font-black text-slate-900">{patients.length}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 bg-white rounded-3xl border-2 border-slate-100">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-bold">Loading patient records...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b-2 border-slate-100">
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Joined On</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Caregiver</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-50">
                {filteredPatients.map((patient) => {
                  const isExpanded = expandedId === patient._id;
                  const hasCaregiver = patient.caregiver && patient.caregiver.fullName;

                  return (
                    <React.Fragment key={patient._id}>
                      <tr className={`hover:bg-slate-50/50 transition-colors ${isExpanded ? 'bg-emerald-50/30' : ''}`}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 shrink-0">
                              {patient.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{patient.fullName}</p>
                              <p className="text-xs text-slate-500 truncate">{patient.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-600">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5">
                          {hasCaregiver ? (
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full w-fit">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Assigned</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full w-fit">
                              <X className="w-3 h-3 text-slate-400" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">None</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : patient._id)}
                            className="bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-colors inline-flex items-center gap-2 font-bold text-xs text-slate-600"
                          >
                            Details
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="px-6 pb-6 pt-0 bg-emerald-50/10 border-b-2 border-slate-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white border-2 border-emerald-100 rounded-2xl shadow-sm">
                              <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                                  Patient Overview
                                </h4>
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Registered Date</p>
                                      <p className="text-sm font-bold text-slate-700">{new Date(patient.createdAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase">Age / Status</p>
                                      <p className="text-sm font-bold text-slate-700">{patient.age || 'N/A'} • Active</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  Caregiver Information
                                </h4>
                                {hasCaregiver ? (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Name</p>
                                        <p className="text-sm font-bold text-slate-700">{patient.caregiver!.fullName}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Relationship</p>
                                        <p className="text-sm font-bold text-slate-700">{patient.caregiver!.relationship}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-3">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-sm font-medium text-slate-600">{patient.caregiver!.phone}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-sm font-medium text-slate-600">{patient.caregiver!.email}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-sm font-medium text-slate-600">Available: {patient.caregiver!.availableHours}</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center">
                                    <p className="text-sm text-slate-400 font-bold">No caregiver assigned</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredPatients.length === 0 && (
            <div className="p-20 text-center">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">No patients found matches your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
