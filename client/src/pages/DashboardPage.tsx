import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';
import { useVitalsSocket } from '../hooks/useVitalsSocket';

import { useNavigate } from 'react-router-dom';

// ---------- DASHBOARD HUB ----------

export default function DashboardPage() {
  const role = localStorage.getItem('movecare_role') || 'patient';
  const navigate = useNavigate();

  // Live real-time data from the WebSocket Simulator!
  const { patients, alerts, escalations, myVitals, myNotifications, myEvents } = useVitalsSocket();

  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  if (role === 'admin') {
    return (
      <AdminDashboard
        patients={patients}
        alerts={alerts}
        escalations={escalations}
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

  return (
    <PatientDashboard
      vitals={myVitals}
      status={alerts.length > 0 ? 'alert' : 'normal'}
      statusMessage={alerts.length > 0 ? "An alert has been sent to your care team." : "Your vitals are normal. No alerts have been triggered."}
      notifications={myNotifications}
      recentEvents={myEvents}
    />
  );
}
