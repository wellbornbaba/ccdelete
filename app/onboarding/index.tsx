import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Ionicons,
  AntDesign,
  FontAwesome6,
  Entypo,
  MaterialIcons,
} from '@expo/vector-icons';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getLocally, removeLocally, storeLocally } from '@/utils/fetch';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Onboarding data
const onboardingData = [
  {
    id: 1,
    title: 'Welcome to Co-Rider',
    subtitle:
      'Share rides, split fares, and make connections with fellow travelers',
    image: require('@/assets/images/onboard1.png'),
    features: [
      {
        icon: 'car',
        title: 'Find and Share Rides Easily',
        description: 'Connect with travelers heading your way',
      },
      {
        icon: 'wallet',
        title: 'Split Fares Automatically',
        description: 'No more awkward money talks',
      },
      {
        icon: 'shield-checkmark',
        title: 'Safe and Secure Rides',
        description: 'Travel with peace of mind',
      },
    ],
  },
  {
    id: 2,
    title: 'Smart Features',
    subtitle:
      'Discover powerful features designed to make your journey seamless',
    image: require('@/assets/images/welcome-removebg-preview2.png'),
    features: [
      {
        icon: 'route',
        title: 'Smart Route Planning',
        description:
          'Find the most efficient routes and match with riders going your way',
      },
      {
        icon: 'calculator',
        title: 'Fair Fare Splitting',
        description:
          'Automatically calculates and splits fares between riders including tips',
      },
      {
        icon: 'facebook-messenger',
        title: 'Group Chat',
        description:
          'Communicate easily with co-riders and coordinate pickup details',
      },
    ],
  },
  {
    id: 3,
    title: 'Safety First',
    subtitle: 'Your safety is our priority with multiple security features',
    image: require('@/assets/images/onboard1.png'),
    features: [
      {
        icon: 'verified-user',
        title: 'Verified Users',
        description:
          'All users are verified through a comprehensive verification process.',
      },
      {
        icon: 'user-check',
        title: 'Profile Reviews',
        description:
          'User ratings and reviews help maintain a trusted community.',
      },
      // {
      //   icon: 'bell',
      //   title: 'Real-time Alerts',
      //   description: 'Get instant notifications about your ride and co-riders.',
      // },
      {
        icon: 'lock',
        title: 'Secure Payments',
        description: 'All transactions are protected with bank-level security.',
      },
    ],
  },
];

