import { Link } from 'react-router-dom';
import { Heart, Thermometer, Activity, Smartphone, MessageSquare, Bell, CheckCircle, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

// ---------- TYPE DEFINITIONS (WebSocket-ready) ----------

export interface MyVitals {
  heartRate: number;
  spo2: number;
  temperature: number;
  accelerometer: 'Stable' | 'Fall Detected';
}

export interface PatientNotification {
  id: string;
  message: string;
  type: 'info' | 'escalation' | 'resolved';
  timestamp: string;
}

export interface HealthEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
}

interface PatientDashboardProps {
  vitals: MyVitals;
  status: 'normal' | 'alert';
  statusMessage: string;
  notifications: PatientNotification[];
  recentEvents: HealthEvent[];
}

// ---------- VITALS DISPLAY ----------

function VitalsPanel({ vitals }: { vitals: MyVitals }) {
  const vitalCards = [
    { label: 'Heart Rate', value: `${vitals.heartRate}`, unit: 'bpm', icon: Heart },
    { label: 'SpO₂', value: `${vitals.spo2}`, unit: '%', icon: Activity },
    { label: 'Temperature', value: `${vitals.temperature}`, unit: '°C', icon: Thermometer },
    { label: 'Motion', value: vitals.accelerometer, unit: '', icon: Smartphone },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {vitalCards.map((v) => {
        const Icon = v.icon;
        return (
          <div key={v.label} className="bg-white rounded-2xl border-2 border-green-200 p-5 hover:border-green-400 hover:shadow-md hover:shadow-green-100 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-gray-400 font-medium">{v.label}</span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {v.value}
              {v.unit && <span className="text-sm text-gray-400 font-normal ml-1">{v.unit}</span>}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ---------- STATUS BANNER ----------

function StatusBanner({ status, message }: { status: 'normal' | 'alert'; message: string }) {
  return (
    <div className={`rounded-2xl p-5 mb-6 flex items-center gap-4 border-2 transition-all duration-300 ${
      status === 'normal'
        ? 'bg-green-50 border-green-200'
        : 'bg-green-100 border-green-400'
    }`}>
      {status === 'normal' ? (
        <div className="w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-green-200">
          <CheckCircle className="w-6 h-6 text-white" />
        </div>
      ) : (
        <div className="w-11 h-11 rounded-xl bg-green-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-green-300">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
      )}
      <div>
        <p className="font-bold text-gray-900 text-sm">{status === 'normal' ? 'All Clear' : 'Alert Active'}</p>
        <p className="text-sm text-gray-600 mt-0.5">{message}</p>
      </div>
    </div>
  );
}

// ---------- NOTIFICATIONS ----------

function NotificationsPanel({ notifications }: { notifications: PatientNotification[] }) {
  const typeConfig: Record<string, { icon: any; dot: string }> = {
    info: { icon: Bell, dot: 'bg-green-400' },
    escalation: { icon: AlertTriangle, dot: 'bg-green-700' },
    resolved: { icon: CheckCircle, dot: 'bg-green-500' },
  };

  return (
    <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-green-100 bg-green-50/50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Bell className="w-4 h-4 text-green-600" />
          </div>
          Notifications
          {notifications.length > 0  && (
            <span className="ml-auto text-xs font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </h3>
      </div>
      <div className="p-4">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No new notifications</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.map((n) => {
              const config = typeConfig[n.type];
              const Icon = config.icon;
              return (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100/60 transition-colors duration-200">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${config.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {n.timestamp}
                    </p>
                  </div>
                  <Icon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- RECENT HEALTH EVENTS ----------

function RecentEventsPanel({ events }: { events: HealthEvent[] }) {
  return (
    <div className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden h-full">
      <div className="px-6 py-4 border-b border-green-100 bg-green-50/50">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Activity className="w-4 h-4 text-green-600" />
          </div>
          Recent Health Events
        </h3>
      </div>
      <div className="p-4">
        {events.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No recent events</p>
        ) : (
          <div className="relative max-h-64 overflow-y-auto">
            <div className="absolute left-[9px] top-3 bottom-3 w-0.5 bg-green-200 rounded-full" />
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 relative group">
                  <div className="w-[18px] h-[18px] rounded-full bg-green-500 flex-shrink-0 z-10 ring-4 ring-green-100 group-hover:scale-110 transition-transform duration-200" />
                  <div className="flex-1 min-w-0 bg-green-50 rounded-xl p-3 group-hover:bg-green-100/50 transition-colors duration-200">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-800">{event.title}</p>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {event.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- CHATBOT CTA ----------

function ChatbotCTA() {
  return (
    <Link
      to="/chatbot"
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white shadow-lg shadow-green-200 
        hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between"
    >
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/5" />

      <div className="relative z-10 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Ask HealthAI</h3>
          <p className="text-sm text-white/80 mt-0.5">Have questions about your readings? Chat with our AI assistant.</p>
        </div>
      </div>

      <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-200 relative z-10" />
    </Link>
  );
}

// ---------- MAIN COMPONENT ----------

export default function PatientDashboard({
  vitals,
  status,
  statusMessage,
  notifications,
  recentEvents,
}: PatientDashboardProps) {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">My Health</h1>
            <p className="text-sm text-gray-500">Your personal vitals and health updates</p>
          </div>
        </div>
      </header>

      {/* Status Banner */}
      <StatusBanner status={status} message={statusMessage} />

      {/* Vitals */}
      <VitalsPanel vitals={vitals} />

      {/* Chatbot CTA */}
      <div className="mb-6">
        <ChatbotCTA />
      </div>

      {/* Two-column: Notifications + Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NotificationsPanel notifications={notifications} />
        <RecentEventsPanel events={recentEvents} />
      </div>
    </div>
  );
}
