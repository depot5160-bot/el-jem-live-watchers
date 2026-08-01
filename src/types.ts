export type OutageType = 'eau' | 'elec' | 'net';

export type ISPType = 'Tunisie Telecom' | 'Orange Tunisie' | 'Ooredoo Tunisie' | 'Bee / Topnet / GNet';

export type ReportStatus = 'pending' | 'approved' | 'rejected';

export interface OutageReport {
  id: string;
  type: OutageType;
  isp?: ISPType | null;
  sector?: string;            // Neighborhood / Sector ID or name
  note?: string;
  lat: number;
  lng: number;
  createdAt: number;
  status: ReportStatus;
  approvedAt?: number;
  reporterSessionId?: string; // Captured IP / Session hash
  restored?: boolean;         // True if service restored
  restoredAt?: number;       // Timestamp when service was marked restored
}

export type Language = 'fr' | 'ar';
