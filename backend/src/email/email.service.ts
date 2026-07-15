import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

function extractSection(markdown: string, heading: string): string {
  const regex = new RegExp(
    `(?:^|\\n)##?\\s*${heading}[\\s\\S]*?(?=\\n##?\\s|$)`,
    'i',
  );
  const match = markdown.match(regex);
  return match?.[0]?.replace(/^#+.*/, '').trim() ?? '';
}

function mdToHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export function buildReportEmailHtml(
  title: string,
  markdown: string,
  reportUrl: string,
): string {
  const sections = [
    'Executive Summary',
    'Daily Progress',
    'Emails',
    'Meetings',
    'Tasks',
    'Slack',
    'Slack Updates',
    'Recommendations',
    'Recommendations for Tomorrow',
    'Operational Risks',
    'Risks',
  ];

  const blocks = sections
    .map((name) => {
      const body = extractSection(markdown, name);
      if (!body) return '';
      return `<h2 style="color:#111;font-size:16px;margin:24px 0 8px;">${name}</h2>
      <div style="color:#333;font-size:14px;line-height:1.5;">${mdToHtml(body)}</div>`;
    })
    .filter(Boolean)
    .join('');

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,Segoe UI,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e4e4e7;">
        <tr><td>
          <p style="margin:0;color:#71717a;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">AI COO</p>
          <h1 style="margin:8px 0 24px;font-size:22px;color:#18181b;">${title}</h1>
          ${blocks || `<div style="color:#333;font-size:14px;line-height:1.5;">${mdToHtml(markdown.slice(0, 3000))}</div>`}
          <hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0;" />
          <p style="margin:0;font-size:13px;color:#71717a;">
            <a href="${reportUrl}" style="color:#2563eb;text-decoration:none;">View full report in dashboard →</a>
          </p>
          <p style="margin:16px 0 0;font-size:11px;color:#a1a1aa;">Sent by AI Operations Manager</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendReportEmail(options: {
  to: string;
  subject: string;
  markdown: string;
  reportId: string;
}): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    logger.warn('Resend API key not configured — skipping email');
    return false;
  }

  const reportUrl = `${env.FRONTEND_URL}/reports/${options.reportId}`;
  const html = buildReportEmailHtml(options.subject, options.markdown, reportUrl);

  const { data, error } = await getResend().emails.send({
    from: env.EMAIL_FROM,
    to: [options.to],
    subject: options.subject,
    html,
    text: options.markdown,
  });

  if (error) {
    logger.error({ error, to: options.to, reportId: options.reportId }, 'Resend email failed');
    throw new Error(error.message);
  }

  logger.info(
    { to: options.to, reportId: options.reportId, resendId: data?.id },
    'Report email sent via Resend',
  );
  return true;
}
