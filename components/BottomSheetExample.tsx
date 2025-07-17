import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/useThemeStore';
import { Button } from './ui/Button';
import CustomBottomSheet from './ui/CustomBottomSheet';
// import CustomBottomSheet from './CustomBottomSheet';

const BottomSheetExample = () => {
  const { colors } = useThemeStore();
  const [isVisible, setIsVisible] = useState(false);
  const [currentSnapPoint, setCurrentSnapPoint] = useState(0);

  const handleSnapPointChange = (index: number) => {
    setCurrentSnapPoint(index);
    console.log('Snap point changed to:', index);
  };

  const sampleContent = (
    <View style={[styles.content, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Bottom Sheet Content
      </Text>
      <Text style={[styles.subtitle, { color: colors.text + '80' }]}>
        Current snap point: {currentSnapPoint}
      </Text>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Features:
        </Text>
        <Text style={[styles.feature, { color: colors.text + '80' }]}>
          • Multiple snap points (50%, 90%)
        </Text>
        <Text style={[styles.feature, { color: colors.text + '80' }]}>
          • Pan gesture support
        </Text>
        <Text style={[styles.feature, { color: colors.text + '80' }]}>
          • Backdrop dismiss
        </Text>
        <Text style={[styles.feature, { color: colors.text + '80' }]}>
          • Smooth animations
        </Text>
        <Text style={[styles.feature, { color: colors.text + '80' }]}>
          • Scroll view integration
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Sample Content
        </Text>
        {Array.from({ length: 20 }, (_, i) => (
          <Text key={i} style={[styles.listItem, { color: colors.text + '60' }]}>
            List item {i + 1} - This is scrollable content
          </Text>
        ))}
      </View>

      <Button
        title="Close Bottom Sheet"
        onPress={() => setIsVisible(false)}
        variant="outline"
        classStyle="mt-4 mx-4"
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Advanced Bottom Sheet Demo
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.text + '80' }]}>
          Tap the button below to open the bottom sheet
        </Text>
      </View>

      <Button
        title="Open Bottom Sheet"
        onPress={() => setIsVisible(true)}
        classStyle="mx-4"
      />

      <CustomBottomSheet
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        snapPoints={[50, 90]}
        initialSnapPoint={0}
        enablePanGesture={true}
        enableBackdropDismiss={true}
        enableScrollView={true}
        showHandle={true}
        onSnapPointChange={handleSnapPointChange}
        borderRadius={20}
        backdropOpacity={0.5}
        // enableScrowView={true}
      >
        {sampleContent}
      </CustomBottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  feature: {
    fontSize: 14,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});

export default BottomSheetExample;