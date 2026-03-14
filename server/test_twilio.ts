import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config({ path: 'd:/MoveCare/server/.env' });

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM;

console.log('SID:', sid);
console.log('Token:', token?.substring(0, 6) + '...');
console.log('From:', from);

async function test() {
  try {
    const client = twilio(sid, token);
    // Just test account validity
    const account = await client.api.accounts(sid!).fetch();
    console.log('Account status:', account.status);
    console.log('Account name:', account.friendlyName);
  } catch (err: any) {
    console.error('Twilio error:', err.message);
    console.error('Status:', err.status);
  }
}

test();
