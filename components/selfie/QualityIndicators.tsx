import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeAppStore } from '@/store/useThemeAppStore';
import { FaceQualityMetrics } from '@/types/faceDetection';

interface QualityIndicatorsProps {
  qualityMetrics: FaceQualityMetrics;
  faceDetected: boolean;
}

export function QualityIndicators({ qualityMetrics, faceDetected }: QualityIndicatorsProps) {
  const { colors } = useThemeAppStore();

  const getStatusColor = (value: number, threshold: number = 0.7): string => {
    if (value >= threshold) return '#4caf50'; // Green
    if (value >= threshold * 0.7) return '#ffa726'; // Orange
    return '#ff6b6b'; // Red
  };

  const getStatusIcon = (value: number, threshold: number = 0.7): string => {
    if (value >= threshold) return 'checkmark-circle';
    if (value >= threshold * 0.7) return 'warning';
    return 'close-circle';
  };

  const QualityItem = ({
    icon,
    label,
    value,
    threshold = 0.7,
    showPercentage = true,
  }: {
    icon: string;
    label: string;
    value: number;
    threshold?: number;
    showPercentage?: boolean;
  }) => (
    <View style={styles.qualityItem}>
      <View style={styles.qualityIcon}>
        <Ionicons
          name={icon as any}
          size={16}
          color={getStatusColor(value, threshold)}
        />
      </View>
      <Text style={[styles.qualityLabel, { color: colors.text }]}>
        {label}
      </Text>
      <View style={styles.qualityValue}>
        <Ionicons
          name={getStatusIcon(value, threshold) as any}
          size={16}
          color={getStatusColor(value, threshold)}
        />
        {showPercentage && (
          <Text style={[styles.qualityPercentage, { color: colors.textSecondary }]}>
            {Math.round(value * 100)}%
          </Text>
        )}
      </View>
    </View>
  );

  if (!faceDetected) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface + '90' }]}>
        <View style={styles.noFaceContainer}>
          <Ionicons name="person-outline" size={24} color={colors.textSecondary} />
          <Text style={[styles.noFaceText, { color: colors.textSecondary }]}>
            No face detected
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface + '90' }]}>
      <Text style={[styles.title, { color: colors.text }]}>Quality Check</Text>
      
      <QualityItem
        icon="sunny"
        label="Lighting"
        value={qualityMetrics.lighting}
        threshold={0.6}
      />
      
      <QualityItem
        icon="locate"
        label="Centering"
        value={qualityMetrics.centering}
        threshold={0.7}
      />
      
      <QualityItem
        icon="resize"
        label="Face Size"
        value={qualityMetrics.faceSize}
        threshold={0.5}
      />
      
      <QualityItem
        icon="camera"
        label="Sharpness"
        value={qualityMetrics.sharpness}
        threshold={0.6}
      />

      {/* Special indicators */}
      <View style={styles.specialIndicators}>
        {qualityMetrics.blinkDetected && (
          <View style={styles.specialIndicator}>
            <Ionicons name="eye-off" size={16} color="#ffa726" />
            <Text style={[styles.specialText, { color: colors.text }]}>
              Blink detected
            </Text>
          </View>
        )}
        
        {qualityMetrics.smileDetected && (
          <View style={styles.specialIndicator}>
            <Ionicons name="happy" size={16} color="#4caf50" />
            <Text style={[styles.specialText, { color: colors.text }]}>
              Smile detected ({Math.round(qualityMetrics.smileConfidence * 100)}%)
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 120,
    right: 20,
    padding: 12,
    borderRadius: 12,
    minWidth: 180,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  qualityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  qualityIcon: {
    width: 20,
    alignItems: 'center',
  },
  qualityLabel: {
    flex: 1,
    fontSize: 12,
    marginLeft: 8,
  },
  qualityValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qualityPercentage: {
    fontSize: 11,
    fontWeight: '500',
  },
  noFaceContainer: {
    alignItems: 'center',
    padding: 16,
  },
  noFaceText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  specialIndicators: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  specialIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  specialText: {
    fontSize: 11,
    marginLeft: 6,
  },
});