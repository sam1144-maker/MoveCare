import { useState, useEffect } from 'react';
import { Search, FileText, Calendar, X, Clock, Eye, Image as ImageIcon, TrendingUp, Filter } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { API_BASE } from '../config';

const API = `${API_BASE}/api/records`;

interface Parameter {
  fieldName: string;
  key: string;
  value: string;
  unit: string;
  normalRange: string;
}

interface PatientInfo {
  _id: string;
  fullName: string;
  age?: string;
  email: string;
}

interface RecordEntry {
  _id: string;
  patientId: PatientInfo;
  reportType: string;
  source: 'image_upload' | 'manual_form';
  parameters: Parameter[];
  imageBase64?: string;
  createdAt: string;
}

const REPORT_TYPES = ['All', 'Blood Test', 'Diabetes Report', 'Blood Pressure Log', 'Kidney Function Test', 'Liver Function Test', 'Thyroid Report', 'General Checkup'];
const DATE_FILTERS = ['All Time', 'Today', 'This Week', 'This Month'];

function getToken(): string {
  return localStorage.getItem('movecare_token') || '';
}

// Helper: check if value is in normal range
function getRangeStatus(value: string, normalRange: string): 'normal' | 'borderline' | 'abnormal' | 'unknown' {
  if (!normalRange || !value) return 'unknown';
  const numVal = parseFloat(value);
  if (isNaN(numVal)) return 'unknown';
  const match = normalRange.match(/([\d.]+)\s*[-–to]+\s*([\d.]+)/);
  if (!match) return 'unknown';
  const min = parseFloat(match[1]);
  const max = parseFloat(match[2]);
  const margin = (max - min) * 0.1;
  if (numVal >= min && numVal <= max) return 'normal';
  if (numVal >= min - margin && numVal <= max + margin) return 'borderline';
  return 'abnormal';
}

const STATUS_COLORS = {
  normal: 'text-green-700 bg-green-50 border-green-200',
  borderline: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  abnormal: 'text-red-700 bg-red-50 border-red-200',
  unknown: 'text-gray-700 bg-gray-50 border-gray-200',
};