export default function OnboardingSlider() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { user, isLoginAuth, setUser } = useAuthStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isScrollingProgrammatically = useRef(false);

  // Check if user has seen onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const hasSeen = await getLocally('hasSeenOnboarding');
      if (hasSeen) {
        if (user && isLoginAuth) return router.replace('/(root)/(tabs)');
        if (user && !isLoginAuth) return router.replace('/(auth)/login-lock');
        await storeLocally('user', null);
        setUser(null);
        return router.replace('/(auth)');
      }
    };
    checkOnboardingStatus();
  }, []);

  // Scroll to current index when it changes (programmatically)
  useEffect(() => {
    if (scrollViewRef.current) {
      isScrollingProgrammatically.current = true;
      scrollViewRef.current.scrollTo({
        x: currentIndex * screenWidth,
        animated: true,
      });
      
      // Reset the flag after a delay to allow the scroll animation to complete
      setTimeout(() => {
        isScrollingProgrammatically.current = false;
      }, 500);
    }
  }, [currentIndex]);

  const handleScroll = (event: any) => {
    // Only handle scroll events from user interaction, not programmatic scrolling
    if (isScrollingProgrammatically.current) {
      return;
    }

    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / screenWidth);
    
    if (index !== currentIndex && index >= 0 && index < onboardingData.length) {
      setCurrentIndex(index);
      setAutoPlay(false); // Stop autoplay when user manually scrolls
    }
  };

  const handleGetStarted = async () => {
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      await storeLocally('hasSeenOnboarding', true);
      router.push('/(auth)');
    });
  };

  const handleSkip = () => {
    setAutoPlay(false);
    handleGetStarted();
  };

  const handleNext = () => {
    setAutoPlay(false);
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handlePrevious = () => {
    setAutoPlay(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
  };

  const handleDotPress = (index: number) => {
    setAutoPlay(false);
    setCurrentIndex(index);
  };

  const renderFeatureIcon = (iconName: string) => {
    const iconProps = { size: 24, color: colors.primary };

    switch (iconName) {
      case 'car':
      case 'wallet':
      case 'shield-checkmark':
      case 'bell':
        return <Ionicons name={iconName as any} {...iconProps} />;
      case 'calculator':
      case 'lock':
        return <Entypo name={iconName as any} {...iconProps} />;
      case 'route':
      case 'verified-user':
        return <MaterialIcons name={iconName as any} {...iconProps} />;
      case 'facebook-messenger':
        return <MaterialIcons name="wechat" {...iconProps} />;
      case 'user-check':
        return <FontAwesome6 name="user-check" {...iconProps} />;
      default:
        return <Ionicons name="checkmark-circle" {...iconProps} />;
    }
  };

  const renderSlide = (item: (typeof onboardingData)[0], index: number) => (
    <View
      key={item.id}
      style={[styles.slideContainer, { width: screenWidth }]}
      className="bg-white dark:bg-black"
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header with Skip & Autoplay */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: colors.primary }]}>
              Skip
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={toggleAutoPlay}
            style={[
              styles.autoPlayButton,
              { backgroundColor: colors.primary + '10' },
            ]}
          >
            <Ionicons
              name={autoPlay ? 'pause' : 'play'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity> */}
        </View>

        {/* Image */}
        <View className="h-[25vh] w-full items-center justify-center mb-1">
          <Image
            source={item.image}
            className="w-full h-full rounded-2xl"
            resizeMode="cover"
          />
        </View>

        {/* Title & Subtitle */}
        <View className="flex-1">
          <Text className="text-primary text-2xl font-bold text-center mb-2 font-['Inter-Bold']">
            {item.title}
          </Text>
          <Text className="text-gray-500 text-sm text-center mb-6 leading-5 font-['Inter-Regular']">
            {item.subtitle}
          </Text>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            {item.features.map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  {renderFeatureIcon(feature.icon)}
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {onboardingData.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleDotPress(i)}
              style={[
                styles.progressDot,
                i === currentIndex
                  ? { width: 24, backgroundColor: colors.primary }
                  : { width: 8, backgroundColor: '#E5E7EB' },
              ]}
            />
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity
              onPress={handlePrevious}
              style={[
                styles.navButton,
                { backgroundColor: colors.primary + '10' },
              ]}
            >
              <AntDesign name="arrowleft" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
          <View style={styles.spacer} />
          {currentIndex === onboardingData.length - 1 ? (
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.getStartedButton}
            >
              <TouchableOpacity
                onPress={handleGetStarted}
                style={styles.getStartedButtonInner}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
                <AntDesign name="arrowright" size={20} color="white" />
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              style={[
                styles.navButton,
                { backgroundColor: colors.primary + '10' },
              ]}
            >
              <AntDesign name="arrowright" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => setAutoPlay(false)}
        contentContainerStyle={styles.scrollViewContent}
      >
        {onboardingData.map((item, index) => renderSlide(item, index))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  slideContainer: {
    flex: 1,
    height: '100%',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 20,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(7, 101, 114, 0.1)',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  autoPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    height: screenHeight * 0.25,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  featuresContainer: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
    fontFamily: 'Inter-Medium',
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B728090',
    fontFamily: 'Inter-Regular',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "center",
    gap: 8,
    bottom: 26,
    position: "absolute",
    marginVertical: 0,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,

  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  getStartedButton: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  getStartedButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 8,
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});