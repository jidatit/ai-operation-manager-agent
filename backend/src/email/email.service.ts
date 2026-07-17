import { Resend } from 'resend';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let resendClient: Resend | null = null;

/** Brand colors from AI COO logo */
const BRAND = {
  primary: '#FF7A00',
  mid: '#FF9736',
  light: '#FFBC7D',
  ink: '#18181b',
  body: '#3f3f46',
  muted: '#71717a',
  border: '#e4e4e7',
  bg: '#fafafa',
  card: '#ffffff',
  success: '#16a34a',
} as const;

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineFormat(text: string): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong style="color:#18181b;font-weight:600;">$1</strong>');
}

/**
 * Convert markdown body into readable HTML with paragraphs and bullet/numbered lists.
 */
export function mdToHtml(text: string): string {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const parts: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const content = paragraph.map(inlineFormat).join(' ');
    parts.push(
      `<p style="margin:0 0 12px;color:${BRAND.body};font-size:14px;line-height:1.65;">${content}</p>`,
    );
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) return;
    parts.push(listType === 'ul' ? '</ul>' : '</ol>');
    listType = null;
  };

  const openList = (type: 'ul' | 'ol') => {
    if (listType === type) return;
    closeList();
    listType = type;
    const style =
      type === 'ul'
        ? `margin:0 0 16px;padding-left:22px;color:${BRAND.body};font-size:14px;line-height:1.65;`
        : `margin:0 0 16px;padding-left:22px;color:${BRAND.body};font-size:14px;line-height:1.65;`;
    parts.push(type === 'ul' ? `<ul style="${style}">` : `<ol style="${style}">`);
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^[-*•]\s+(.+)$/);
    const numbered = line.match(/^\d+[.)]\s+(.+)$/);

    if (bullet) {
      flushParagraph();
      openList('ul');
      parts.push(
        `<li style="margin:0 0 8px;padding-left:4px;">${inlineFormat(bullet[1])}</li>`,
      );
      continue;
    }

    if (numbered) {
      flushParagraph();
      openList('ol');
      parts.push(
        `<li style="margin:0 0 8px;padding-left:4px;">${inlineFormat(numbered[1])}</li>`,
      );
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }

    closeList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  closeList();

  return parts.join('') || `<p style="margin:0;color:${BRAND.body};font-size:14px;line-height:1.65;">${inlineFormat(text)}</p>`;
}

function sectionBlock(name: string, body: string): string {
  return `
  <tr>
    <td style="padding:0 0 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;background:${BRAND.card};">
        <tr>
          <td style="width:4px;background:${BRAND.primary};font-size:0;line-height:0;">&nbsp;</td>
          <td style="padding:18px 20px;">
            <h2 style="margin:0 0 12px;font-size:15px;font-weight:600;color:${BRAND.ink};letter-spacing:-0.01em;">${escapeHtml(name)}</h2>
            ${mdToHtml(body)}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export function buildReportEmailHtml(
  title: string,
  markdown: string,
  reportUrl: string,
): string {
  const sections = [
    'Executive Summary',
    'Top Priorities',
    'Daily Progress',
    'Completed Work',
    'Emails',
    'Meetings',
    'Tasks',
    'Outstanding Tasks',
    'Slack',
    'Slack Updates',
    'Recommendations',
    'Recommendations for Tomorrow',
    'Operational Risks',
    'Risks',
    'Productivity Summary',
  ];

  const blocks = sections
    .map((name) => {
      const body = extractSection(markdown, name);
      if (!body) return '';
      return sectionBlock(name, body);
    })
    .filter(Boolean)
    .join('');

  const fallback = !blocks
    ? sectionBlock('Report', markdown.slice(0, 3000))
    : blocks;

  const emailWidth = 680;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="${emailWidth}" cellpadding="0" cellspacing="0" role="presentation" style="max-width:${emailWidth}px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.card};border:1px solid ${BRAND.border};border-bottom:none;border-radius:12px 12px 0 0;padding:28px 36px 24px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:${BRAND.primary};letter-spacing:-0.02em;">AI COO</p>
              <p style="margin:6px 0 0;font-size:11px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND.muted};">
                Enterprise Operations Manager
              </p>
            </td>
          </tr>

          <!-- Brand accent bar -->
          <tr>
            <td style="background:linear-gradient(90deg, ${BRAND.light} 0%, ${BRAND.mid} 40%, ${BRAND.primary} 100%);height:4px;font-size:0;line-height:0;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">&nbsp;</td>
          </tr>

          <!-- Title band -->
          <tr>
            <td style="background:${BRAND.card};padding:28px 36px 8px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">
              <h1 style="margin:0;font-size:22px;font-weight:650;color:${BRAND.ink};letter-spacing:-0.02em;line-height:1.3;">
                ${escapeHtml(title)}
              </h1>
              <p style="margin:8px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.5;">
                Your AI-generated executive brief. Key updates are grouped below.
              </p>
            </td>
          </tr>

          <!-- Sections -->
          <tr>
            <td style="background:${BRAND.card};padding:20px 36px 8px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                ${fallback}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:${BRAND.card};padding:8px 36px 32px;border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};border-bottom:1px solid ${BRAND.border};border-radius:0 0 12px 12px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding:8px 0 0;">
                    <a href="${reportUrl}"
                       style="display:inline-block;background:${BRAND.primary};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:10px;letter-spacing:-0.01em;">
                      View full report in dashboard
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:20px 0 0;">
                    <p style="margin:0;font-size:12px;color:${BRAND.muted};line-height:1.5;">
                      Sent by <strong style="color:${BRAND.body};">AI COO</strong> · Enterprise Operations Manager
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:20px 16px 0;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a1a1aa;line-height:1.5;">
                You received this because email reports are enabled in your settings.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
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
