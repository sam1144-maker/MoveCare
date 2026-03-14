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
  onPatientClick?: (patientId: string) => void;
}

// ---------- SUMMARY BAR ----------

function SummaryBar({ patients }: { patients: Patient[] }) {
  const total = patients.length;
  const stable = patients.filter(p => p.status === 'stable').length;
  const activeAlerts = patients.filter(p => p.status === 'critical' || p.status === 'warning').length;

  const cards = [
    {
      label: 'Total Patients Monitored',
      value: total,
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-white/20',
    },
    {
      label: 'Currently Stable',
      value: stable,
      icon: ShieldCheck,
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-white/20',
    },
    {
      label: 'Active Alerts',
      value: activeAlerts,
      icon: AlertTriangle,
      gradient: activeAlerts > 0 ? 'from-red-500 to-rose-600' : 'from-slate-400 to-slate-500',
      iconBg: 'bg-white/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
          >
            {/* Decorative circle */}
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/5" />

            <div className="relative z-10 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} backdrop-blur-sm flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80 font-medium">{card.label}</p>
                <p className="text-3xl font-extrabold tracking-tight">{card.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- PATIENT CARDS ----------

const STATUS_CONFIG: Record<string, { border: string; badge: string; badgeText: string; label: string; glow: string }> = {
  stable: {
    border: 'border-emerald-200 hover:border-emerald-300',
    badge: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    label: 'Stable',
    glow: 'hover:shadow-emerald-100',
  },
  warning: {
    border: 'border-amber-200 hover:border-amber-300',
    badge: 'bg-amber-100',
    badgeText: 'text-amber-700',
    label: 'Warning',
    glow: 'hover:shadow-amber-100',
  },
  critical: {
    border: 'border-red-200 hover:border-red-300',
    badge: 'bg-red-100',
    badgeText: 'text-red-700',
    label: 'Critical',
    glow: 'hover:shadow-red-100',
  },
};

function PatientCard({ patient, onClick }: { patient: Patient; onClick?: () => void }) {
  const config = STATUS_CONFIG[patient.status];

  return (
    <button
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border-2 ${config.border} p-5 text-left 
        hover:shadow-lg ${config.glow} transition-all duration-300 hover:-translate-y-0.5 
        w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
    >
      {/* Critical pulse indicator */}
      {patient.status === 'critical' && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 group-hover:text-slate-800">{patient.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Age {patient.age} <span className="text-slate-300">·</span> {patient.condition}
          </p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${config.badge} ${config.badgeText}`}>
          {config.label}
        </span>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 leading-none">Heart Rate</p>
            <p className="text-sm font-semibold text-slate-800">{patient.vitals.heartRate} <span className="text-xs text-slate-400 font-normal">bpm</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 leading-none">SpO₂</p>
            <p className="text-sm font-semibold text-slate-800">{patient.vitals.spo2}<span className="text-xs text-slate-400 font-normal">%</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Thermometer className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-slate-400 leading-none">Temp</p>
            <p className="text-sm font-semibold text-slate-800">{patient.vitals.temperature}<span className="text-xs text-slate-400 font-normal">°C</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            patient.vitals.accelerometer === 'Fall Detected' ? 'bg-red-50' : 'bg-slate-50'
          }`}>
            <Smartphone className={`w-4 h-4 ${
              patient.vitals.accelerometer === 'Fall Detected' ? 'text-red-500' : 'text-slate-400'
            }`} />
          </div>
          <div>
            <p className="text-xs text-slate-400 leading-none">Motion</p>
            <p className={`text-sm font-semibold ${
              patient.vitals.accelerometer === 'Fall Detected' ? 'text-red-600' : 'text-slate-800'
            }`}>
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          Live Alert Feed
          {alerts.length > 0 && (
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
              {alerts.length}
            </span>
          )}
        </h3>
      </div>
      <div className="p-4">
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No active alerts</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {alerts.map((alert, index) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${
                  alert.severity === 'critical'
                    ? 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'
                    : 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                  alert.severity === 'critical' ? 'bg-red-500 shadow-sm shadow-red-300' : 'bg-amber-500 shadow-sm shadow-amber-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800">{alert.patientName}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {alert.timestamp}
                  </p>
                </div>
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
  const levelConfig: Record<string, { gradient: string; ring: string; label: string; emoji: string }> = {
    patient: { gradient: 'from-blue-500 to-cyan-500', ring: 'ring-blue-200', label: 'Patient', emoji: '👤' },
    family: { gradient: 'from-amber-500 to-orange-500', ring: 'ring-amber-200', label: 'Family', emoji: '👨‍👩‍👧' },
    doctor: { gradient: 'from-red-500 to-rose-500', ring: 'ring-red-200', label: 'Doctor', emoji: '🩺' },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 text-indigo-600" />
          </div>
          Escalation Timeline
        </h3>
      </div>
      <div className="p-4">
        {escalations.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No escalation events</p>
        ) : (
          <div className="relative max-h-72 overflow-y-auto pr-1">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-300 via-amber-300 to-red-300 rounded-full" />

            <div className="space-y-5">
              {escalations.map((event) => {
                const config = levelConfig[event.level];
                return (
                  <div key={event.id} className="flex items-start gap-4 relative group">
                    {/* Node */}
                    <div className={`w-[30px] h-[30px] rounded-full bg-gradient-to-br ${config.gradient} flex-shrink-0 z-10 
                      ring-4 ${config.ring} flex items-center justify-center shadow-sm 
                      group-hover:scale-110 transition-transform duration-200`}
                    >
                      <span className="text-xs">{config.emoji}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 bg-slate-50 rounded-xl p-3 group-hover:bg-slate-100 transition-colors duration-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
                          {config.label}
                        </span>
                        <span className="flex items-center text-[11px] text-slate-400 gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          {event.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{event.message}</p>
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
  onPatientClick,
}: DoctorDashboardProps) {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-200">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Doctor Dashboard</h1>
            <p className="text-sm text-slate-500">Real-time patient monitoring & alert management</p>
          </div>
        </div>
      </header>

      {/* 1. Summary Bar */}
      <SummaryBar patients={patients} />

      {/* 2. Section Header */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-slate-800">Patient Overview</h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{patients.length} patients</span>
      </div>

      {/* 3. Patient Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {patients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onClick={() => onPatientClick?.(patient.id)}
          />
        ))}
      </div>

      {/* 4. Two-Column Section */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-slate-800">Monitoring & Escalations</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertFeed alerts={alerts} />
        <EscalationTimeline escalations={escalations} />
      </div>
    </div>
  );
}
