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
    { label: 'Total Patients Monitored', value: total, icon: Users },
    { label: 'Currently Stable', value: stable, icon: ShieldCheck },
    { label: 'Active Alerts', value: activeAlerts, icon: AlertTriangle, isAlert: true },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/5" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/80 font-medium">{card.label}</p>
                <p className={`text-3xl font-extrabold tracking-tight ${card.isAlert && card.value > 0 ? 'text-red-200' : ''}`}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- PATIENT CARDS ----------

const STATUS_CONFIG: Record<string, { border: string; badge: string; badgeText: string; label: string }> = {
  stable: {
    border: 'border-green-200 hover:border-green-400',
    badge: 'bg-green-100',
    badgeText: 'text-green-700',
    label: 'Stable',
  },
  warning: {
    border: 'border-green-300 hover:border-green-400',
    badge: 'bg-green-200',
    badgeText: 'text-green-800',
    label: 'Warning',
  },
  critical: {
    border: 'border-green-400 hover:border-green-500',
    badge: 'bg-green-300',
    badgeText: 'text-green-900',
    label: 'Critical',
  },
};

export function PatientCard({ patient, onClick }: { patient: Patient; onClick?: () => void }) {
  const config = STATUS_CONFIG[patient.status];

  return (
    <button
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border-2 ${config.border} p-5 text-left 
        hover:shadow-lg hover:shadow-green-100 transition-all duration-300 hover:-translate-y-0.5 
        w-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2`}
    >
      {patient.status === 'critical' && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600" />
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-800 group-hover:text-gray-900">{patient.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Age {patient.age} <span className="text-gray-300">·</span> {patient.condition}
          </p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${config.badge} ${config.badgeText}`}>
          {config.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-green-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <Heart className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 leading-none">Heart Rate</p>
            <p className="text-sm font-semibold text-gray-800">{patient.vitals.heartRate} <span className="text-xs text-gray-400 font-normal">bpm</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <Activity className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 leading-none">SpO₂</p>
            <p className="text-sm font-semibold text-gray-800">{patient.vitals.spo2}<span className="text-xs text-gray-400 font-normal">%</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <Thermometer className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 leading-none">Temp</p>
            <p className="text-sm font-semibold text-gray-800">{patient.vitals.temperature}<span className="text-xs text-gray-400 font-normal">°C</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-50`}>
            <Smartphone className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 leading-none">Motion</p>
            <p className={`text-sm font-semibold ${
              patient.vitals.accelerometer === 'Fall Detected' ? 'text-green-800 underline' : 'text-gray-800'
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
    <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-green-100 bg-green-50/50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Zap className="w-4 h-4 text-green-600" />
          </div>
          Live Alert Feed
          {alerts.length > 0 && (
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-200 text-green-800">
              {alerts.length}
            </span>
          )}
        </h3>
      </div>
      <div className="p-4">
        {alerts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No active alerts</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01]
                  ${alert.severity === 'critical'
                    ? 'border-green-300 bg-green-100'
                    : 'border-green-200 bg-green-50'
                  }`}
              >
                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                  alert.severity === 'critical' ? 'bg-green-700' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-800">{alert.patientName}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      alert.severity === 'critical' ? 'bg-green-300 text-green-900' : 'bg-green-200 text-green-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{alert.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
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
  const levelConfig: Record<string, { shade: string; ring: string; label: string; emoji: string }> = {
    patient: { shade: 'bg-green-400', ring: 'ring-green-200', label: 'Patient', emoji: '👤' },
    family: { shade: 'bg-green-500', ring: 'ring-green-200', label: 'Family', emoji: '👨‍👩‍👧' },
    doctor: { shade: 'bg-green-700', ring: 'ring-green-300', label: 'Doctor', emoji: '🩺' },
  };

  return (
    <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-green-100 bg-green-50/50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4 text-green-600" />
          </div>
          Escalation Timeline
        </h3>
      </div>
      <div className="p-4">
        {escalations.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No escalation events</p>
        ) : (
          <div className="relative max-h-72 overflow-y-auto pr-1">
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-green-200 rounded-full" />
            <div className="space-y-5">
              {escalations.map((event) => {
                const config = levelConfig[event.level];
                return (
                  <div key={event.id} className="flex items-start gap-4 relative group">
                    <div className={`w-[30px] h-[30px] rounded-full ${config.shade} flex-shrink-0 z-10 
                      ring-4 ${config.ring} flex items-center justify-center shadow-sm 
                      group-hover:scale-110 transition-transform duration-200`}
                    >
                      <span className="text-xs">{config.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0 bg-green-50 rounded-xl p-3 group-hover:bg-green-100/60 transition-colors duration-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-green-700">{config.label}</span>
                        <span className="flex items-center text-[11px] text-gray-400 gap-1 ml-auto">
                          <Clock className="w-3 h-3" />
                          {event.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{event.message}</p>
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
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Doctor Dashboard</h1>
            <p className="text-sm text-gray-500">Real-time patient monitoring & alert management</p>
          </div>
        </div>
      </header>

      <SummaryBar patients={patients} />



      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-gray-800">Monitoring & Escalations</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertFeed alerts={alerts} />
        <EscalationTimeline escalations={escalations} />
      </div>
    </div>
  );
}
