import { WebSocketServer, WebSocket } from 'ws';
import { sendCaregiverWhatsApp, hasDoctorAcknowledged } from './whatsappService';
import User from '../models/User';

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

// ---------------------------------------------------------
// 1. BASELINES & INITIAL STATE
// ---------------------------------------------------------

const INITIAL_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Ananya Sharma', age: 34, condition: 'Cardiac', status: 'stable', vitals: { heartRate: 72, spo2: 98, temperature: 36.6, accelerometer: 'Stable' } },
  { id: 'p2', name: 'Rajesh Verma', age: 58, condition: 'Diabetic', status: 'stable', vitals: { heartRate: 88, spo2: 96, temperature: 37.2, accelerometer: 'Stable' } },
  { id: 'p3', name: 'Priya Nair', age: 45, condition: 'Post-Surgery', status: 'stable', vitals: { heartRate: 75, spo2: 99, temperature: 36.8, accelerometer: 'Stable' } },
  { id: 'p4', name: 'Vikram Singh', age: 62, condition: 'Hypertension', status: 'stable', vitals: { heartRate: 76, spo2: 97, temperature: 36.8, accelerometer: 'Stable' } },
  { id: 'p5', name: 'Meera Joshi', age: 29, condition: 'Respiratory', status: 'stable', vitals: { heartRate: 85, spo2: 98, temperature: 37.1, accelerometer: 'Stable' } },
  { id: 'p6', name: 'Arjun Patel', age: 71, condition: 'Cardiac', status: 'stable', vitals: { heartRate: 68, spo2: 96, temperature: 36.4, accelerometer: 'Stable' } },
];

let patients = [...INITIAL_PATIENTS.map(p => ({ ...p, vitals: { ...p.vitals } }))];
let alerts: Alert[] = [];
let escalations: EscalationEvent[] = [];

// Track active connections
let clients: Set<WebSocket> = new Set();
let tickInterval: NodeJS.Timeout | null = null;
let serverStartTime = Date.now();

// ---------------------------------------------------------
// 2. HELPER FUNCTIONS
// ---------------------------------------------------------

