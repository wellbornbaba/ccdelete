import { View, Text, ScrollView, Alert, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import React, { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import TitleHeader from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { Button } from '@/components/ui/Button';

const Terms = ({onAccept}: {
    onAccept?: () => void
}) => {
  const { colors } = useThemeStore();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isBottom) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <TitleHeader onBack={true} title="Terms & Conditions" />

      <View
        style={{ backgroundColor: colors.background }}
        className={`flex-1 px-2 py-3`}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={20}
        >

        <Text className="text-base font-semibold text-bgDefault mb-2">1. Shared Responsibility</Text>
        <Text style={{color: colors.gray}} className="text-sm mb-4">
          All co-riders must agree to share the fare equally as agreed upon during booking. Any failure to pay your share may result in being banned from the service.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">2. Conduct</Text>
        <Text style={{color: colors.gray}} className="text-sm mb-4">
          Riders are expected to behave respectfully and safely. No harassment, smoking, or illegal activities are allowed during the ride.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">3. Cancellation Policy</Text>
        <Text style={{color: colors.gray}} className="text-sm mb-4">
          Cancellations within 10 minutes of the scheduled pickup time may result in a penalty fee.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">4. Liability</Text>
        <Text style={{color: colors.gray}} className="text-sm mb-4">
          The platform is not liable for personal losses, accidents, or disputes between co-riders. Ride at your own risk.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">5. Privacy & Data</Text>
        <Text style={{color: colors.gray}} className="text-sm mb-4">
          Your location, name, and contact number may be shared with the driver and co-riders only for the duration of the trip.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">6. Ride Matching</Text>
        <Text style={{color: colors.gray}} className="text-sm mb-4">
          Ride matching is done based on destination and time proximity. You may not always be matched with the same rider(s).
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">7. Changes & Updates</Text>
        <Text style={{color: colors.gray}} className="text-sm mb-4">
          These terms are subject to change without prior notice. We encourage you to review them regularly.
        </Text>

        <Text style={{color: colors.gray}} className="text-sm">
          By tapping “Accept”, you agree to the terms above and acknowledge your responsibilities as a co-rider.
        </Text>
        </ScrollView>

        <Button 
        title={hasScrolledToBottom ? "Accept & Continue" : "Scroll & read to Accept"}
        onPress={() => {
          Alert.alert('Terms Accepted');
          onAccept && onAccept();
        }}
        classStyle="mb-2 px-4"
        // isLoading={hasScrolledToBottom ? ""}
        disabled={!hasScrolledToBottom}
        />
      </View>
    </SafeAreaView>
  );
};

export default Terms;
