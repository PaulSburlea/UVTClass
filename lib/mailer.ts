import nodemailer from "nodemailer";

export interface MailOptions {
  to:       string;
  subject:  string;
  html:     string;
  fromName?: string;
}

export async function sendMail(opts: MailOptions) {
  // Cream transportatorul în momentul apelului, astfel încât să 
  // preluăm exact valorile din process.env setate în test sau runtime.
  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Dacă există fromName, afișăm ceva de genul "Profesor X (UVTClass)".
  // Dacă nu, revenim doar la "UVTClass".
  const displayName = opts.fromName
    ? `${opts.fromName} (UVTClass)`
    : "UVTClass";

  return transporter.sendMail({
    from:    `"${displayName}" <${process.env.SMTP_FROM}>`,
    to:       opts.to,
    subject:  opts.subject,
    html:     opts.html,
  });
}