function broadcast(type: string, data: any) {
  const message = JSON.stringify({ type, data });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function randOffset(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// ---------------------------------------------------------
// 3. ANOMALY LOGIC
// ---------------------------------------------------------

// P3 (Priya Nair) will have an anomaly injected
const ANOMALY_PATIENT_ID = 'p3';
const ANOMALY_START_SEC = 30; // 30 seconds after server start
const ANOMALY_DURATION_SEC = 20; // Lasts for 20 seconds

let hasTriggeredEscalation = false;

// ---------------------------------------------------------
// 4. MAIN SIMULATION LOOP (runs every 2s)
// ---------------------------------------------------------

function tick() {
  const now = Date.now();
  const secondsSinceStart = (now - serverStartTime) / 1000;
  
  const isAnomalyWindow = 
    secondsSinceStart >= ANOMALY_START_SEC && 
    secondsSinceStart < (ANOMALY_START_SEC + ANOMALY_DURATION_SEC);

  patients = patients.map(p => {
    // 1. Generate new vitals based on baseline + fluctuation
    const baseline = INITIAL_PATIENTS.find(bp => bp.id === p.id)!.vitals;
    let newHR = Math.round(baseline.heartRate + randOffset(-3, 3));
    let newSpO2 = Math.min(100, Math.round(baseline.spo2 + randOffset(-1, 1)));
    let newTemp = Number((baseline.temperature + randOffset(-0.2, 0.2)).toFixed(1));
    let newAccel: 'Stable' | 'Fall Detected' = 'Stable';

    // 2. Inject Anomaly for P3
    if (p.id === ANOMALY_PATIENT_ID && isAnomalyWindow) {
      newHR = Math.round(135 + randOffset(-5, 10)); // Major HR spike
      newSpO2 = Math.round(88 + randOffset(-2, 2)); // Major SpO2 drop
      newAccel = 'Fall Detected';
    }

    // 3. Compound Anomaly Detection
    let newStatus: 'stable' | 'warning' | 'critical' = 'stable';
    
    // Critical: High HR AND Low SpO2 simultaneously
    if (newHR > 110 && newSpO2 < 92) {
      newStatus = 'critical';
    } 
    // Warning: High HR OR Low SpO2 independently
    else if (newHR > 100 || newSpO2 < 94) {
      newStatus = 'warning';
    }

    // 4. Trigger Alerts & Escalations (only once per anomaly event)
    if (newStatus === 'critical' && !hasTriggeredEscalation && p.id === ANOMALY_PATIENT_ID) {
      hasTriggeredEscalation = true;
      
      const alertId = generateId();
      const alertMsg = `COMPOUND ALERT: SpO₂ dropped to ${newSpO2}% and HR spiked to ${newHR} bpm. Fall detected.`;
      const alertTimestamp = formatTime(new Date());

      // Create Alert
      const newAlert: Alert = {
        id: alertId,
        patientName: p.name,
        message: alertMsg,
        severity: 'critical',
        timestamp: alertTimestamp,
      };
      alerts = [newAlert, ...alerts].slice(0, 10); // Keep last 10
      broadcast('alerts_update', alerts);

      // Capture current vitals for the WhatsApp message
      const capturedVitals = { heartRate: newHR, spo2: newSpO2, temperature: newTemp };
      const capturedName = p.name;

      // Trigger Escalation Chain with Delays
      setTimeout(() => {
        escalations = [{ id: generateId(), timestamp: formatTime(new Date()), level: 'patient', message: `Automated ping sent to ${p.name}'s Apple Watch.` }, ...escalations];
        broadcast('escalations_update', escalations);
      }, 1000);

      // CAREGIVER LEVEL: Send WhatsApp at 4 seconds (before family SMS at 6s)
      setTimeout(async () => {
        // Skip if doctor has already acknowledged
        if (hasDoctorAcknowledged()) {
          console.log('[Escalation] Doctor acknowledged before caregiver window. Skipping WhatsApp.');
          return;
        }

        escalations = [{ id: generateId(), timestamp: formatTime(new Date()), level: 'family', message: `No response from patient. WhatsApp alert sent to caregiver.` }, ...escalations];
        broadcast('escalations_update', escalations);

        // Try to find a caregiver in the DB (search by patient name for simulated patients)
        try {
          const dbUser = await User.findOne({ fullName: { $regex: capturedName, $options: 'i' } });
          if (dbUser && dbUser.caregiver && dbUser.caregiver.phone) {
            await sendCaregiverWhatsApp(
              alertId,
              dbUser.caregiver.phone,
              capturedName,
              alertMsg,
              capturedVitals,
              alertTimestamp
            );
          } else {
            console.log(`[WhatsApp] No caregiver found for ${capturedName}. Skipping WhatsApp.`);
          }
        } catch (err) {
          console.error('[WhatsApp] Error looking up caregiver:', err);
        }
      }, 4000);

      setTimeout(() => {
        escalations = [{ id: generateId(), timestamp: formatTime(new Date()), level: 'doctor', message: `Contact unreachable. Priority push notification sent to Dr. Samridh.` }, ...escalations];
        broadcast('escalations_update', escalations);
      }, 12000);
    }

    // If anomaly window closes, reset the trigger lock so it can happen again if server restarts logic
    if (!isAnomalyWindow && hasTriggeredEscalation && p.id === ANOMALY_PATIENT_ID) {
       // Optional: we can reset `hasTriggeredEscalation = false` if we wanted repeating loops
       // For this demo, we'll just let them recover cleanly.
    }

    return {
      ...p,
      status: newStatus,
      vitals: { heartRate: newHR, spo2: newSpO2, temperature: newTemp, accelerometer: newAccel }
    };
  });

  // Broadcast updated patients
  broadcast('patients_update', patients);
}

// ---------------------------------------------------------
// 5. SERVER ATTACHMENT
// ---------------------------------------------------------

export function initVitalsSimulator(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    clients.add(ws);

    // Send initial state immediately upon connection
    ws.send(JSON.stringify({ type: 'patients_update', data: patients }));
    ws.send(JSON.stringify({ type: 'alerts_update', data: alerts }));
    ws.send(JSON.stringify({ type: 'escalations_update', data: escalations }));

    // Listen for incoming messages (like telehealth signals)
    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        // Relay telehealth signaling and dummy sync events to other clients
        if (parsed.type === 'telehealth_signal' || parsed.type === 'telehealth_sync_appointments') {
          for (const client of clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message.toString());
            }
          }
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clients.delete(ws);
    });
  });

  // Start loop if not already running
  if (!tickInterval) {
    console.log('Starting vitals simulation loop...');
    serverStartTime = Date.now(); // Reset timer so 30s anomaly happens relative to start
    tickInterval = setInterval(tick, 2000); // Tick every 2s
  }
}
