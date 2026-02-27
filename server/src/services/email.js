const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"JobHai" <${process.env.SMTP_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

const emailTemplates = {
  verifyEmail: (name, link) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:8px">
      <h2 style="color:#2563eb">Welcome to JobHai, ${name}!</h2>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${link}" style="display:inline-block;padding:12px 28px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">Verify Email</a>
      <p style="margin-top:20px;color:#6b7280;font-size:13px">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
    </div>`,

  resetPassword: (name, link) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:8px">
      <h2 style="color:#dc2626">Password Reset Request</h2>
      <p>Hi ${name}, click the button below to reset your password:</p>
      <a href="${link}" style="display:inline-block;padding:12px 28px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">Reset Password</a>
      <p style="margin-top:20px;color:#6b7280;font-size:13px">This link expires in 1 hour. If you didn't request this, please ignore.</p>
    </div>`,

  applicationReceived: (candidateName, jobTitle, companyName) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:8px">
      <h2 style="color:#059669">Application Received!</h2>
      <p>Hi ${candidateName},</p>
      <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received successfully.</p>
      <p>We'll notify you once the employer reviews your application.</p>
      <p style="margin-top:20px;color:#6b7280;font-size:13px">Best of luck! — Team JobHai</p>
    </div>`,

  applicationStatusChanged: (candidateName, jobTitle, status) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:8px">
      <h2 style="color:#7c3aed">Application Status Update</h2>
      <p>Hi ${candidateName},</p>
      <p>Your application for <strong>${jobTitle}</strong> has been updated to: <strong style="color:#2563eb">${status.toUpperCase()}</strong></p>
      <p style="margin-top:20px;color:#6b7280;font-size:13px">Login to JobHai to view details.</p>
    </div>`,

  jobApproved: (employerName, jobTitle) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:8px">
      <h2 style="color:#2563eb">Job Posting Approved!</h2>
      <p>Hi ${employerName},</p>
      <p>Your job posting for <strong>${jobTitle}</strong> is now live on JobHai.</p>
      <p style="margin-top:20px;color:#6b7280;font-size:13px">Best regards — Team JobHai</p>
    </div>`,

  jobPostedAdmin: (employerName, jobTitle) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:8px">
      <h2 style="color:#2563eb">New Job Pending Approval</h2>
      <p>Employer <strong>${employerName}</strong> has posted a new job: <strong>${jobTitle}</strong>.</p>
      <p>Please login to the admin panel to review and approve it.</p>
    </div>`,

  applicationAlertForEmployer: (employerName, candidateName, jobTitle) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:8px">
      <h2 style="color:#2563eb">New Application Received</h2>
      <p>Hi ${employerName},</p>
      <p><strong>${candidateName}</strong> just applied for your job: <strong>${jobTitle}</strong>.</p>
      <p style="margin-top:20px;color:#6b7280;font-size:13px">Login to your employer dashboard to review.</p>
    </div>`,

  teamInvite: (inviterName, companyName, link) => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9fafb;border-radius:8px">
      <h2 style="color:#d97706">Team Invitation</h2>
      <p>Hi! <strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong>'s hiring team on JobHai.</p>
      <a href="${link}" style="display:inline-block;padding:12px 28px;background:#d97706;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold">Accept Invitation</a>
      <p style="margin-top:20px;color:#6b7280;font-size:13px">This invitation expires in 7 days.</p>
    </div>`,
};

module.exports = { sendEmail, emailTemplates };
