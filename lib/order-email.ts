import { existsSync } from "fs";
import { join } from "path";
import nodemailer from "nodemailer";
import type { Attachment } from "nodemailer/lib/mailer";
import { COMPANY_INFO } from "@/lib/company-info";
import { getSiteUrl } from "@/lib/constants";
import { formatShippingAddressPublic } from "@/lib/order-tracking";
import type { OrderStatus, ShippingAddress } from "@/types";

const LOGO_CID = "thecelltime-logo";
const PRODUCTION_SITE_URL = "https://www.thecelltime.com";

export interface OrderEmailLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderEmailPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  lineItems: OrderEmailLineItem[];
  shippingAddress?: ShippingAddress | null;
}

export interface OrderStatusEmailPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
}

const NOTIFY_STATUSES: OrderStatus[] = [
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const STATUS_EMAIL_COPY: Record<
  string,
  { headline: string; message: string; subjectSuffix: string }
> = {
  processing: {
    headline: "Your order is being processed",
    message:
      "We have started preparing your order. We will notify you when it ships.",
    subjectSuffix: "is being processed",
  },
  shipped: {
    headline: "Your order has been shipped",
    message:
      "Your package is on its way. You can track the latest status on our website.",
    subjectSuffix: "has been shipped",
  },
  delivered: {
    headline: "Your order has been delivered",
    message:
      "Your order is complete. Thank you for shopping with The Cell Time!",
    subjectSuffix: "has been delivered",
  },
  cancelled: {
    headline: "Your order was cancelled",
    message:
      "This order has been cancelled. If you have questions, contact us and we will be happy to help.",
    subjectSuffix: "was cancelled",
  },
  refunded: {
    headline: "Your order was refunded",
    message:
      "A refund has been issued for this order. It may take a few business days to appear on your statement.",
    subjectSuffix: "was refunded",
  },
};

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getEmailSiteUrl(): string {
  const configured = process.env.EMAIL_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const siteUrl = getSiteUrl();
  if (/localhost|127\.0\.0\.1/i.test(siteUrl)) {
    return PRODUCTION_SITE_URL;
  }
  return siteUrl;
}

function getLogoAttachments(): Attachment[] {
  const logoPath = join(process.cwd(), "public/images/brand/thecelltime.webp");
  if (!existsSync(logoPath)) return [];

  return [
    {
      filename: "thecelltime.webp",
      path: logoPath,
      cid: LOGO_CID,
    },
  ];
}

function getLogoSrc(): string {
  if (getLogoAttachments().length > 0) {
    return `cid:${LOGO_CID}`;
  }
  return `${getEmailSiteUrl()}/images/brand/thecelltime.webp`;
}

function getTrackOrderUrl(orderNumber: string): string {
  return `${getEmailSiteUrl()}/track-order?order=${encodeURIComponent(orderNumber)}`;
}

function buildEmailFooterHtml(): string {
  return `
    <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
      The Cell Time<br />
      ${COMPANY_INFO.addressLine1}, ${COMPANY_INFO.addressLine2}<br />
      Mobile: ${COMPANY_INFO.mobile} ·
      <a href="mailto:${COMPANY_INFO.email}" style="color:#1e6bff;text-decoration:none;">
        ${COMPANY_INFO.email}
      </a>
    </p>`;
}

function buildEmailFooterText(): string {
  return [
    "The Cell Time",
    `${COMPANY_INFO.addressLine1}, ${COMPANY_INFO.addressLine2}`,
    `Mobile: ${COMPANY_INFO.mobile}`,
    COMPANY_INFO.email,
  ].join("\n");
}

function buildEmailHeaderHtml(headline: string): string {
  const logoSrc = getLogoSrc();
  return `
    <tr>
      <td style="background:#0a1628;padding:28px 32px;">
        <img
          src="${logoSrc}"
          alt="The Cell Time"
          width="200"
          style="display:block;max-width:200px;height:auto;border:0;"
        />
        <h1 style="margin:16px 0 0;font-size:22px;line-height:1.3;color:#ffffff;">
          ${escapeHtml(headline)}
        </h1>
      </td>
    </tr>`;
}

function buildTrackingBlockHtml(orderNumber: string): string {
  const trackUrl = getTrackOrderUrl(orderNumber);
  return `
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#475569;">
      To track your order at any time, visit our website and enter your order ID
      <strong style="color:#0a1628;">${escapeHtml(orderNumber)}</strong>
      with the email used at checkout.
    </p>
    <p style="margin:16px 0 0;">
      <a href="${trackUrl}" style="display:inline-block;background:#1e6bff;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:14px 24px;">
        Track your order
      </a>
    </p>`;
}

function buildTrackingBlockText(orderNumber: string): string {
  return [
    "",
    `Track your order: ${getTrackOrderUrl(orderNumber)}`,
    `Order ID: ${orderNumber}`,
  ].join("\n");
}

function buildShippingBlockHtml(address: ShippingAddress): string {
  const lines = formatShippingAddressPublic(address)
    .map(escapeHtml)
    .join("<br />");

  return `
    <h2 style="margin:28px 0 10px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">
      Delivery address
    </h2>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;">
      ${lines}
    </p>`;
}

function wrapEmailHtml(header: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;color:#0a1628;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fa;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #dde3ed;">
            ${header}
            <tr>
              <td style="padding:32px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f5f7fa;border-top:1px solid #dde3ed;">
                ${buildEmailFooterHtml()}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildOrderEmailHtml(payload: OrderEmailPayload): string {
  const itemRows = payload.lineItems
    .map((item) => {
      const lineTotal = item.unitPrice * item.quantity;
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #dde3ed;color:#0a1628;font-size:14px;">
            ${escapeHtml(item.name)}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #dde3ed;color:#475569;font-size:14px;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #dde3ed;color:#0a1628;font-size:14px;text-align:right;font-weight:600;">
            ${formatEuro(lineTotal)}
          </td>
        </tr>`;
    })
    .join("");

  const shippingBlock = payload.shippingAddress
    ? buildShippingBlockHtml(payload.shippingAddress)
    : "";

  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
      Hello ${escapeHtml(payload.customerName)},
    </p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">
      Your payment has been successfully received. Here is your order summary
      <strong style="color:#0a1628;">${escapeHtml(payload.orderNumber)}</strong>.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
      <thead>
        <tr>
          <th align="left" style="padding:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">
            Product
          </th>
          <th align="center" style="padding:0 8px 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">
            Qty
          </th>
          <th align="right" style="padding:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
      <tr>
        <td style="padding-top:12px;border-top:2px solid #0a1628;font-size:16px;font-weight:700;color:#0a1628;">
          Order total
        </td>
        <td align="right" style="padding-top:12px;border-top:2px solid #0a1628;font-size:16px;font-weight:700;color:#1e6bff;">
          ${formatEuro(payload.totalAmount)}
        </td>
      </tr>
    </table>

    ${shippingBlock}

    <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#475569;">
      We will contact you if we need additional shipping information.
      For assistance, reply to this email or contact us at
      <a href="mailto:${COMPANY_INFO.email}" style="color:#1e6bff;text-decoration:none;">
        ${COMPANY_INFO.email}
      </a>.
    </p>

    ${buildTrackingBlockHtml(payload.orderNumber)}

    <p style="margin:24px 0 0;">
      <a href="${getEmailSiteUrl()}/shop" style="display:inline-block;background:#1e6bff;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:14px 24px;">
        Continue shopping
      </a>
    </p>`;

  return wrapEmailHtml(
    buildEmailHeaderHtml("Thank you for your order"),
    body
  );
}

function buildOrderEmailText(payload: OrderEmailPayload): string {
  const lines = [
    `Thank you for your order — ${payload.orderNumber}`,
    "",
    `Hello ${payload.customerName},`,
    "",
    "Your payment has been successfully received. Order summary:",
    "",
    ...payload.lineItems.map(
      (item) =>
        `- ${item.name} x${item.quantity} — ${formatEuro(item.unitPrice * item.quantity)}`
    ),
    "",
    `Order total: ${formatEuro(payload.totalAmount)}`,
  ];

  if (payload.shippingAddress) {
    lines.push("", "Delivery address:", ...formatShippingAddressPublic(payload.shippingAddress));
  }

  lines.push(
    "",
    `Assistance: ${COMPANY_INFO.email}`,
    buildTrackingBlockText(payload.orderNumber),
    "",
    buildEmailFooterText()
  );

  return lines.filter(Boolean).join("\n");
}

function buildStatusEmailHtml(payload: OrderStatusEmailPayload): string {
  const copy = STATUS_EMAIL_COPY[payload.status];
  if (!copy) return "";

  const body = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
      Hello ${escapeHtml(payload.customerName)},
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
      ${escapeHtml(copy.message)}
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">
      Order ID:
      <strong style="color:#0a1628;">${escapeHtml(payload.orderNumber)}</strong>
    </p>
    ${buildTrackingBlockHtml(payload.orderNumber)}
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#475569;">
      Questions? Reply to this email or call us at ${COMPANY_INFO.mobile}.
    </p>`;

  return wrapEmailHtml(buildEmailHeaderHtml(copy.headline), body);
}

function buildStatusEmailText(payload: OrderStatusEmailPayload): string {
  const copy = STATUS_EMAIL_COPY[payload.status];
  if (!copy) return "";

  return [
    `${copy.headline} — ${payload.orderNumber}`,
    "",
    `Hello ${payload.customerName},`,
    "",
    copy.message,
    "",
    `Order ID: ${payload.orderNumber}`,
    buildTrackingBlockText(payload.orderNumber),
    "",
    `Mobile: ${COMPANY_INFO.mobile}`,
    buildEmailFooterText(),
  ].join("\n");
}

function getMailerConfig() {
  const from =
    process.env.ORDER_EMAIL_FROM?.trim() || COMPANY_INFO.email;
  const user = process.env.SMTP_USER?.trim() || from;
  const pass =
    process.env.SMTP_PASS?.trim() || process.env.GMAIL_APP_PASSWORD?.trim();

  if (!pass) {
    return null;
  }

  return {
    from,
    transport: nodemailer.createTransport({
      host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    }),
  };
}

async function sendEmail(input: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<boolean> {
  const config = getMailerConfig();
  if (!config) {
    console.warn(
      "[order-email] SMTP not configured (set SMTP_PASS or GMAIL_APP_PASSWORD)."
    );
    return false;
  }

  if (!input.to.trim()) {
    console.warn("[order-email] Missing customer email.");
    return false;
  }

  try {
    await config.transport.sendMail({
      from: `"The Cell Time" <${config.from}>`,
      to: input.to.trim(),
      replyTo: config.from,
      subject: input.subject,
      text: input.text,
      html: input.html,
      attachments: getLogoAttachments(),
    });
    return true;
  } catch (error) {
    console.error("[order-email] send failed", error);
    return false;
  }
}

export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload
): Promise<boolean> {
  return sendEmail({
    to: payload.customerEmail,
    subject: `Order confirmation ${payload.orderNumber} — The Cell Time`,
    text: buildOrderEmailText(payload),
    html: buildOrderEmailHtml(payload),
  });
}

export async function sendOrderStatusUpdateEmail(
  payload: OrderStatusEmailPayload
): Promise<boolean> {
  if (!NOTIFY_STATUSES.includes(payload.status)) {
    return false;
  }

  const copy = STATUS_EMAIL_COPY[payload.status];
  if (!copy) return false;

  return sendEmail({
    to: payload.customerEmail,
    subject: `Order ${payload.orderNumber} ${copy.subjectSuffix} — The Cell Time`,
    text: buildStatusEmailText(payload),
    html: buildStatusEmailHtml(payload),
  });
}
