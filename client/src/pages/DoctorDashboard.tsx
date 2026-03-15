import { Heart, Thermometer, Activity, Smartphone, AlertTriangle, ArrowUpRight, Users, ShieldCheck, Clock, Zap } from 'lucide-react';

// ---------- TYPE DEFINITIONS (WebSocket-ready) ----------

export interface PatientVitals {
  heartRate: number;
  spo2: number;
  temperature: number;
  accelerometer: 'Stable' | 'Fall Detected';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  status: 'stable' | 'warning' | 'critical';
  vitals: PatientVitals;
}

export interface Alert {
  id: string;
  patientName: string;
  message: string;
  severity: 'warning' | 'critical';
  timestamp: string;
}

export interface EscalationEvent {
  id: string;
  timestamp: string;
  level: 'patient' | 'family' | 'doctor';
  message: string;
}

interface DoctorDashboardProps {
  patients: Patient[];
  alerts: Alert[];
  escalations: EscalationEvent[];
}

// ---------- SUMMARY BAR ----------

function SummaryBar({ patients }: { patients: Patient[] }) {
  const total = patients.length;
  const stable = patients.filter(p => p.status === 'stable').length;
  const activeAlerts = patients.filter(p => p.status === 'critical' || p.status === 'warning').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Patients</p>
          <p className="text-2xl font-black text-slate-900">{total}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stable</p>
          <p className="text-2xl font-black text-emerald-600">{stable}</p>
        </div>
      </div>
      <div className={`rounded-2xl border p-5 flex items-center gap-4 ${activeAlerts > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${activeAlerts > 0 ? 'bg-red-500' : 'bg-slate-200'}`}>
          <AlertTriangle className={`w-5 h-5 ${activeAlerts > 0 ? 'text-white' : 'text-slate-400'}`} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alerts</p>
          <p className={`text-2xl font-black ${activeAlerts > 0 ? 'text-red-600' : 'text-slate-900'}`}>{activeAlerts}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- PATIENT CARDS ----------

const STATUS_CONFIG: Record<string, { border: string; badge: string; badgeText: string; label: string; dot?: string }> = {
  stable: {
    border: 'border-slate-200 hover:border-emerald-300',
    badge: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    label: 'Stable',
  },
  warning: {
    border: 'border-amber-200 hover:border-amber-300',
    badge: 'bg-amber-50',
    badgeText: 'text-amber-700',
    label: 'Warning',
    dot: 'bg-amber-400',
  },
  critical: {
    border: 'border-red-200 hover:border-red-300',
    badge: 'bg-red-50',
    badgeText: 'text-red-700',
    label: 'Critical',
    dot: 'bg-red-500',
  },
};

export function PatientCard({ patient, onClick }: { patient: Patient; onClick?: () => void }) {
  const config = STATUS_CONFIG[patient.status];

  return (
    <button
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border-2 ${config.border} p-5 text-left
        hover:shadow-lg transition-all duration-200 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2`}
    >
      {patient.status === 'critical' && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">{patient.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Age {patient.age} <span className="text-slate-300">·</span> {patient.condition}
          </p>
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${config.badge} ${config.badgeText}`}>
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 leading-none">HR</p>
            <p className="text-sm font-bold text-slate-800">{patient.vitals.heartRate} <span className="text-[10px] text-slate-400 font-normal">bpm</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 leading-none">SpO₂</p>
            <p className="text-sm font-bold text-slate-800">{patient.vitals.spo2}<span className="text-[10px] text-slate-400 font-normal">%</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 leading-none">Temp</p>
            <p className="text-sm font-bold text-slate-800">{patient.vitals.temperature}<span className="text-[10px] text-slate-400 font-normal">°C</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${patient.vitals.accelerometer === 'Fall Detected' ? 'bg-red-50' : 'bg-slate-50'}`}>
            <Smartphone className={`w-3.5 h-3.5 ${patient.vitals.accelerometer === 'Fall Detected' ? 'text-red-500' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 leading-none">Motion</p>
            <p className={`text-sm font-bold ${patient.vitals.accelerometer === 'Fall Detected' ? 'text-red-600' : 'text-slate-800'}`}>
              {patient.vitals.accelerometer}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

// ---------- ALERT FEED ----------

function AlertFeed({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Live Alerts</h3>
        {alerts.length > 0 && (
          <span className="ml-auto text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-md">
            {alerts.length}
          </span>
        )}
      </div>
      <div className="p-4">
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No active alerts</p>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all duration-200
                  ${alert.severity === 'critical'
                    ? 'border-red-200 bg-red-50'
                    : 'border-amber-200 bg-amber-50'
                  }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-slate-800">{alert.patientName}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    alert.severity === 'critical' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                  }`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {alert.timestamp}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- ESCALATION TIMELINE ----------

function EscalationTimeline({ escalations }: { escalations: EscalationEvent[] }) {
  const levelConfig: Record<string, { color: string; ring: string; label: string; emoji: string }> = {
    patient: { color: 'bg-amber-400', ring: 'ring-amber-100', label: 'Patient', emoji: '👤' },
    family: { color: 'bg-emerald-500', ring: 'ring-emerald-100', label: 'Family', emoji: '👨‍👩‍👧' },
    doctor: { color: 'bg-blue-500', ring: 'ring-blue-100', label: 'Doctor', emoji: '🩺' },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Escalation Timeline</h3>
      </div>
      <div className="p-4">
        {escalations.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No escalation events</p>
        ) : (
          <div className="relative max-h-72 overflow-y-auto pr-1">
            <div className="absolute left-[13px] top-4 bottom-4 w-px bg-slate-200" />
            <div className="space-y-4">
              {escalations.map((event) => {
                const config = levelConfig[event.level];
                return (
                  <div key={event.id} className="flex items-start gap-3 relative group">
                    <div className={`w-[26px] h-[26px] rounded-full ${config.color} flex-shrink-0 z-10
                      ring-4 ${config.ring} flex items-center justify-center
                      group-hover:scale-110 transition-transform duration-200`}
                    >
                      <span className="text-[10px]">{config.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0 bg-slate-50 rounded-xl p-3 group-hover:bg-slate-100 transition-colors duration-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{config.label}</span>
                        <span className="flex items-center text-[10px] text-slate-400 gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          {event.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{event.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- MAIN COMPONENT ----------

export default function DoctorDashboard({
  patients,
  alerts,
  escalations,
}: DoctorDashboardProps) {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Doctor Dashboard</h1>
            <p className="text-sm text-slate-400">Real-time patient monitoring & alert management</p>
          </div>
        </div>
      </header>

      <SummaryBar patients={patients} />

      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Monitoring & Escalations</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AlertFeed alerts={alerts} />
        <EscalationTimeline escalations={escalations} />
      </div>
    </div>
  );
}
