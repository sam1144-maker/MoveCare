import { useState } from 'react';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';
import type { Patient, Alert, EscalationEvent } from './DoctorDashboard';

// ---------- MOCK DATA (will be replaced by WebSocket feeds) ----------

const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Ananya Sharma',
    age: 34,
    condition: 'Cardiac',
    status: 'stable',
    vitals: { heartRate: 72, spo2: 98, temperature: 36.6, accelerometer: 'Stable' },
  },
  {
    id: 'p2',
    name: 'Rajesh Verma',
    age: 58,
    condition: 'Diabetic',
    status: 'warning',
    vitals: { heartRate: 88, spo2: 94, temperature: 37.2, accelerometer: 'Stable' },
  },
  {
    id: 'p3',
    name: 'Priya Nair',
    age: 45,
    condition: 'Post-Surgery',
    status: 'critical',
    vitals: { heartRate: 110, spo2: 89, temperature: 38.1, accelerometer: 'Fall Detected' },
  },
  {
    id: 'p4',
    name: 'Vikram Singh',
    age: 62,
    condition: 'Hypertension',
    status: 'stable',
    vitals: { heartRate: 76, spo2: 97, temperature: 36.8, accelerometer: 'Stable' },
  },
  {
    id: 'p5',
    name: 'Meera Joshi',
    age: 29,
    condition: 'Respiratory',
    status: 'warning',
    vitals: { heartRate: 95, spo2: 92, temperature: 37.5, accelerometer: 'Stable' },
  },
  {
    id: 'p6',
    name: 'Arjun Patel',
    age: 71,
    condition: 'Cardiac',
    status: 'stable',
    vitals: { heartRate: 68, spo2: 96, temperature: 36.4, accelerometer: 'Stable' },
  },
];

const MOCK_ALERTS: Alert[] = [
  {
    id: 'a1',
    patientName: 'Priya Nair',
    message: 'SpO₂ dropped below 90% — Fall detected by accelerometer.',
    severity: 'critical',
    timestamp: '2 min ago',
  },
  {
    id: 'a2',
    patientName: 'Rajesh Verma',
    message: 'Heart rate elevated above normal resting range.',
    severity: 'warning',
    timestamp: '8 min ago',
  },
  {
    id: 'a3',
    patientName: 'Meera Joshi',
    message: 'SpO₂ at 92% — monitoring closely.',
    severity: 'warning',
    timestamp: '15 min ago',
  },
];

const MOCK_ESCALATIONS: EscalationEvent[] = [
  {
    id: 'e1',
    timestamp: '19:05',
    level: 'patient',
    message: 'Alert sent to Priya Nair — "Are you okay?"',
  },
  {
    id: 'e2',
    timestamp: '19:07',
    level: 'family',
    message: 'No response — escalating to family contact.',
  },
  {
    id: 'e3',
    timestamp: '19:10',
    level: 'doctor',
    message: 'Family unresponsive — escalating to Dr. Samridh.',
  },
];

// ---------- DASHBOARD HUB ----------

export default function DashboardPage() {
  const role = localStorage.getItem('movecare_role') || 'patient';

  // These state variables will be replaced by WebSocket state later
  const [patients] = useState<Patient[]>(MOCK_PATIENTS);
  const [alerts] = useState<Alert[]>(MOCK_ALERTS);
  const [escalations] = useState<EscalationEvent[]>(MOCK_ESCALATIONS);

  const handlePatientClick = (patientId: string) => {
    console.log('Patient clicked:', patientId);
    // Future: open patient detail modal or navigate
  };

  if (role === 'admin') {
    return (
      <AdminDashboard
        patients={patients}
        alerts={alerts}
        escalations={escalations}
        onPatientClick={handlePatientClick}
      />
    );
  }

  if (role === 'doctor') {
    return (
      <DoctorDashboard
        patients={patients}
        alerts={alerts}
        escalations={escalations}
        onPatientClick={handlePatientClick}
      />
    );
  }

  return <PatientDashboard />;
}
