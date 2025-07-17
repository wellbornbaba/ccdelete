export interface FacePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  rotation: number;
}

export interface FaceQualityMetrics {
  lighting: number; // 0-1, higher is better
  centering: number; // 0-1, higher is better
  faceSize: number; // 0-1, higher is better
  sharpness: number; // 0-1, higher is better
  blinkDetected: boolean;
  smileDetected: boolean;
  smileConfidence: number; // 0-1
  eyeOpenProbability: number; // 0-1
  headPose: {
    yaw: number;
    pitch: number;
    roll: number;
  };
  overallQuality: number; // 0-1, computed score
}

export interface FaceDetectionResult {
  faceDetected: boolean;
  facePosition?: FacePosition;
  qualityMetrics: FaceQualityMetrics;
  landmarks?: FaceLandmark[];
  processingTime: number;
  frameId: string;
}

export interface FaceLandmark {
  type: 'leftEye' | 'rightEye' | 'nose' | 'mouth' | 'leftEar' | 'rightEar' | 'leftCheek' | 'rightCheek';
  x: number;
  y: number;
  confidence: number;
}

export interface CaptureSettings {
  qualityThreshold: number;
  autoUpload: boolean;
  compressionQuality: number;
  maxRetries: number;
  enableBiometrics: boolean;
  enableEncryption: boolean;
  captureTimeout: number;
  maxFileSize: number; // in MB
}

export interface SecurityAuditResult {
  score: number;
  recommendations: string[];
  vulnerabilities: string[];
  timestamp: number;
  deviceInfo: {
    isRooted: boolean;
    isEmulator: boolean;
    hasVPN: boolean;
    debuggingEnabled: boolean;
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
  estimatedTimeRemaining: number; // seconds
}

export interface CaptureSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  attempts: number;
  successfulCaptures: number;
  qualityScores: number[];
  averageProcessingTime: number;
}