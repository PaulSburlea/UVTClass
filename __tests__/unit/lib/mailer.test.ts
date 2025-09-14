process.env.MAILER_FROM_NAME  = "Nume Expeditor";
process.env.MAILER_FROM_EMAIL = "expeditor@exemplu.com";
import { sendMail, MailOptions } from "@/lib/mailer";
import nodemailer from "nodemailer";

// Supradefinim transportul
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));

describe("sendMail", () => {
  const oldEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...oldEnv };

    // Pregătim un transporter fals cu sendMail spionat
    const sendMailSpy = jest.fn().mockResolvedValue({ messageId: "abc123" });
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailSpy,
    });
  });

  afterAll(() => {
    process.env = oldEnv;
  });

  it("folosește `fromName` atunci când este specificat", async () => {
    // Setăm variabilele de mediu înainte de apelul sendMail
    process.env.SMTP_FROM   = "uvtclass0@gmail.com";
    process.env.SMTP_HOST   = "smtp.sendgrid.net";
    process.env.SMTP_PORT   = "587";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_USER   = "apikey";
    process.env.SMTP_PASS   = "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";

    const mailOpts: MailOptions = {
      to:       "dest@example.com",
      subject:  "Subiect test",
      html:     "<p>Conținut</p>",
      fromName: "Profesor Popescu",
    };

    // Apelăm sendMail (vede mai întâi createTransport cu env-urile de mai sus)
    await sendMail(mailOpts);

    // 1) Verificăm că createTransport a primit exact valorile din process.env
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host:   "smtp.sendgrid.net",
      port:   587,
      secure: false,
      auth: {
        user: "apikey",
        pass: "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",
      },
    });

    // 2) Verificăm payload-ul transmis către sendMail()
    const transporter = (nodemailer.createTransport as jest.Mock).mock.results[0].value;
    const sendMailSpy = transporter.sendMail as jest.Mock;

    expect(sendMailSpy).toHaveBeenCalledWith({
      from:    `"Profesor Popescu (UVTClass)" <uvtclass0@gmail.com>`,
      to:       "dest@example.com",
      subject:  "Subiect test",
      html:     "<p>Conținut</p>",
    });
  });

  it("folosește doar `UVTClass` dacă `fromName` lipsește", async () => {
    process.env.SMTP_FROM   = "noreply@domain.com";
    process.env.SMTP_HOST   = "smtp.sendgrid.net";
    process.env.SMTP_PORT   = "587";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_USER   = "apikey";
    process.env.SMTP_PASS   = "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";

    const mailOpts: MailOptions = {
      to:      "dest2@example.com",
      subject: "Alt subiect",
      html:    "<div>Salut!</div>",
    };

    // Apelăm sendMail
    await sendMail(mailOpts);

    // Verificăm payload-ul din sendMail()
    const transporter = (nodemailer.createTransport as jest.Mock).mock.results[0].value;
    const sendMailSpy = transporter.sendMail as jest.Mock;

    expect(sendMailSpy).toHaveBeenCalledWith({
      from:    `"UVTClass" <noreply@domain.com>`,
      to:       "dest2@example.com",
      subject:  "Alt subiect",
      html:     "<div>Salut!</div>",
    });
  });

  it("propagă excepția dacă sendMail eșuează", async () => {
    // Configurăm sendMail ca să arunce excepție
    const failingSend = jest.fn().mockRejectedValue(new Error("SMTP down"));
    ;(nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: failingSend,
    });

    process.env.SMTP_FROM   = "uvtclass0@gmail.com";
    process.env.SMTP_HOST   = "smtp.sendgrid.net";
    process.env.SMTP_PORT   = "587";
    process.env.SMTP_SECURE = "false";
    process.env.SMTP_USER   = "apikey";
    process.env.SMTP_PASS   = "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";

    await expect(
      sendMail({
        to:      "abc@xyz.com",
        subject: "Hello",
        html:    "<p>Test</p>",
      })
    ).rejects.toThrow("SMTP down");
  });
});
