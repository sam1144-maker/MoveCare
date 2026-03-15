import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Thermometer, Activity, Smartphone, MessageSquare, Bell, CheckCircle, AlertTriangle, Clock, ArrowRight, Users, X } from 'lucide-react';
import { API_BASE, apiFetch } from '../config';

// ---------- TYPE DEFINITIONS ----------

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

// ---------- CAREGIVER MODAL ----------

interface CaregiverData {
  fullName: string;
  relationship: string;
  phone: string;
  email: string;
  city: string;
  availableHours: string;
}

const EMPTY_CAREGIVER: CaregiverData = {
  fullName: '', relationship: '', phone: '', email: '', city: '', availableHours: '',
};

function CaregiverModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [form, setForm] = useState<CaregiverData>(EMPTY_CAREGIVER);
  const [isExisting, setIsExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError('');
      apiFetch(`${API_BASE}/api/caregiver/mine`)
        .then(r => r.json())
        .then(data => {
          if (data.caregiver && data.caregiver.fullName) {
            setForm(data.caregiver);
            setIsExisting(true);
          } else {
            setForm(EMPTY_CAREGIVER);
            setIsExisting(false);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`${API_BASE}/api/caregiver/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save.');
      setSuccess(true);
      setIsExisting(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 2000);
    } catch {
      setError('Failed to save caregiver. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {isExisting ? 'Update Caregiver' : 'Add Caregiver'}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium p-3 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Caregiver saved successfully!
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3 rounded-xl">
              {error}
            </div>
          )}
          {[
            { label: 'Full Name', name: 'fullName', placeholder: 'e.g. Priya Sharma', required: true },
            { label: 'Relationship', name: 'relationship', placeholder: 'e.g. Daughter', required: true },
            { label: 'Phone Number', name: 'phone', placeholder: '+91 98765 43210', required: true },
            { label: 'Email', name: 'email', placeholder: 'caregiver@email.com', required: false },
            { label: 'City', name: 'city', placeholder: 'e.g. Mumbai', required: false },
            { label: 'Available Hours', name: 'availableHours', placeholder: 'e.g. 9am–6pm', required: false },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
              </label>
              <input
                name={field.name}
                value={(form as any)[field.name]}
                onChange={handleChange}
                required={field.required}
                placeholder={field.placeholder}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Saving...' : isExisting ? 'Update Caregiver' : 'Save Caregiver'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------- VITALS DISPLAY ----------

function VitalsPanel({ vitals }: { vitals: MyVitals }) {
  const vitalCards = [
    { label: 'Heart Rate', value: `${vitals.heartRate}`, unit: 'bpm', icon: Heart, iconColor: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'SpO₂', value: `${vitals.spo2}`, unit: '%', icon: Activity, iconColor: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Temperature', value: `${vitals.temperature}`, unit: '°C', icon: Thermometer, iconColor: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Motion', value: vitals.accelerometer, unit: '', icon: Smartphone, iconColor: vitals.accelerometer === 'Fall Detected' ? 'text-red-500' : 'text-slate-400', bg: vitals.accelerometer === 'Fall Detected' ? 'bg-red-50' : 'bg-slate-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {vitalCards.map((v) => {
        const Icon = v.icon;
        return (
          <div key={v.label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all duration-200">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg ${v.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${v.iconColor}`} />
              </div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{v.label}</span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {v.value}
              {v.unit && <span className="text-sm text-slate-400 font-normal ml-1">{v.unit}</span>}
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
    <div className={`rounded-2xl p-4 mb-6 flex items-center gap-3.5 border transition-all duration-300 ${
      status === 'normal'
        ? 'bg-emerald-50 border-emerald-200'
        : 'bg-red-50 border-red-200'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        status === 'normal' ? 'bg-emerald-500' : 'bg-red-500'
      }`}>
        {status === 'normal'
          ? <CheckCircle className="w-5 h-5 text-white" />
          : <AlertTriangle className="w-5 h-5 text-white" />
        }
      </div>
      <div>
        <p className={`font-bold text-sm ${status === 'normal' ? 'text-emerald-800' : 'text-red-800'}`}>
          {status === 'normal' ? 'All Clear' : 'Alert Active'}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{message}</p>
      </div>
    </div>
  );
}

// ---------- NOTIFICATIONS ----------

function NotificationsPanel({ notifications }: { notifications: PatientNotification[] }) {
  const typeConfig: Record<string, { icon: any; dot: string }> = {
    info: { icon: Bell, dot: 'bg-blue-400' },
    escalation: { icon: AlertTriangle, dot: 'bg-red-500' },
    resolved: { icon: CheckCircle, dot: 'bg-emerald-500' },
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
          <Bell className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
        {notifications.length > 0 && (
          <span className="ml-auto text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
            {notifications.length}
          </span>
        )}
      </div>
      <div className="p-4">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No new notifications</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.map((n) => {
              const config = typeConfig[n.type];
              return (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${config.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {n.timestamp}
                    </p>
                  </div>
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
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
          <Activity className="w-3.5 h-3.5 text-slate-600" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Recent Events</h3>
      </div>
      <div className="p-4">
        {events.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No recent events</p>
        ) : (
          <div className="relative max-h-64 overflow-y-auto">
            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-slate-200" />
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 relative group">
                  <div className="w-[14px] h-[14px] rounded-full bg-emerald-500 flex-shrink-0 z-10 ring-4 ring-emerald-100 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0 bg-slate-50 rounded-xl p-3 group-hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-bold text-slate-800">{event.title}</p>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {event.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{event.description}</p>
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
      className="group relative overflow-hidden rounded-2xl bg-slate-900 p-5 text-white
        hover:shadow-xl transition-all duration-200 flex items-center justify-between"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-[60px]" />

      <div className="relative z-10 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold">Ask HealthAI</h3>
          <p className="text-sm text-slate-400 mt-0.5">Chat with our AI assistant about your readings.</p>
        </div>
      </div>

      <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all relative z-10" />
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
  const [showCaregiverModal, setShowCaregiverModal] = useState(false);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Health</h1>
              <p className="text-sm text-slate-400">Your personal vitals and health updates</p>
            </div>
          </div>
          <button
            onClick={() => setShowCaregiverModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm"
          >
            <Users className="w-4 h-4 text-slate-500" />
            My Caregiver
          </button>
        </div>
      </header>

      <StatusBanner status={status} message={statusMessage} />
      <VitalsPanel vitals={vitals} />

      <div className="mb-6">
        <ChatbotCTA />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <NotificationsPanel notifications={notifications} />
        <RecentEventsPanel events={recentEvents} />
      </div>

      <CaregiverModal isOpen={showCaregiverModal} onClose={() => setShowCaregiverModal(false)} />
    </div>
  );
}
