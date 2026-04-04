/**
 * WhatsApp deep-link helpers.
 * Opens the WhatsApp app / web with a pre-filled message — zero cost, no API key needed.
 */

function normalizePhone(phone: string): string {
  // Strip everything except digits and leading +
  const cleaned = phone.replace(/[^\d+]/g, "");
  // If it starts with +, keep digits after that; otherwise assume local
  return cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = normalizePhone(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encoded}`;
}

export function buildReminderMessage(
  patientName: string,
  title: string,
  dueDate?: Date,
  note?: string,
  doctorName?: string,
): string {
  const lines: string[] = [
    `Hello ${patientName},`,
    "",
    `This is a reminder: *${title}*`,
  ];

  if (dueDate) {
    lines.push(
      `📅 Date: ${dueDate.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
    );
  }

  if (note) {
    lines.push(`📝 ${note}`);
  }

  lines.push("");

  if (doctorName) {
    lines.push(`— Dr. ${doctorName}`);
  }

  return lines.join("\n");
}

export function openWhatsAppReminder(opts: {
  phone: string;
  patientName: string;
  title: string;
  dueDate?: Date;
  note?: string;
  doctorName?: string;
}): void {
  const message = buildReminderMessage(
    opts.patientName,
    opts.title,
    opts.dueDate,
    opts.note,
    opts.doctorName,
  );
  const url = buildWhatsAppLink(opts.phone, message);
  window.open(url, "_blank", "noopener");
}
