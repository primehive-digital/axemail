"use client";

import type { BotPerformanceReport } from "@/components/pages/analytics/activity-insights/bot-activity-insights-data";

function escapeCsvValue(value: string) {
  return `"${value.replaceAll("\"", "\"\"")}"`;
}

function escapeHtmlValue(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function getMailerRatio(report: BotPerformanceReport, bot: BotPerformanceReport["bots"][number], mailer: "gmail" | "domain" | "mask") {
  return `${bot.mailerTotals[mailer]}/${bot.mailerTargets[mailer] * report.range.daysTracked}`;
}

function buildBotReportCsv(report: BotPerformanceReport) {
  const rows = [
    ["Bot", "Pseudo Name", "Target", "Sent", "Sent %", "Gmail", "Domain", "Mask"],
    ...report.bots.map((bot) => [
      bot.name,
      bot.pseudoName,
      String(bot.monthTarget),
      String(bot.totalSent),
      `${bot.completionRate}%`,
      getMailerRatio(report, bot, "gmail"),
      getMailerRatio(report, bot, "domain"),
      getMailerRatio(report, bot, "mask"),
    ]),
  ];

  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

function downloadBotCsv(report: BotPerformanceReport) {
  const blob = new Blob([buildBotReportCsv(report)], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bot-performance-report.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function printBotReport(report: BotPerformanceReport) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");

  if (!printWindow) {
    throw new Error("Unable to open print window.");
  }

  const rows = report.bots
    .map(
      (bot) => `
        <tr>
          <td>${escapeHtmlValue(bot.name)}</td>
          <td>${escapeHtmlValue(bot.pseudoName)}</td>
          <td>${bot.monthTarget}</td>
          <td>${bot.totalSent}</td>
          <td>${bot.completionRate}%</td>
          <td>${escapeHtmlValue(getMailerRatio(report, bot, "gmail"))}</td>
          <td>${escapeHtmlValue(getMailerRatio(report, bot, "domain"))}</td>
          <td>${escapeHtmlValue(getMailerRatio(report, bot, "mask"))}</td>
        </tr>
      `,
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Bot Performance Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          h1 { font-size: 20px; margin: 0 0 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h1>Bot Performance Report</h1>
        <table>
          <thead>
            <tr>
              <th>Bot</th>
              <th>Pseudo Name</th>
              <th>Target</th>
              <th>Sent</th>
              <th>Sent %</th>
              <th>Gmail</th>
              <th>Domain</th>
              <th>Mask</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

export function downloadBotPerformanceReport(report: BotPerformanceReport, format: "excel" | "pdf") {
  if (format === "excel") {
    downloadBotCsv(report);
    return;
  }

  printBotReport(report);
}
