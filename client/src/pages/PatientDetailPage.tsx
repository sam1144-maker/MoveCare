import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Activity, Thermometer, BrainCircuit, AlertTriangle, Clock, Users, Phone, CheckCircle } from 'lucide-react';
import { useVitalsSocket } from '../hooks/useVitalsSocket';
import { API_BASE, apiFetch } from '../config';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { patients, alerts, patientHistory } = useVitalsSocket();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [caregiver, setCaregiver] = useState<any>(null);

  useEffect(() => {
    if (id) {
      apiFetch(`${API_BASE}/api/caregiver/patient/${id}`)
        .then(r => r.json())
        .then(data => setCaregiver(data.caregiver))
        .catch(() => {});
    }
  }, [id]);

  const patient = patients.find(p => p.id === id);
  const history = patientHistory[id || ''] || [];
  const patientAlerts = alerts.filter(a => a.patientName === patient?.name);

  if (!patient) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <Activity className="w-10 h-10 text-slate-300 animate-pulse mb-4" />
        <h2 className="text-lg font-bold text-slate-500">Connecting to patient stream...</h2>
      </div>
    );
  }

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setAiSummary('');
    try {
      const prompt = `You are an expert AI medical assistant. Give a very concise 3-sentence summary of the following recent health data for patient ${patient.name} (${patient.age}yo, ${patient.condition}). 
      Current vitals: HR ${patient.vitals.heartRate}, SpO2 ${patient.vitals.spo2}%, Temp ${patient.vitals.temperature}°C. 
      Recent alerts: ${patientAlerts.map(a => a.message).join('; ') || 'None'}.`;

      const response = await apiFetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });

      if (!response.ok) throw new Error('Failed to generate summary');
      const data = await response.json();
      const text = data.reply;
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setAiSummary(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsGenerating(false);
        }
      }, 15);
    } catch (error) {
      console.error(error);
      setAiSummary('Failed to generate AI summary. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <Link to="/patients" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-emerald-600 mb-4 transition-colors uppercase tracking-wider">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Patients
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
            <p className="text-slate-400 mt-1 text-sm">Age {patient.age} · {patient.condition}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
            patient.status === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
            patient.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
            'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {patient.status}
          </div>
        </div>
      </header>

      {/* Caregiver */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Assigned Caregiver</h3>
          </div>
          {caregiver && caregiver.fullName ? (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="font-bold text-slate-900">{caregiver.fullName}</span>
              <span className="text-slate-400">({caregiver.relationship})</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Phone className="w-3.5 h-3.5" />
                {caregiver.phone}
              </span>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No caregiver assigned.</p>
          )}
        </div>
      </div>

      {/* Big Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={`rounded-2xl p-6 border-2 flex flex-col items-center justify-center text-center transition-all ${
          patient.vitals.heartRate > 100 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <Heart className={`w-7 h-7 mb-2 ${patient.vitals.heartRate > 100 ? 'text-red-500 animate-pulse' : 'text-rose-500'}`} />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Heart Rate</p>
          <div className="text-5xl font-black text-slate-900 tracking-tight">
            {patient.vitals.heartRate} <span className="text-lg text-slate-400 font-normal">bpm</span>
          </div>
        </div>

        <div className={`rounded-2xl p-6 border-2 flex flex-col items-center justify-center text-center transition-all ${
          patient.vitals.spo2 < 94 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <Activity className={`w-7 h-7 mb-2 ${patient.vitals.spo2 < 94 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">SpO₂</p>
          <div className="text-5xl font-black text-slate-900 tracking-tight">
            {patient.vitals.spo2} <span className="text-lg text-slate-400 font-normal">%</span>
          </div>
        </div>

        <div className="rounded-2xl p-6 border-2 border-slate-200 bg-white flex flex-col items-center justify-center text-center">
          <Thermometer className="w-7 h-7 mb-2 text-amber-500" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Temperature</p>
          <div className="text-5xl font-black text-slate-900 tracking-tight">
            {patient.vitals.temperature} <span className="text-lg text-slate-400 font-normal">°C</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Left: Charts + AI */}
        <div className="lg:col-span-2 space-y-6">

          {/* AI Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-800">HealthAI Summary</h2>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Analyzing...' : 'Generate'}
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 min-h-[80px] border border-slate-100">
              {aiSummary ? (
                <p className="text-sm text-slate-700 leading-relaxed">
                  {aiSummary}
                  {isGenerating && <span className="inline-block w-1.5 h-4 bg-emerald-500 ml-1 animate-pulse" />}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic text-center py-3">Click generate for an AI analysis of {patient.name}'s vitals.</p>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Live Vitals Trend
            </h2>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} minTickGap={30} />
                  <YAxis yAxisId="left" domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 11, fill: '#f43f5e' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" domain={[80, 100]} tick={{ fontSize: 11, fill: '#3b82f6' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '13px' }} />
                  <ReferenceLine yAxisId="left" y={100} stroke="#fecaca" strokeDasharray="3 3" />
                  <ReferenceLine yAxisId="right" y={94} stroke="#bfdbfe" strokeDasharray="3 3" />
                  <Line yAxisId="left" type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={2.5} dot={false} name="Heart Rate (bpm)" />
                  <Line yAxisId="right" type="monotone" dataKey="spo2" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="SpO₂ (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Alert History */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full max-h-[560px]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Alert History</h2>
            <span className="ml-auto text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{patientAlerts.length}</span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {patientAlerts.length > 0 ? (
              <div className="space-y-3">
                {patientAlerts.map(alert => (
                  <div key={alert.id} className={`p-3.5 rounded-xl border ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'
                      }`} />
                      <div>
                        <p className={`text-xs font-bold mb-1 ${
                          alert.severity === 'critical' ? 'text-red-800' : 'text-amber-800'
                        }`}>
                          {alert.severity === 'critical' ? 'Critical Alert' : 'Warning'}
                        </p>
                        <p className={`text-xs leading-relaxed mb-1.5 ${
                          alert.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                        }`}>
                          {alert.message}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-slate-700">No recent alerts</p>
                <p className="text-xs text-slate-400 mt-1">Patient has been stable.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
