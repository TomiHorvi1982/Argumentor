export enum ThreatLevel {
  LOW = "NÍZKÉ",
  MEDIUM = "STŘEDNÍ",
  HIGH = "VYSOKÉ"
}

export interface AnalysisResult {
  threatLevel: ThreatLevel | string;
  threatDetails: string;
  manipulationTechniques: string[];
  grayRockResponse: string;
  advice: string;
  detectedEmotions: string[];
  safeToReply: boolean;
}

export interface CommunicationLog {
  id: string;
  timestamp: string;
  originalMessage: string;
  analysis: AnalysisResult;
  userNotes?: string;
}

export interface SafeTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  templateText: string;
  placeholders: string[];
}

export interface SecurityConfig {
  encryptionEnabled: boolean;
  hashedPin: string; // Stored as a hashed representation for local lock
  isLocked: boolean;
}
