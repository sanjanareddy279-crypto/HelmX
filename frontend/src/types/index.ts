export type PageId = 'dashboard' | 'live' | 'upload' | 'history' | 'settings';

export type ComplianceStatus = 'safe' | 'warning' | 'danger';

export type InputType = 'webcam' | 'image' | 'video';

export interface DetectionRecord {
  id: string;
  timestamp: string;
  inputType: InputType;
  helmetCount: number;
  noHelmetCount: number;
  compliance: number;
  status: ComplianceStatus;
  source?: string;
}

export interface DetectionResult {
  helmetCount: number;
  noHelmetCount: number;
  confidence: number;
  violations: boolean;
  boxes?: DetectionBox[];
  annotatedUrl?: string;
}

export interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export interface Statistics {
  totalDetected: number;
  helmetCount: number;
  noHelmetCount: number;
  compliance: number;
  totalSessions: number;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface HealthStatus {
  api: 'online' | 'offline' | 'unknown';
  model: 'online' | 'offline' | 'unknown';
  modelLoaded: boolean;
  version: string;
}
