import dotenv from 'dotenv';
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const body = `🏥 *MoveCare — Critical Health Alert*
━━━━━━━━━━━━━━━━━━━━━
👤 *Patient:* Priya Nair
🕐 *Time:* 03:46 AM, 15 March 2026
⚠️ *Alert Level:* CRITICAL
━━━━━━━━━━━━━━━━━━━━━
📊 *VITAL READINGS*

❤️ Heart Rate:     138 bpm  🔴 HIGH
🫁 SpO₂:           88%      🔴 CRITICAL
🌡️ Temperature:    36.9°C   🟢 NORMAL
━━━━━━━━━━━━━━━━━━━━━
🚨 *ALERT REASON*
COMPOUND ALERT: SpO₂ dropped to 88% and HR spiked to 138 bpm. Fall detected.
━━━━━━━━━━━━━━━━━━━━━
✅ *ACTION REQUIRED*
Please check on Priya Nair immediately and contact their assigned doctor if unresponsive.
━━━━━━━━━━━━━━━━━━━━━
📱 _This alert was sent by MoveCare Remote Health Monitoring System. Do not reply to this message._`;

client.messages
  .create({
    from: 'whatsapp:+14155238886',
    body: body,
    to: 'whatsapp:+918770473662'
  })
  .then((message: any) => console.log('✅ SUCCESS! Message SID:', message.sid))
  .catch((err: any) => console.error('❌ FAILED:', err.message));
