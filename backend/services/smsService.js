const axios = require("axios");

async function sendSms(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    const error = new Error("Twilio SMS settings are not configured.");
    error.code = "SMS_NOT_CONFIGURED";
    throw error;
  }

  const endpoint =
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`;
  const payload = new URLSearchParams({
    To: to,
    From: fromNumber,
    Body: body,
  });

  try {
    const response = await axios.post(endpoint, payload.toString(), {
      auth: {
        username: accountSid,
        password: authToken,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 15000,
    });

    return response.data;
  } catch (cause) {
    const providerError = cause.response?.data;
    const error = new Error(
      providerError?.message || "Twilio did not accept the SMS request."
    );
    error.code = "SMS_PROVIDER_ERROR";
    error.providerCode = providerError?.code;
    throw error;
  }
}

module.exports = { sendSms };
