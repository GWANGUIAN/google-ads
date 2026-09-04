/** The QR content-type matrix — one entry per generator page, each with its
 * own input fields and payload encoder. Mirrors the format-pair /
 * operation-matrix pattern used by img-convertor/video-tools/font-tools (see
 * docs/NEW_SITE_PLAYBOOK.md §4): pages are generated from this data module
 * via getStaticPaths(), not hand-authored per page. */

export type QrTypeCode =
  | "url"
  | "wifi"
  | "vcard"
  | "email"
  | "sms"
  | "phone"
  | "text"
  | "event"
  | "geo"
  | "whatsapp"
  | "app";

export type QrFieldType = "text" | "textarea" | "url" | "tel" | "email" | "select" | "datetime-local";

export interface QrFieldDef {
  key: string;
  label: string;
  type: QrFieldType;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface QrTypeInfo {
  code: QrTypeCode;
  slug: string;
  /** Used in headings, e.g. "WiFi QR code". */
  label: string;
  /** Used in short nav/footer links, e.g. "WiFi". */
  shortLabel: string;
  description: string;
  fields: QrFieldDef[];
  example: Record<string, string>;
  buildPayload: (values: Record<string, string>) => string;
}

/** Escapes `;`, `,`, `:`, and `\` per the WIFI: / MECARD-style special
 * character rules shared by most QR payload mini-formats. */
function escapeQrSpecial(value: string): string {
  return value.replace(/([\\;,:])/g, "\\$1");
}

function toIcsDate(value: string): string {
  // datetime-local gives "YYYY-MM-DDTHH:mm" — iCalendar wants "YYYYMMDDTHHmmss".
  const digits = value.replace(/[-:]/g, "");
  return digits.length === 13 ? `${digits}00` : digits;
}

export const QR_TYPES: Record<QrTypeCode, QrTypeInfo> = {
  url: {
    code: "url",
    slug: "url-qr-code",
    label: "URL",
    shortLabel: "URL",
    description:
      "Encode any web address so scanning the code opens it directly — the most common use for a QR code, from posters and packaging to business cards.",
    fields: [{ key: "url", label: "URL", type: "url", placeholder: "https://example.com", required: true }],
    example: { url: "https://loomfile.com" },
    buildPayload: (v) => v.url ?? "",
  },
  wifi: {
    code: "wifi",
    slug: "wifi-qr-code",
    label: "WiFi network",
    shortLabel: "WiFi",
    description:
      "Encode a network name and password so scanning the code connects a phone to WiFi automatically — no typing a password out loud or over a printed card.",
    fields: [
      { key: "ssid", label: "Network name (SSID)", type: "text", placeholder: "My WiFi", required: true },
      { key: "password", label: "Password", type: "text", placeholder: "••••••••" },
      {
        key: "encryption",
        label: "Encryption",
        type: "select",
        options: [
          { value: "WPA", label: "WPA/WPA2/WPA3" },
          { value: "WEP", label: "WEP" },
          { value: "nopass", label: "None (open network)" },
        ],
      },
      {
        key: "hidden",
        label: "Hidden network",
        type: "select",
        options: [
          { value: "false", label: "No" },
          { value: "true", label: "Yes" },
        ],
      },
    ],
    example: { ssid: "My WiFi", password: "correcthorse", encryption: "WPA", hidden: "false" },
    buildPayload: (v) => {
      const enc = v.encryption || "WPA";
      const ssid = escapeQrSpecial(v.ssid ?? "");
      const password = enc === "nopass" ? "" : escapeQrSpecial(v.password ?? "");
      const hidden = v.hidden === "true" ? "H:true;" : "";
      return `WIFI:T:${enc};S:${ssid};P:${password};${hidden}`;
    },
  },
  vcard: {
    code: "vcard",
    slug: "vcard-qr-code",
    label: "Contact card (vCard)",
    shortLabel: "vCard",
    description:
      "Encode a full contact card — name, phone, email, company — so scanning the code offers to save it straight to the recipient's contacts app.",
    fields: [
      { key: "name", label: "Full name", type: "text", placeholder: "Jane Doe", required: true },
      { key: "org", label: "Company", type: "text", placeholder: "Acme Inc." },
      { key: "phone", label: "Phone", type: "tel", placeholder: "+1 555 123 4567" },
      { key: "email", label: "Email", type: "email", placeholder: "jane@example.com" },
      { key: "url", label: "Website", type: "url", placeholder: "https://example.com" },
    ],
    example: { name: "Jane Doe", org: "Acme Inc.", phone: "+15551234567", email: "jane@example.com", url: "" },
    buildPayload: (v) => {
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:;${v.name ?? ""};;;`,
        `FN:${v.name ?? ""}`,
        v.org ? `ORG:${v.org}` : "",
        v.phone ? `TEL:${v.phone}` : "",
        v.email ? `EMAIL:${v.email}` : "",
        v.url ? `URL:${v.url}` : "",
        "END:VCARD",
      ];
      return lines.filter(Boolean).join("\n");
    },
  },
  email: {
    code: "email",
    slug: "email-qr-code",
    label: "Email",
    shortLabel: "Email",
    description:
      "Encode a pre-filled email — address, subject, and body — so scanning the code opens the recipient's mail app with everything ready to send.",
    fields: [
      { key: "to", label: "To", type: "email", placeholder: "hello@example.com", required: true },
      { key: "subject", label: "Subject", type: "text", placeholder: "" },
      { key: "body", label: "Message", type: "textarea", placeholder: "" },
    ],
    example: { to: "hello@example.com", subject: "Hello", body: "" },
    buildPayload: (v) => {
      const params = new URLSearchParams();
      if (v.subject) params.set("subject", v.subject);
      if (v.body) params.set("body", v.body);
      const query = params.toString();
      return `mailto:${v.to ?? ""}${query ? `?${query}` : ""}`;
    },
  },
  sms: {
    code: "sms",
    slug: "sms-qr-code",
    label: "SMS text message",
    shortLabel: "SMS",
    description:
      "Encode a phone number and pre-filled text so scanning the code opens the messaging app ready to send — handy for RSVPs, support lines, or opt-ins.",
    fields: [
      { key: "phone", label: "Phone number", type: "tel", placeholder: "+1 555 123 4567", required: true },
      { key: "message", label: "Message", type: "textarea", placeholder: "" },
    ],
    example: { phone: "+15551234567", message: "" },
    buildPayload: (v) => `SMSTO:${v.phone ?? ""}:${v.message ?? ""}`,
  },
  phone: {
    code: "phone",
    slug: "phone-number-qr-code",
    label: "Phone number",
    shortLabel: "Phone",
    description: "Encode a phone number so scanning the code starts a call immediately — useful on posters, vehicles, or storefronts.",
    fields: [{ key: "phone", label: "Phone number", type: "tel", placeholder: "+1 555 123 4567", required: true }],
    example: { phone: "+15551234567" },
    buildPayload: (v) => `tel:${v.phone ?? ""}`,
  },
  text: {
    code: "text",
    slug: "text-qr-code",
    label: "Plain text",
    shortLabel: "Text",
    description: "Encode any block of plain text so scanning the code displays it directly — notes, instructions, serial numbers, or a short message.",
    fields: [{ key: "text", label: "Text", type: "textarea", placeholder: "Anything you like", required: true }],
    example: { text: "Hello, world!" },
    buildPayload: (v) => v.text ?? "",
  },
  event: {
    code: "event",
    slug: "event-qr-code",
    label: "Calendar event",
    shortLabel: "Event",
    description:
      "Encode a calendar event — title, time, and location — so scanning the code offers to add it straight to the recipient's calendar app.",
    fields: [
      { key: "title", label: "Event title", type: "text", placeholder: "Team meeting", required: true },
      { key: "location", label: "Location", type: "text", placeholder: "" },
      { key: "start", label: "Starts", type: "datetime-local", required: true },
      { key: "end", label: "Ends", type: "datetime-local" },
    ],
    example: { title: "Team meeting", location: "", start: "", end: "" },
    buildPayload: (v) => {
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `SUMMARY:${v.title ?? ""}`,
        v.location ? `LOCATION:${v.location}` : "",
        v.start ? `DTSTART:${toIcsDate(v.start)}` : "",
        v.end ? `DTEND:${toIcsDate(v.end)}` : "",
        "END:VEVENT",
        "END:VCALENDAR",
      ];
      return lines.filter(Boolean).join("\n");
    },
  },
  geo: {
    code: "geo",
    slug: "location-qr-code",
    label: "Location (GPS)",
    shortLabel: "Location",
    description: "Encode GPS coordinates so scanning the code opens the recipient's maps app centered on that exact spot.",
    fields: [
      { key: "lat", label: "Latitude", type: "text", placeholder: "37.7749", required: true },
      { key: "lng", label: "Longitude", type: "text", placeholder: "-122.4194", required: true },
    ],
    example: { lat: "37.7749", lng: "-122.4194" },
    buildPayload: (v) => `geo:${v.lat ?? "0"},${v.lng ?? "0"}`,
  },
  whatsapp: {
    code: "whatsapp",
    slug: "whatsapp-qr-code",
    label: "WhatsApp chat",
    shortLabel: "WhatsApp",
    description: "Encode a WhatsApp number and pre-filled message so scanning the code opens a chat ready to send — a common storefront and support pattern.",
    fields: [
      { key: "phone", label: "Phone number (with country code)", type: "tel", placeholder: "15551234567", required: true },
      { key: "message", label: "Pre-filled message", type: "textarea", placeholder: "" },
    ],
    example: { phone: "15551234567", message: "" },
    buildPayload: (v) => {
      const digits = (v.phone ?? "").replace(/[^\d]/g, "");
      const params = v.message ? `?text=${encodeURIComponent(v.message)}` : "";
      return `https://wa.me/${digits}${params}`;
    },
  },
  app: {
    code: "app",
    slug: "app-store-qr-code",
    label: "App download link",
    shortLabel: "App",
    description:
      "Encode a link to your app's App Store or Google Play listing so scanning the code takes people straight to the download page.",
    fields: [{ key: "url", label: "App Store / Play Store URL", type: "url", placeholder: "https://apps.apple.com/...", required: true }],
    example: { url: "https://apps.apple.com/app/id0000000000" },
    buildPayload: (v) => v.url ?? "",
  },
};

export const QR_TYPE_LIST = Object.values(QR_TYPES);

export function getQrTypeBySlug(slug: string): QrTypeInfo | undefined {
  return QR_TYPE_LIST.find((t) => t.slug === slug);
}
