import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '@/store/useThemeStore';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  completedSteps?: boolean[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepLabels = [],
  completedSteps = [],
}: ProgressIndicatorProps) {
  const { colors } = useThemeStore();

  const getStepStatus = (step: number) => {
    if (completedSteps[step - 1]) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'current':
        return colors.primary;
      default:
        return colors.gray;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const status = getStepStatus(step);
          const stepColor = getStepColor(status);
          const isLast = step === totalSteps;

          return (
            <View key={step} style={styles.stepContainer}>
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: stepColor,
                      borderColor: stepColor,
                    },
                  ]}
                >
                  {status === 'completed' ? (
                    <Ionicons name="checkmark" size={16} color="white" />
                  ) : (
                    <Text style={[styles.stepNumber, { color: 'white' }]}>
                      {step}
                    </Text>
                  )}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.stepLine,
                      {
                        backgroundColor:
                          completedSteps[step - 1] || step < currentStep
                            ? colors.success
                            : colors.border,
                      },
                    ]}
                  />
                )}
              </View>
              {stepLabels[index] && (
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: status === 'pending' ? colors.gray : colors.text,
                      fontWeight: status === 'current' ? '600' : '400',
                    },
                  ]}
                >
                  {stepLabels[index]}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginLeft: 8,
  },
  stepLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});