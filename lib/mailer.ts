import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  fromName?: string;   // nou
}

export async function sendMail(opts: MailOptions) {
  // dacă nu trimiți fromName, revenim la UVTClass simplu
  const displayName = opts.fromName
    ? `${opts.fromName} (UVTClass)`
    : `UVTClass`;

  return transporter.sendMail({
    from:    `"${displayName}" <${process.env.SMTP_FROM}>`,
    to:       opts.to,
    subject:  opts.subject,
    html:     opts.html,
  });
}
