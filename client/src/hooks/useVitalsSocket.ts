import { useState, useEffect, useRef } from 'react';
import type { Patient, Alert, EscalationEvent } from '../pages/DoctorDashboard';
import type { MyVitals, PatientNotification, HealthEvent } from '../pages/PatientDashboard';
import { WS_BASE } from '../config';

// Hardcoded patient-specific baseline for the demo
const MY_INITIAL_VITALS: MyVitals = {
  heartRate: 74,
  spo2: 97,
  temperature: 36.5,
  accelerometer: 'Stable',
};

export interface PatientHistoryItem {
  timestamp: string;
  heartRate: number;
  spo2: number;
}

export function useVitalsSocket() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [escalations, setEscalations] = useState<EscalationEvent[]>([]);
  
  // Rolling 5-minute history for charts (max 150 items per patient at 2s intervals)
  const [patientHistory, setPatientHistory] = useState<Record<string, PatientHistoryItem[]>>({});

  // Extracted personal dashboard state
  const [myVitals, setMyVitals] = useState<MyVitals>(MY_INITIAL_VITALS);
  const [myNotifications, setMyNotifications] = useState<PatientNotification[]>([]);
  const [myEvents] = useState<HealthEvent[]>([]);

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to the WebSocket running on the same port as the backend API
    const connect = () => {
      ws.current = new WebSocket(WS_BASE);

      ws.current.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          
          if (type === 'patients_update') {
            setPatients(data);
            
            // Accumulate history
            const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setPatientHistory(prev => {
              const newHistory = { ...prev };
              data.forEach((p: Patient) => {
                const historyList = newHistory[p.id] || [];
                const newItem: PatientHistoryItem = {
                  timestamp: now,
                  heartRate: p.vitals.heartRate,
                  spo2: p.vitals.spo2,
                };
                // Keep only last 150 items (~5 minutes at 2s updates)
                newHistory[p.id] = [...historyList, newItem].slice(-150);
              });
              return newHistory;
            });

            // For the demo, let's sync "My Vitals" to Priya Nair (P3) so the patient view sees the anomaly too
            const myData = data.find((p: Patient) => p.id === 'p3');
            if (myData) {
              setMyVitals({
                heartRate: myData.vitals.heartRate,
                spo2: myData.vitals.spo2,
                temperature: myData.vitals.temperature,
                accelerometer: myData.vitals.accelerometer,
              });
            }
          } 
          else if (type === 'alerts_update') {
            setAlerts(data);
          } 
          else if (type === 'escalations_update') {
            setEscalations(data);
            
            // Sync escalations into the patient's personal notifications panel
            const newNotifs: PatientNotification[] = data.map((e: EscalationEvent) => ({
              id: `notif-${e.id}`,
              message: e.message,
              type: e.level === 'patient' ? 'info' : 'escalation',
              timestamp: e.timestamp,
            }));
            
            setMyNotifications((prev) => {
              // Only add new ones based on ID
              const existingIds = new Set(prev.map(p => p.id));
              const missing = newNotifs.filter(n => !existingIds.has(n.id));
              return [...missing, ...prev].slice(0, 10);
            });
          }
        } catch (err) {
          console.error('WebSocket receive error:', err);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting in 3s...');
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect loop on unmount
        ws.current.close();
      }
    };
  }, []);

  return {
    patients,
    alerts,
    escalations,
    myVitals,
    myNotifications,
    myEvents, // Mock events for now, since sim doesn't generate them
    patientHistory,
  };
}
