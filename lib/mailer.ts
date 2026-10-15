import nodemailer from "nodemailer";

const REAL_TEST_EMAILS: Record<string, string> = {
  "general-secretary": "sanayodeji087@gmail.com",
  pro: "sanusifatih04@gmail.com",
};

const DEFAULT_GEN_SEC_EMAIL = "sanayodeji087@gmail.com";

interface ConcernEmailPayload {
  trackingId: string;
  category: string;
  subject: string;
  message: string;
  isAnonymous: boolean;
  senderName?: string | null;
  senderEmail?: string | null;
  level?: string | null;
  targetOfficeSlug: string;
  targetOfficeName: string;
  targetOfficeEmail: string;
}

export async function sendConcernEmails(payload: ConcernEmailPayload) {
  const isTestMode = process.env.TEST_MODE !== "false";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Determine actual recipient for executive notification
  let recipientEmail = payload.targetOfficeEmail;
  let isRedirected = false;

  // If email is placeholder or not in real test emails, redirect in TEST_MODE
  if (isTestMode && recipientEmail.includes("@nacos-unilag.example")) {
    const knownEmail = REAL_TEST_EMAILS[payload.targetOfficeSlug];
    recipientEmail = knownEmail || DEFAULT_GEN_SEC_EMAIL;
    isRedirected = true;
  }

  // 1. Executive Notification Email
  const execSubject = isRedirected
    ? `[NACOS Hub Test Mode] New Concern for ${payload.targetOfficeName}: ${payload.subject}`
    : `[NACOS Hub] New Concern Assigned (${payload.trackingId}): ${payload.subject}`;

  const senderInfoHtml = payload.isAnonymous
    ? `<strong>Sender:</strong> Anonymous Student (${payload.level || "Unspecified Level"})`
    : `<strong>Sender:</strong> ${payload.senderName || "Student"} (${payload.senderEmail || "No email"}, Level: ${payload.level || "N/A"})`;

  const execHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #0B1220; color: #F5F5F0; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
      <div style="border-bottom: 2px solid #34D399; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="color: #34D399; margin: 0;">NACOS Hub - Executive Alert</h2>
        <p style="color: #94A3B8; font-size: 14px; margin: 4px 0 0 0;">New student concern received</p>
      </div>

      ${isRedirected ? `
        <div style="background-color: rgba(234, 179, 8, 0.15); border: 1px solid #EAB308; color: #FDE047; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 16px;">
          ⚠️ <strong>TEST MODE NOTICE:</strong> This concern was intended for <strong>${payload.targetOfficeName}</strong> (${payload.targetOfficeEmail}), but redirected to General Secretary (${recipientEmail}) for testing.
        </div>
      ` : ""}

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr><td style="color: #94A3B8; padding: 6px 0;">Tracking ID:</td><td style="color: #34D399; font-weight: bold; font-family: monospace; font-size: 16px;">${payload.trackingId}</td></tr>
        <tr><td style="color: #94A3B8; padding: 6px 0;">Target Office:</td><td>${payload.targetOfficeName}</td></tr>
        <tr><td style="color: #94A3B8; padding: 6px 0;">Category:</td><td>${payload.category}</td></tr>
        <tr><td style="color: #94A3B8; padding: 6px 0;">Identity:</td><td>${senderInfoHtml}</td></tr>
      </table>

      <div style="background-color: #131C2E; border: 1px solid #1E293B; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <h4 style="color: #F5F5F0; margin: 0 0 8px 0; font-size: 16px;">${payload.subject}</h4>
        <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; white-space: pre-line; margin: 0;">${payload.message}</p>
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${appUrl}/track/${payload.trackingId}" style="background-color: #34D399; color: #0B1220; padding: 12px 24px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block;">
          View & Track Status
        </a>
      </div>
      <p style="color: #64748B; font-size: 12px; text-align: center; margin-top: 24px;">
        NACOS UNILAG Hub &bull; Campaign Prototype #AyodejiForGenSec
      </p>
    </div>
  `;

  await dispatchEmail({
    to: recipientEmail,
    subject: execSubject,
    html: execHtml,
    tag: "Executive Notification",
  });

  // 2. Student Receipt Confirmation Email (if student provided an email)
  if (payload.senderEmail && payload.senderEmail.trim() !== "") {
    const studentSubject = `[NACOS Hub] Concern Received - Tracking ID: ${payload.trackingId}`;
    const studentHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #0B1220; color: #F5F5F0; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
        <div style="border-bottom: 2px solid #34D399; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #34D399; margin: 0;">NACOS Hub - Confirmation</h2>
          <p style="color: #94A3B8; font-size: 14px; margin: 4px 0 0 0;">Your concern has been registered</p>
        </div>

        <p style="color: #F5F5F0; font-size: 15px;">Hello ${payload.senderName || "Student"},</p>
        <p style="color: #94A3B8; font-size: 14px; line-height: 1.5;">
          Thank you for reaching out to NACOS UNILAG Executive Council. Your concern regarding <strong>"${payload.subject}"</strong> has been assigned to <strong>${payload.targetOfficeName}</strong>.
        </p>

        <div style="background-color: #131C2E; border: 1px dashed #34D399; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <span style="color: #94A3B8; font-size: 12px; display: block; text-transform: uppercase; letter-spacing: 1px;">Your Tracking ID</span>
          <strong style="color: #34D399; font-size: 24px; font-family: monospace; display: block; margin-top: 4px;">${payload.trackingId}</strong>
        </div>

        <p style="color: #94A3B8; font-size: 13px;">
          Keep this Tracking ID safe. You can use it anytime on NACOS Hub to check response status and audit updates.
        </p>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${appUrl}/track/${payload.trackingId}" style="background-color: #34D399; color: #0B1220; padding: 12px 24px; font-weight: bold; border-radius: 8px; text-decoration: none; display: inline-block;">
            Track My Concern
          </a>
        </div>
      </div>
    `;

    await dispatchEmail({
      to: payload.senderEmail,
      subject: studentSubject,
      html: studentHtml,
      tag: "Student Confirmation",
    });
  }
}

async function dispatchEmail({
  to,
  subject,
  html,
  tag,
}: {
  to: string;
  subject: string;
  html: string;
  tag: string;
}) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const from = process.env.MAIL_FROM || "NACOS UNILAG Hub <noreply@nacos-unilag.org>";

  // Dev mode check: If no host or pass is set, log to console
  if (!host || !pass || host.trim() === "" || pass.trim() === "") {
    console.log(`\n============== [DEV MODE EMAIL LOG: ${tag.toUpperCase()}] ==============`);
    console.log(`To: ${to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (HTML summary): ${html.replace(/<[^>]*>?/gm, " ").substring(0, 300)}...`);
    console.log(`====================================================================\n`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    console.log(`[SMTP EMAIL SENT]: ${tag} -> ${to}`);
  } catch (error) {
    console.error(`[SMTP EMAIL FAILED - FALLBACK LOG] (${tag} to ${to}):`, error);
    console.log(`Fallback log - Subject: ${subject}`);
  }
}
