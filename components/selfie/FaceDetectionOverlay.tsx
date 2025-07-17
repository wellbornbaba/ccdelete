import { FacePosition, FaceQualityMetrics } from '@/types/faceDetection';
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FaceDetectionOverlayProps {
  faceDetected: boolean;
  facePosition: FacePosition | null;
  qualityMetrics: FaceQualityMetrics;
}

export function FaceDetectionOverlay({
  faceDetected,
  facePosition,
  qualityMetrics,
}: FaceDetectionOverlayProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the circle
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  useEffect(() => {
    // Color animation based on quality
    const overallQuality = getOverallQuality(qualityMetrics);
    
    Animated.timing(colorAnim, {
      toValue: overallQuality,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [qualityMetrics]);

  const getOverallQuality = (metrics: FaceQualityMetrics): number => {
    return (metrics.lighting + metrics.centering + metrics.faceSize + metrics.sharpness) / 4;
  };

  const getCircleColor = (): string => {
    const quality = getOverallQuality(qualityMetrics);
    
    if (!faceDetected) return '#ff6b6b'; // Red when no face
    if (quality < 0.5) return '#ffa726'; // Orange for poor quality
    if (quality < 0.8) return '#ffeb3b'; // Yellow for medium quality
    return '#4caf50'; // Green for good quality
  };

  const circleRadius = 120;
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2 - 50;

  return (
    <View style={styles.overlay}>
      {/* Face guide circle */}
      <Animated.View
        style={[
          styles.circleContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Svg width={screenWidth} height={screenHeight} style={styles.svg}>
          {/* Overlay mask */}
          <Path
            d={`M0,0 L${screenWidth},0 L${screenWidth},${screenHeight} L0,${screenHeight} Z M${centerX - circleRadius},${centerY} A${circleRadius},${circleRadius} 0 1,0 ${centerX + circleRadius},${centerY} A${circleRadius},${circleRadius} 0 1,0 ${centerX - circleRadius},${centerY} Z`}
            fill="rgba(0, 0, 0, 0.6)"
            fillRule="evenodd"
          />
          
          {/* Guide circle */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={circleRadius}
            stroke={getCircleColor()}
            strokeWidth={4}
            fill="transparent"
            strokeDasharray={faceDetected ? "0" : "10,5"}
          />
          
          {/* Inner guide circle */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={circleRadius - 20}
            stroke={getCircleColor()}
            strokeWidth={2}
            fill="transparent"
            opacity={0.5}
          />
        </Svg>
      </Animated.View>

      {/* Face position indicator */}
      {faceDetected && facePosition && (
        <View
          style={[
            styles.faceIndicator,
            {
              left: facePosition.x,
              top: facePosition.y,
              width: facePosition.width,
              height: facePosition.height,
              borderColor: getCircleColor(),
            },
          ]}
        />
      )}

      {/* Quality indicators */}
      <View style={styles.qualityIndicators}>
        <QualityBar
          label="Lighting"
          value={qualityMetrics.lighting}
          color={getQualityColor(qualityMetrics.lighting)}
        />
        <QualityBar
          label="Centering"
          value={qualityMetrics.centering}
          color={getQualityColor(qualityMetrics.centering)}
        />
        <QualityBar
          label="Size"
          value={qualityMetrics.faceSize}
          color={getQualityColor(qualityMetrics.faceSize)}
        />
        <QualityBar
          label="Focus"
          value={qualityMetrics.sharpness}
          color={getQualityColor(qualityMetrics.sharpness)}
        />
      </View>
    </View>
  );
}

function QualityBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.qualityBar}>
      <View style={styles.qualityBarBackground}>
        <View
          style={[
            styles.qualityBarFill,
            {
              width: `${value * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function getQualityColor(value: number): string {
  if (value < 0.5) return '#ff6b6b';
  if (value < 0.8) return '#ffa726';
  return '#4caf50';
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  faceIndicator: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  qualityIndicators: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    gap: 8,
  },
  qualityBar: {
    height: 4,
  },
  qualityBarBackground: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  qualityBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});