import { Activity, Users, ShieldCheck, Settings, BarChart3, Server, AlertTriangle } from 'lucide-react';
import type { Patient, Alert, EscalationEvent } from './DoctorDashboard';

interface AdminDashboardProps {
  patients: Patient[];
  alerts: Alert[];
  escalations: EscalationEvent[];
  onPatientClick?: (patientId: string) => void;
}

export default function AdminDashboard({
  patients,
  alerts,
}: AdminDashboardProps) {
  const total = patients.length;
  const stable = patients.filter(p => p.status === 'stable').length;
  const activeAlerts = alerts.length;

  const statCards = [
    { label: 'Total Users', value: total, icon: Users },
    { label: 'Systems Stable', value: stable, icon: ShieldCheck },
    { label: 'Active Alerts', value: activeAlerts, icon: AlertTriangle },
  ];

  const adminCards = [
    { icon: Users, title: 'User Management', desc: 'Manage all registered patients, doctors, and staff.' },
    { icon: ShieldCheck, title: 'Roles & Permissions', desc: 'Configure access levels and role assignments.' },
    { icon: BarChart3, title: 'Platform Analytics', desc: 'Usage metrics, traffic, and engagement data.' },
    { icon: Server, title: 'System Health', desc: 'API uptime, database status, and server metrics.' },
    { icon: Settings, title: 'Platform Settings', desc: 'Configure branding, notifications, and integrations.' },
    { icon: AlertTriangle, title: 'Alerts & Logs', desc: 'Monitor security alerts and system error logs.' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Platform management, user oversight, and system health</p>
          </div>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {statCards.map((card) => {
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
                  <p className="text-3xl font-extrabold tracking-tight">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Management Cards */}
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-gray-800">Management</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl border-2 border-green-200 p-5 hover:border-green-400 hover:shadow-lg hover:shadow-green-100 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{card.title}</h3>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
