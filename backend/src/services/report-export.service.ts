import type { PerformanceReportDto, PerformanceReportEmployeeDto } from "@/types/api.types";

export function buildPerformanceReportExcel(report: PerformanceReportDto) {
  const rows = [
    ["Employee", "Email", "Target", "Sent", "Remaining", "Completion", "Status", "Gmail", "Domain", "Mask"],
    ...report.employees.map((employee) => [
      employee.name,
      employee.email,
      employee.monthTarget,
      employee.totalSent,
      employee.remainingTarget,
      `${employee.completionRate}%`,
      employee.isTargetMet ? "Target met" : "Behind",
      employee.senderTotals.gmail,
      employee.senderTotals.domain,
      employee.senderTotals.mask,
    ]),
    [],
    ["Daily Activity"],
    ["Employee", "Date", "Total", "Gmail", "Domain", "Mask"],
    ...report.employees.flatMap((employee) =>
      employee.daily.map((day) => [
        employee.name,
        day.date,
        day.total,
        day.gmail,
        day.domain,
        day.mask,
      ]),
    ),
  ];

  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><h1>Employee Performance Report</h1><p>${escapeHtml(report.monthLabel)}</p><table border="1">${rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>`)
    .join("")}</table></body></html>`;

  return Buffer.from(html, "utf8");
}

export function buildPerformanceReportPdf(report: PerformanceReportDto) {
  const lines = [
    "Employee Performance Report",
    report.monthLabel,
    "",
    `Total sent: ${report.summary.totalSent}`,
    `Target met: ${report.summary.targetMetEmployees}`,
    `Behind target: ${report.summary.behindTargetEmployees}`,
    "",
    "Employees",
    ...report.employees.flatMap((employee) => employeePdfLines(employee)),
  ];

  return createPdf(lines);
}

function employeePdfLines(employee: PerformanceReportEmployeeDto) {
  return [
    `${employee.name} <${employee.email}>`,
    `Target ${employee.monthTarget} | Sent ${employee.totalSent} | Remaining ${employee.remainingTarget} | Completion ${employee.completionRate}% | ${employee.isTargetMet ? "Target met" : "Behind"}`,
    `Gmail ${employee.senderTotals.gmail} | Domain ${employee.senderTotals.domain} | Mask ${employee.senderTotals.mask}`,
    ...employee.daily
      .filter((day) => day.total > 0)
      .map((day) => `${day.date}: total ${day.total}, gmail ${day.gmail}, domain ${day.domain}, mask ${day.mask}`),
    "",
  ];
}

function createPdf(lines: string[]) {
  const objects: string[] = [];
  const pages: string[] = [];
  const pageChunks = chunkLines(lines, 44);

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");

  for (const chunk of pageChunks) {
    const pageObjectId = objects.length + 1;
    const contentObjectId = pageObjectId + 1;
    pages.push(`${pageObjectId} 0 R`);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${pageChunks.length * 2 + 3} 0 R >> >> /Contents ${contentObjectId} 0 R >>`);
    const stream = buildPdfStream(chunk);
    objects.push(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
  }

  objects[1] = `<< /Type /Pages /Kids [${pages.join(" ")}] /Count ${pages.length} >>`;
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

function buildPdfStream(lines: string[]) {
  return [
    "BT",
    "/F1 10 Tf",
    "50 742 Td",
    ...lines.flatMap((line, index) => [
      index === 0 ? "" : "0 -15 Td",
      `(${escapePdfText(line.slice(0, 112))}) Tj`,
    ]),
    "ET",
  ]
    .filter(Boolean)
    .join("\n");
}

function chunkLines(lines: string[], size: number) {
  const chunks: string[][] = [];

  for (let index = 0; index < lines.length; index += size) {
    chunks.push(lines.slice(index, index + size));
  }

  return chunks.length ? chunks : [["No report data available."]];
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}
