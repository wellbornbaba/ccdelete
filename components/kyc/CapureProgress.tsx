import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolateColor,
  useDerivedValue
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { CaptureProgressProps } from '@/types/face-detection';

export const CaptureProgress: React.FC<CaptureProgressProps> = ({ steps, currentStep }) => {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withSpring(currentStep / (steps.length - 1), {
      damping: 15,
      stiffness: 100,
    });
  }, [currentStep]);

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  const currentStepData = steps[currentStep];

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, progressBarStyle]} />
      </View>
      
      {/* Step indicator */}
      <Text style={styles.stepCounter}>
        Step {currentStep + 1} of {steps.length}
      </Text>
      
      {/* Current instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>
          {currentStepData?.title}
        </Text>
        <Text style={styles.instructionText}>
          {currentStepData?.instruction}
        </Text>
      </View>
      
      {/* Steps list */}
      <View style={styles.stepsList}>
        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepItem}>
            <View style={[
              styles.stepIcon,
              {
                backgroundColor: step.completed 
                  ? '#10B981' 
                  : index === currentStep 
                    ? '#3B82F6' 
                    : '#E5E7EB'
              }
            ]}>
              {step.completed ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  { color: index === currentStep ? 'white' : '#6B7280' }
                ]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[
              styles.stepTitle,
              {
                color: step.completed 
                  ? '#10B981' 
                  : index === currentStep 
                    ? '#3B82F6' 
                    : '#6B7280'
              }
            ]}>
              {step.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
    borderRadius: 16,
    margin: 16,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  stepCounter: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionContainer: {
    marginBottom: 20,
  },
  instructionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  stepsList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  stepItem: {
    alignItems: 'center',
    marginBottom: 8,
    width: '30%',
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});