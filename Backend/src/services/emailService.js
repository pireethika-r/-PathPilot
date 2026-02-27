import Mailjet from "node-mailjet";

const isMailEnabled = () => String(process.env.MAILJET_ENABLED || "true") === "true";

const getClient = () => {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return null;
  }

  return Mailjet.apiConnect(apiKey, secretKey);
};

export const sendMailjetEmail = async ({
  toEmail,
  toName = "",
  subject,
  textPart,
  htmlPart,
}) => {
  if (!isMailEnabled()) {
    return { sent: false, reason: "disabled" };
  }

  const fromEmail = process.env.MAILJET_FROM_EMAIL;
  const fromName = process.env.MAILJET_FROM_NAME || "PathPilo";
  if (!fromEmail) {
    return { sent: false, reason: "missing_from_email" };
  }

  const client = getClient();
  if (!client) {
    return { sent: false, reason: "missing_credentials" };
  }

  try {
    await client.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: { Email: fromEmail, Name: fromName },
          To: [{ Email: toEmail, Name: toName }],
          Subject: subject,
          TextPart: textPart,
          HTMLPart: htmlPart,
        },
      ],
    });

    return { sent: true };
  } catch (_error) {
    return { sent: false, reason: "send_failed" };
  }
};
