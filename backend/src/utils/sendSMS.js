import twilio from 'twilio';

// Configure Twilio client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(phoneNumber, message) {
  // Send the SMS message
  // await client.messages.create({
  //   body: message,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: phoneNumber,
  // });
}

export default sendSMS;
