import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

// Track sent escalation IDs to prevent duplicate sends
const sentAlerts = new Set<string>();

export async function sendCaregiverWhatsApp(
  alertId: string,
  caregiverPhone: string,
  patientName: string,
  alertMessage: string,
  vitals: { heartRate: number; spo2: number; temperature: number },
  timestamp: string
): Promise<boolean> {
  // Prevent duplicate sends for the same escalation event
  if (sentAlerts.has(alertId)) {
    console.log(`[WhatsApp] Alert ${alertId} already sent, skipping.`);
    return false;
  }

  if (!accountSid || !authToken || accountSid === 'your_twilio_sid') {
    console.log('[WhatsApp] Twilio credentials not configured. Skipping WhatsApp send.');
    return false;
  }

  try {
    const client = twilio(accountSid, authToken);

    // Format the phone number for WhatsApp (Indian format: +91XXXXXXXXXX)
    let formattedPhone = caregiverPhone.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone; // Add India country code
    }

    // Dynamic color indicators based on clinical thresholds
    const hrIcon = vitals.heartRate > 120 || vitals.heartRate < 50 ? '🔴 HIGH' :
                   (vitals.heartRate > 100 || vitals.heartRate < 60) ? '🟡 ELEVATED' : '🟢 NORMAL';
    const spo2Icon = vitals.spo2 < 90 ? '🔴 CRITICAL' :
                     vitals.spo2 < 95 ? '🟡 LOW' : '🟢 NORMAL';
    const tempIcon = vitals.temperature > 39.5 ? '🔴 HIGH' :
                     vitals.temperature > 38 ? '🟡 ELEVATED' : '🟢 NORMAL';

    const body = `🏥 *MoveCare — Critical Health Alert*
━━━━━━━━━━━━━━━━━━━━━
👤 *Patient:* ${patientName}
🕐 *Time:* ${timestamp}
⚠️ *Alert Level:* CRITICAL
━━━━━━━━━━━━━━━━━━━━━
📊 *VITAL READINGS*

❤️ Heart Rate:     ${vitals.heartRate} bpm  ${hrIcon}
🫁 SpO₂:           ${vitals.spo2}%      ${spo2Icon}
🌡️ Temperature:    ${vitals.temperature}°C   ${tempIcon}
━━━━━━━━━━━━━━━━━━━━━
🚨 *ALERT REASON*
${alertMessage}
━━━━━━━━━━━━━━━━━━━━━
✅ *ACTION REQUIRED*
Please check on ${patientName} immediately and contact their assigned doctor if unresponsive.
━━━━━━━━━━━━━━━━━━━━━
📱 _This alert was sent by MoveCare Remote Health Monitoring System. Do not reply to this message._`;

    const message = await client.messages.create({
      body,
      from: whatsappFrom,
      to: `whatsapp:+${formattedPhone}`
    });

    sentAlerts.add(alertId);
    console.log(`[WhatsApp] Alert sent to caregiver! SID: ${message.sid}`);
    return true;
  } catch (error: any) {
    console.error(`[WhatsApp] Failed to send:`, error.message);
    return false;
  }
}

// Check if a doctor has acknowledged (placeholder for future WebSocket integration)
let doctorAcknowledged = false;

export function setDoctorAcknowledged(value: boolean) {
  doctorAcknowledged = value;
}

export function hasDoctorAcknowledged(): boolean {
  return doctorAcknowledged;
}
