import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, Activity, Thermometer, BrainCircuit, AlertTriangle, Clock } from 'lucide-react';
import { useVitalsSocket } from '../hooks/useVitalsSocket';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { patients, alerts, patientHistory } = useVitalsSocket();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const patient = patients.find(p => p.id === id);
  const history = patientHistory[id || ''] || [];
  const patientAlerts = alerts.filter(a => a.patientName === patient?.name);

  if (!patient) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <Activity className="w-12 h-12 text-green-300 animate-pulse mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Connecting to patient stream...</h2>
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

      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('movecare_token')}`
        },
        body: JSON.stringify({ message: prompt })
      });

      if (!response.ok) throw new Error('Failed to generate summary');
      const data = await response.json();
      
      // Basic typing effect simulation
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
      {/* Header with Back button */}
      <header className="mb-8">
        <Link to="/patients" className="inline-flex items-center text-sm font-semibold text-green-600 hover:text-green-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Patient Directory
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{patient.name}</h1>
            <p className="text-gray-500 mt-1">Age {patient.age} • {patient.condition}</p>
          </div>
          <div className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${
            patient.status === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
            patient.status === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
            'bg-green-50 text-green-700 border-green-200'
          }`}>
            {patient.status.toUpperCase()}
          </div>
        </div>
      </header>

      {/* BIG NUMBERS: Current live vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-3xl p-6 border-4 flex flex-col items-center justify-center text-center transition-colors duration-300 shadow-lg ${
          patient.vitals.heartRate > 100 ? 'bg-red-50 border-red-400 shadow-red-100' : 'bg-white border-green-200 shadow-green-50/50'
        }`}>
          <Heart className={`w-8 h-8 mb-2 ${patient.vitals.heartRate > 100 ? 'text-red-500 animate-pulse' : 'text-green-500'}`} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Heart Rate</p>
          <div className="text-6xl font-extrabold text-gray-900 tracking-tighter">
            {patient.vitals.heartRate} <span className="text-2xl text-gray-400 font-medium">bpm</span>
          </div>
        </div>

        <div className={`rounded-3xl p-6 border-4 flex flex-col items-center justify-center text-center transition-colors duration-300 shadow-lg ${
          patient.vitals.spo2 < 94 ? 'bg-red-50 border-red-400 shadow-red-100' : 'bg-white border-green-200 shadow-green-50/50'
        }`}>
          <Activity className={`w-8 h-8 mb-2 ${patient.vitals.spo2 < 94 ? 'text-red-500 animate-pulse' : 'text-green-500'}`} />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">SpO₂</p>
          <div className="text-6xl font-extrabold text-gray-900 tracking-tighter">
            {patient.vitals.spo2} <span className="text-2xl text-gray-400 font-medium">%</span>
          </div>
        </div>

        <div className="rounded-3xl p-6 border-4 border-green-200 bg-white shadow-lg shadow-green-50/50 flex flex-col items-center justify-center text-center">
          <Thermometer className="w-8 h-8 mb-2 text-green-500" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Temperature</p>
          <div className="text-6xl font-extrabold text-gray-900 tracking-tighter">
            {patient.vitals.temperature} <span className="text-2xl text-gray-400 font-medium">°C</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* LEFT COLUMN: Charts & AI (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Summary Block */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">HealthAI Summary</h2>
              </div>
              <button 
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="px-4 py-2 bg-white border-2 border-green-300 text-green-700 font-bold rounded-xl hover:bg-green-50 hover:border-green-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isGenerating ? 'Analyzing...' : 'Generate New Summary'}
              </button>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-green-100 min-h-[100px]">
              {aiSummary ? (
                <p className="text-gray-700 leading-relaxed font-medium">{aiSummary}
                  {isGenerating && <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse" />}
                </p>
              ) : (
                <p className="text-gray-400 italic text-center py-4">Click generate to get an AI analysis of {patient.name}'s recent vitals and alerts.</p>
              )}
            </div>
          </div>

          {/* Vitals Charts */}
          <div className="bg-white rounded-3xl border-2 border-green-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Live Vitals Trend (Last 5 mins)
            </h2>
            
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                    axisLine={false} 
                    tickLine={false}
                    minTickGap={30}
                  />
                  <YAxis 
                    yAxisId="left" 
                    domain={['dataMin - 10', 'dataMax + 10']} 
                    tick={{ fontSize: 12, fill: '#ef4444' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[80, 100]} 
                    tick={{ fontSize: 12, fill: '#3b82f6' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <ReferenceLine yAxisId="left" y={100} stroke="#fca5a5" strokeDasharray="3 3" />
                  <ReferenceLine yAxisId="right" y={94} stroke="#93c5fd" strokeDasharray="3 3" />
                  
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    dot={false}
                    name="Heart Rate (bpm)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="spo2" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    dot={false}
                    name="SpO₂ (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Alert History */}
        <div className="bg-white rounded-3xl border-2 border-green-100 shadow-sm overflow-hidden flex flex-col h-full max-h-[600px]">
          <div className="px-6 py-5 border-b border-green-100 bg-green-50/30">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-green-600" />
              Alert History
              <span className="ml-auto bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full">{patientAlerts.length}</span>
            </h2>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            {patientAlerts.length > 0 ? (
              <div className="space-y-4">
                {patientAlerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-2xl border ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
                  }`}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-600'
                      }`} />
                      <div>
                        <p className={`text-sm font-bold mb-1 ${
                          alert.severity === 'critical' ? 'text-red-900' : 'text-yellow-900'
                        }`}>
                          {alert.severity === 'critical' ? 'Critical Alert' : 'Warning'}
                        </p>
                        <p className={`text-sm leading-relaxed mb-2 ${
                          alert.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                        }`}>
                          {alert.message}
                        </p>
                        <p className={`text-[11px] font-semibold flex items-center gap-1 opacity-75 ${
                          alert.severity === 'critical' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {alert.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">No recent alerts</p>
                <p className="text-sm text-gray-500 mt-1">Patient has been stable.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Temporary standalone mock import since using lucide Checkcircle above
import { CheckCircle } from 'lucide-react';