export default function DoctorRecordsPage() {
  const [allRecords, setAllRecords] = useState<RecordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reportFilter, setReportFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [selectedRecord, setSelectedRecord] = useState<RecordEntry | null>(null);
  const [fullImage, setFullImage] = useState(false);

  useEffect(() => {
    fetch(`${API}/all`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(data => { setAllRecords(data.records || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Client-side filtering
  const filtered = allRecords.filter(r => {
    if (!r.patientId) return false;
    const name = r.patientId.fullName?.toLowerCase() || '';
    if (search && !name.includes(search.toLowerCase())) return false;
    if (reportFilter !== 'All' && r.reportType !== reportFilter) return false;

    if (dateFilter !== 'All Time') {
      const d = new Date(r.createdAt);
      const now = new Date();
      if (dateFilter === 'Today') {
        if (d.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === 'This Week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (d < weekAgo) return false;
      } else if (dateFilter === 'This Month') {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
      }
    }
    return true;
  });

  // Build trend data from all records for a specific patient
  const getPatientTrends = (patientId: string) => {
    const patientRecords = allRecords.filter(r => r.patientId?._id === patientId);
    const paramMap: Record<string, { fieldName: string; unit: string; normalRange: string; points: { date: string; value: number }[] }> = {};

    [...patientRecords].reverse().forEach(r => {
      const date = new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      r.parameters.forEach(p => {
        const numVal = parseFloat(p.value);
        if (isNaN(numVal)) return;
        if (!paramMap[p.key]) paramMap[p.key] = { fieldName: p.fieldName, unit: p.unit, normalRange: p.normalRange, points: [] };
        paramMap[p.key].points.push({ date, value: numVal });
      });
    });

    return Object.entries(paramMap).filter(([, v]) => v.points.length > 1);
  };

  const parseRange = (range: string): { min: number; max: number } | null => {
    const match = range.match(/([\d.]+)\s*[-–to]+\s*([\d.]+)/);
    return match ? { min: parseFloat(match[1]), max: parseFloat(match[2]) } : null;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Patient Records</h1>
            <p className="text-sm text-gray-500">View all submitted health reports across patients</p>
          </div>
        </div>
      </header>

      {/* ===== SEARCH & FILTER BAR ===== */}
      <div className="bg-white rounded-2xl border border-green-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
              placeholder="Search by patient name..."
            />
          </div>

          {/* Report Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={reportFilter}
              onChange={e => setReportFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none text-sm bg-white appearance-none cursor-pointer min-w-[180px]"
            >
              {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none text-sm bg-white appearance-none cursor-pointer min-w-[140px]"
            >
              {DATE_FILTERS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Count */}
          <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm font-bold text-green-700">
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* ===== RECORDS LIST ===== */}
      {loading ? (
        <div className="flex flex-col items-center py-16 bg-white rounded-2xl border border-green-200">
          <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 bg-white rounded-2xl border border-green-200">
          <FileText className="w-12 h-12 text-green-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-300">No Records Found</h3>
          <p className="text-sm text-gray-400 mt-1">
            {search || reportFilter !== 'All' || dateFilter !== 'All Time' ? 'Try adjusting your filters.' : 'No patient records have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(record => {
            const date = new Date(record.createdAt);
            const keyParams = record.parameters.slice(0, 3);
            const patient = record.patientId;

            return (
              <div key={record._id} className="bg-white rounded-2xl border-2 border-green-100 hover:border-green-300 transition-all shadow-sm">
                <div className="px-5 py-4 flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    {record.source === 'image_upload'
                      ? <ImageIcon className="w-5 h-5 text-green-600" />
                      : <FileText className="w-5 h-5 text-green-600" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-gray-800">{patient?.fullName || 'Unknown'}</span>
                      {patient?.age && <span className="text-xs text-gray-400">Age {patient.age}</span>}
                      <span className="text-gray-300">·</span>
                      <span className="text-sm font-semibold text-gray-600">{record.reportType}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${record.source === 'image_upload' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {record.source === 'image_upload' ? 'AI Extracted' : 'Manual Entry'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-gray-300">·</span>
                      {keyParams.map((p, i) => (
                        <span key={i} className="font-medium text-gray-500">
                          {p.fieldName}: <strong className="text-gray-700">{p.value}{p.unit ? ` ${p.unit}` : ''}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-50 border border-green-200 text-green-700 font-bold text-xs rounded-xl hover:bg-green-100 hover:border-green-300 transition-all flex-shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Full Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== FULL REPORT MODAL ===== */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end" onClick={() => { setSelectedRecord(null); setFullImage(false); }}>
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-green-100 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedRecord.reportType}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedRecord.patientId?.fullName}
                  {selectedRecord.patientId?.age ? ` · Age ${selectedRecord.patientId.age}` : ''}
                  {' · '}
                  {new Date(selectedRecord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => { setSelectedRecord(null); setFullImage(false); }} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Source Badge */}
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedRecord.source === 'image_upload' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {selectedRecord.source === 'image_upload' ? 'AI Extracted from Image' : 'Manual Entry'}
                </span>
              </div>

              {/* Report Image */}
              {selectedRecord.imageBase64 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-2">Original Report Image</h3>
                  <img
                    src={selectedRecord.imageBase64}
                    alt="Report"
                    className={`rounded-xl border border-gray-200 object-contain cursor-pointer hover:opacity-80 transition-opacity ${fullImage ? 'max-h-[60vh]' : 'h-32'}`}
                    onClick={() => setFullImage(!fullImage)}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Click to {fullImage ? 'shrink' : 'expand'}</p>
                </div>
              )}

              {/* All Parameters */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Parameters</h3>
                <div className="space-y-2">
                  {selectedRecord.parameters.map((p, i) => {
                    const status = getRangeStatus(p.value, p.normalRange);
                    return (
                      <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${STATUS_COLORS[status]}`}>
                        <span className="font-semibold">{p.fieldName}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{p.value} {p.unit}</span>
                          {p.normalRange && <span className="text-xs opacity-70">Normal: {p.normalRange}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trend Graphs for this patient */}
              {(() => {
                const trends = getPatientTrends(selectedRecord.patientId?._id);
                if (trends.length === 0) return null;
                return (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      Patient Trends
                    </h3>
                    <div className="space-y-4">
                      {trends.map(([key, data]) => {
                        const range = parseRange(data.normalRange);
                        return (
                          <div key={key} className="bg-green-50 rounded-xl border border-green-200 p-4">
                            <h4 className="text-xs font-bold text-gray-700 mb-1">{data.fieldName} <span className="text-gray-400 font-normal">({data.unit})</span></h4>
                            {data.normalRange && <p className="text-[11px] text-gray-400 mb-2">Normal: {data.normalRange}</p>}
                            <ResponsiveContainer width="100%" height={150}>
                              <LineChart data={data.points}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11, border: '1px solid #d1fae5' }} />
                                {range && (
                                  <>
                                    <ReferenceLine y={range.min} stroke="#16a34a" strokeDasharray="4 4" />
                                    <ReferenceLine y={range.max} stroke="#16a34a" strokeDasharray="4 4" />
                                  </>
                                )}
                                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
