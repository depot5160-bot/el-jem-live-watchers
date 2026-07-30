import { OutageReport, OutageType, ReportStatus } from '../types';
import { ARCHIVE_WEBHOOK_URL, EXPIRY_HOURS, INITIAL_SAMPLE_REPORTS } from '../constants';

const KEY = "eljem_reports_v2";

export function logToSheet(action: string, report: Partial<OutageReport>) {
  if (!ARCHIVE_WEBHOOK_URL) return;
  try {
    fetch(ARCHIVE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...report })
    }).catch(() => {});
  } catch {
    // Silent fail so client flow is never blocked
  }
}

export function readReports(): OutageReport[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(INITIAL_SAMPLE_REPORTS));
      return INITIAL_SAMPLE_REPORTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SAMPLE_REPORTS;
  } catch {
    return INITIAL_SAMPLE_REPORTS;
  }
}

export function writeReports(list: OutageReport[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function getApprovedReports(): OutageReport[] {
  const now = Date.now();
  const list = readReports();
  return list.filter(r => 
    r.status === "approved" && (now - (r.approvedAt || r.createdAt)) < EXPIRY_HOURS * 3600 * 1000
  ).sort((a, b) => (b.approvedAt || b.createdAt) - (a.approvedAt || a.createdAt));
}

export function getPendingReports(): OutageReport[] {
  const now = Date.now();
  const list = readReports();
  return list.filter(r => 
    r.status === "pending" && (now - r.createdAt) < EXPIRY_HOURS * 3600 * 1000
  ).sort((a, b) => b.createdAt - a.createdAt);
}

export function getApprovedAllReports(): OutageReport[] {
  return readReports()
    .filter(r => r.status === "approved")
    .sort((a, b) => (b.approvedAt || b.createdAt) - (a.approvedAt || a.createdAt));
}

export function getPendingAllReports(): OutageReport[] {
  return readReports()
    .filter(r => r.status === "pending")
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function submitReport(data: Omit<OutageReport, 'id' | 'createdAt' | 'status'>): Promise<OutageReport> {
  const list = readReports();
  const report: OutageReport = {
    ...data,
    id: "r_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    status: "pending",
    createdAt: Date.now()
  };
  list.push(report);
  writeReports(list);
  logToSheet("submit", report);
  return report;
}

export function setReportStatus(id: string, status: ReportStatus) {
  const list = readReports();
  const idx = list.findIndex(r => r.id === id);
  if (idx > -1) {
    list[idx].status = status;
    if (status === "approved") list[idx].approvedAt = Date.now();
    writeReports(list);
    logToSheet(status, list[idx]);
  }
}

export function updateReportType(id: string, newType: OutageType) {
  const list = readReports();
  const idx = list.findIndex(r => r.id === id);
  if (idx > -1) {
    list[idx].type = newType;
    if (newType !== 'net') list[idx].isp = null;
    writeReports(list);
    logToSheet("update_type", list[idx]);
  }
}

export function setReportRestored(id: string) {
  const list = readReports();
  const idx = list.findIndex(r => r.id === id);
  if (idx > -1) {
    list[idx].restored = true;
    list[idx].restoredAt = Date.now();
    writeReports(list);
    logToSheet("restored", list[idx]);
  }
}

export function removeReport(id: string) {
  const list = readReports();
  const filtered = list.filter(r => r.id !== id);
  writeReports(filtered);
  logToSheet("delete", { id });
}

export async function syncFromServer(): Promise<void> {
  if (!ARCHIVE_WEBHOOK_URL) return;
  try {
    const res = await fetch(ARCHIVE_WEBHOOK_URL, { method: "GET" });
    if (!res.ok) return;
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.reports)) return;

    const localById = new Map(readReports().map(r => [r.id, r]));
    const serverIds = new Set<string>();

    data.reports.forEach((row: any) => {
      if (!row.id) return;
      serverIds.add(row.id);
      const createdAt = row.createdAt ? new Date(row.createdAt).getTime() : Date.now();
      const receivedAt = row.receivedAt ? new Date(row.receivedAt).getTime() : Date.now();
      localById.set(row.id, {
        id: row.id,
        type: row.type,
        isp: row.isp || null,
        note: row.note || "",
        lat: Number(row.lat),
        lng: Number(row.lng),
        createdAt: isNaN(createdAt) ? Date.now() : createdAt,
        status: row.status,
        approvedAt: row.status === "approved" ? (isNaN(receivedAt) ? Date.now() : receivedAt) : undefined
      });
    });

    const merged = Array.from(localById.values()).filter(r =>
      serverIds.has(r.id) || (Date.now() - r.createdAt) < 60000
    );
    writeReports(merged);
  } catch {
    // Offline or worker error, keep current local cache
  }
}
