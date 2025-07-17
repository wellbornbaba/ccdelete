import React, { useRef, useEffect, useCallback, useMemo } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeStore } from "@/store/useThemeStore";
import {
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BottomSheetProps {
  isVisible: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnapPoint?: number;
  enablePanGesture?: boolean;
  enableBackdropDismiss?: boolean;
  enableScrollView?: boolean;
  backdropOpacity?: number;
  borderRadius?: number;
  showHandle?: boolean;
  handleStyle?: object;
  containerStyle?: object;
  contentStyle?: object;
  animationDuration?: number;
  onSnapPointChange?: (index: number) => void;
  minClosingVelocity?: number;
  closeThreshold?: number;
}

const CustomBottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  onClose,
  children,
  snapPoints = [50, 90],
  initialSnapPoint = 0,
  enablePanGesture = true,
  enableBackdropDismiss = true,
  enableScrollView = true,
  backdropOpacity = 0.5,
  borderRadius = 20,
  showHandle = true,
  handleStyle = {},
  containerStyle = {},
  contentStyle = {},
  animationDuration = 300,
  onSnapPointChange,
  minClosingVelocity = 500,
  closeThreshold = 0.3,
}) => {
  const { colors } = useThemeStore();
  const insets = useSafeAreaInsets();

  const snapPositions = useMemo(() => {
    return snapPoints.map((point) => SCREEN_HEIGHT * (1 - point / 100));
  }, [snapPoints]);

  const panGestureRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const isScrolling = useRef(false);

  const dragY = useRef(new Animated.Value(0)).current;
  const offsetY = useRef(new Animated.Value(snapPositions[initialSnapPoint])).current;
  const translateY = Animated.add(offsetY, dragY).interpolate({
    inputRange: [snapPositions[snapPositions.length - 1], SCREEN_HEIGHT],
    outputRange: [snapPositions[snapPositions.length - 1], SCREEN_HEIGHT],
    extrapolate: "clamp",
  });

  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;
  const currentSnapIndex = useRef(initialSnapPoint);

  const animateToSnapPoint = useCallback(
    (index: number, velocity = 0) => {
      const toValue = snapPositions[index];
      currentSnapIndex.current = index;

      Animated.parallel([
        Animated.spring(offsetY, {
          toValue,
          velocity,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacityAnim, {
          toValue: backdropOpacity,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();

      onSnapPointChange?.(index);
    },
    [snapPositions, backdropOpacity, animationDuration, offsetY, backdropOpacityAnim, onSnapPointChange]
  );

  const hideBottomSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacityAnim, {
        toValue: 0,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.spring(offsetY, {
        toValue: SCREEN_HEIGHT,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  }, [animationDuration, onClose]);

  const showBottomSheet = useCallback(() => {
    animateToSnapPoint(initialSnapPoint);
  }, [animateToSnapPoint, initialSnapPoint]);

  useEffect(() => {
    if (isVisible) {
      showBottomSheet();
    } else {
      hideBottomSheet();
    }
  }, [isVisible, showBottomSheet, hideBottomSheet]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = useCallback(
    (event: any) => {
      if (!enablePanGesture) return;

      const { state, velocityY, translationY } = event.nativeEvent;

      if (state === State.END || state === State.CANCELLED) {
        dragY.extractOffset();
        dragY.setValue(0);
        dragY.setOffset(0);

        const endPosition = (offsetY as any)._value + translationY;

        if (
          velocityY > minClosingVelocity ||
          (translationY > SCREEN_HEIGHT * closeThreshold &&
            velocityY > -minClosingVelocity)
        ) {
          hideBottomSheet();
          return;
        }

        let closestIndex = 0;
        let minDist = Math.abs(endPosition - snapPositions[0]);

        for (let i = 1; i < snapPositions.length; i++) {
          const dist = Math.abs(endPosition - snapPositions[i]);
          if (dist < minDist) {
            closestIndex = i;
            minDist = dist;
          }
        }

        if (velocityY > 500 && closestIndex < snapPositions.length - 1) {
          closestIndex++;
        } else if (velocityY < -500 && closestIndex > 0) {
          closestIndex--;
        }

        animateToSnapPoint(closestIndex, velocityY);
      }
    },
    [
      animateToSnapPoint,
      snapPositions,
      enablePanGesture,
      hideBottomSheet,
      minClosingVelocity,
      closeThreshold,
    ]
  );

  const onScrollBeginDrag = useCallback(() => {
    isScrolling.current = true;
  }, []);

  const onScrollEndDrag = useCallback(() => {
    isScrolling.current = false;
  }, []);

  const handleBackdropPress = useCallback(() => {
    if (enableBackdropDismiss) {
      hideBottomSheet();
    }
  }, [enableBackdropDismiss, hideBottomSheet]);

  if (!isVisible) return null;

  const maxHeight =
    SCREEN_HEIGHT - snapPositions[snapPositions.length - 1] - insets.top;

  return (
    <View
      style={{
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Backdrop */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "black",
          opacity: backdropOpacityAnim,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={handleBackdropPress} />
      </Animated.View>

      {/* Bottom Sheet */}
      <PanGestureHandler
        ref={panGestureRef}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        enabled={enablePanGesture}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.background,
              borderTopLeftRadius: borderRadius,
              borderTopRightRadius: borderRadius,
              maxHeight,
              paddingBottom: insets.bottom,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 10,
              transform: [{ translateY }],
            },
            containerStyle,
          ]}
        >
          {/* Handle */}
          {showHandle && (
            <View
              style={[
                {
                  alignSelf: "center",
                  width: 40,
                  height: 4,
                  backgroundColor: colors.border,
                  borderRadius: 2,
                  marginTop: 8,
                  marginBottom: 8,
                },
                handleStyle,
              ]}
            />
          )}

          {/* Content */}
          <View style={[{ flex: 1 }, contentStyle]}>
            {enableScrollView ? (
              <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
                onScrollBeginDrag={onScrollBeginDrag}
                onScrollEndDrag={onScrollEndDrag}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                {children}
              </ScrollView>
            ) : (
              children
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default CustomBottomSheet;
