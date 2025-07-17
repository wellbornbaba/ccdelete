export interface FaceDetectionResult {
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  leftEyeOpenProbability?: number;
  rightEyeOpenProbability?: number;
  smilingProbability?: number;
  headEulerAngleY?: number;
  headEulerAngleX?: number;
  headEulerAngleZ?: number;
}

export interface FaceCaptureStep {
  id: string;
  title: string;
  instruction: string;
  completed: boolean;
  validation: (face: FaceDetectionResult) => boolean;
}

export interface FaceCaptureState {
  currentStep: number;
  isCapturing: boolean;
  countdown: number | null;
  capturedImage: string | null;
  error: string | null;
}

export interface FaceGuideBoxProps {
  isAligned: boolean;
  face?: FaceDetectionResult;
}

export interface CaptureProgressProps {
  steps: FaceCaptureStep[];
  currentStep: number;
}