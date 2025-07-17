import { View, Text, ScrollView, Alert, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import React, { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import TitleHeader from '@/components/ui/Header';
import { useThemeStore } from '@/store/useThemeStore';
import { Button } from '@/components/ui/Button';

const Privacy = ({onAccept}: {
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
      <TitleHeader onBack={true} title="Privacy & Policy" />

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

        <Text className="text-base font-semibold text-bgDefault mb-2">1. Purpose</Text>
        <Text style={{color: colors.gray}} className="text-sm  mb-4">
          The Co-Rider feature enables users to share rides with others heading in the same direction to reduce transportation costs and environmental impact.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">2. Eligibility</Text>
        <Text style={{color: colors.gray}} className="text-sm  mb-4">
          Users must be 18 years or older to participate as a co-rider. A verified profile with accurate personal information is required.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">3. Ride Matching</Text>
        <Text style={{color: colors.gray}} className="text-sm  mb-4">
          Our algorithm matches co-riders based on pickup location, destination, and timing. Riders may be matched with different individuals on each trip.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">4. Payment Sharing</Text>
        <Text style={{color: colors.gray}} className="text-sm  mb-4">
          The fare is automatically split among co-riders. Each user is responsible for paying their portion at the time of booking.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">5. Behavior Expectations</Text>
        <Text style={{color: colors.gray}} className="text-sm  mb-4">
          All co-riders are expected to behave respectfully, maintain hygiene, and avoid disruptive behavior. Discrimination, harassment, or violence will result in a permanent ban.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">6. Safety</Text>
        <Text style={{color: colors.gray}} className="text-sm  mb-4">
          All rides are tracked in real-time. Emergency support is available within the app. Riders are advised not to share personal details unnecessarily.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">7. Cancellations</Text>
        <Text style={{color: colors.gray}} className="text-sm  mb-4">
          Co-riders who cancel within 10 minutes of pickup or repeatedly cancel may incur a penalty fee or temporary suspension.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">8. Liability Disclaimer</Text>
        <Text style={{color: colors.gray}} className="text-sm  mb-4">
          The platform facilitates ride sharing but is not liable for personal belongings, interactions, or disputes between co-riders. Riders participate at their own risk.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">9. Data Use</Text>
        <Text style={{color: colors.gray}} className="text-sm  mb-4">
          User data is collected to match rides and ensure safety. Data is not shared with third parties outside of operational requirements.
        </Text>

        <Text className="text-base font-semibold text-bgDefault mb-2">10. Changes to This Policy</Text>
        <Text style={{color: colors.gray}} className="text-sm  mb-4">
          This policy may be updated at any time. Users will be notified of significant changes. Continued use of the Co-Rider feature constitutes acceptance of the updated policy.
        </Text>

        <Text style={{color: colors.gray}} className="text-sm  mt-6">
          By using the Co-Rider feature, you agree to follow this policy. We reserve the right to restrict access for users who violate any part of this agreement.
        </Text>
        </ScrollView>

        <Button 
        title={hasScrolledToBottom ? "Accept & Continue" : "Scroll & read to Accept"}
        onPress={() => {
          Alert.alert('Policy Accepted');
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

export default Privacy;
