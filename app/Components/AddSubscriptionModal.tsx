import React, { useEffect, useRef, useState, ElementRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  useColorScheme,
  AccessibilityInfo,
  PanResponder,
  Easing,
  KeyboardAvoidingView,
  findNodeHandle,
  PixelRatio,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("window");

// Animation constants
const ANIMATION_DURATION = 350;
const DISMISS_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.5;
const MIN_DISTANCE_TO_TRIGGER = 5;
const SMOOTH_EASING = Easing.bezier(0.25, 0.1, 0.25, 1.0);

interface AddSubscriptionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onEmailScan: () => void;
  onDocumentUpload: () => void;
  onManualEntry?: () => void;
  onSheetAnimationStart?: () => void;
  onSheetAnimationEnd?: (visible: boolean) => void;
}

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  visible,
  onDismiss,
  onEmailScan,
  onDocumentUpload,
  onManualEntry,
  onSheetAnimationStart,
  onSheetAnimationEnd,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  // Refs and animation
  const sheetRef = useRef<View>(null);
  const initialFocusRef = useRef<ElementRef<typeof TouchableOpacity>>(null);
  const animation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const [buttonScales] = useState({
    emailScan: new Animated.Value(1),
    manualEntry: new Animated.Value(1),
    documentUpload: new Animated.Value(1),
  });
  const [isDragging, setIsDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Dynamic font sizing
  const getDynamicFontSize = (size: number) => {
    const fontScale = PixelRatio.getFontScale();
    return Platform.OS === "ios" ? size * Math.min(fontScale, 1.4) : size;
  };

  // Pan Responder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy, dx }) => {
        return (
          Math.abs(dy) > Math.abs(dx) * 1.5 &&
          Math.abs(dy) > MIN_DISTANCE_TO_TRIGGER
        );
      },
      onPanResponderGrant: () => {
        animationRef.current?.stop();
        setIsDragging(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) animation.setValue(Math.max(0, 1 - dy / (height * 0.6)));
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        setIsDragging(false);
        const shouldDismiss =
          (dy / height > DISMISS_THRESHOLD / height && vy > 0) ||
          vy > VELOCITY_THRESHOLD;

        if (shouldDismiss) {
          Animated.spring(animation, {
            toValue: 0,
            useNativeDriver: true,
            stiffness: 200,
            damping: 20,
          }).start(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onDismiss();
          });
        } else {
          Animated.spring(animation, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        Animated.spring(animation, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  // Animation interpolations
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.5, 0],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  // Effects
  useEffect(() => {
    if (Platform.OS === "ios") {
      AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;

    const timeout = setTimeout(() => {
      if (initialFocusRef.current) {
        const reactTag = findNodeHandle(initialFocusRef.current);
        if (reactTag) AccessibilityInfo.setAccessibilityFocus(reactTag);
      }
    }, ANIMATION_DURATION + 50);

    return () => clearTimeout(timeout);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    onSheetAnimationStart?.();
    animationRef.current = Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
      stiffness: 100,
      damping: 20,
    }).start(() => onSheetAnimationEnd?.(true));

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    AccessibilityInfo.announceForAccessibility("Add subscription options");

    return () => {
      animationRef.current?.stop();
      animationRef.current = null;
    };
  }, [visible]);

  // Handlers
  const handleOutsideTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
    }).start(onDismiss);
  };

  const handleManualEntry = () => {
    onDismiss();
    setTimeout(
      () => onManualEntry?.() || router.push("/SubscriptionForm"),
      300
    );
  };

  const animateButtonPress = (
    button: keyof typeof buttonScales,
    pressed: boolean
  ) => {
    if (pressed) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(buttonScales[button], {
      toValue: pressed ? 0.97 : 1,
      useNativeDriver: true,
    }).start();
  };

  if (!visible) return null;

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 justify-end items-center z-50">
      <Animated.View
        className="absolute top-0 left-0 right-0 bottom-0 bg-black"
        style={{ opacity: backdropOpacity }}
      >
        <Pressable
          className="absolute top-0 left-0 right-0 bottom-0"
          onPress={handleOutsideTap}
          accessibilityRole="button"
          accessibilityLabel="Close options"
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="absolute bottom-0 left-0 right-0"
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <Animated.View
          ref={sheetRef}
          className="w-full bg-white dark:bg-gray-900 rounded-t-2xl overflow-hidden max-h-[70vh]"
          style={[
            {
              transform: [{ translateY }],
              paddingBottom: insets.bottom,
            },
          ]}
          {...panResponder.panHandlers}
          accessibilityViewIsModal
        >
          <View className="p-6 pb-8">
            <View className="w-14 h-1 bg-gray-400 dark:bg-gray-600 rounded-full self-center mb-6" />

            <Text
              className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-6"
              style={{ fontSize: getDynamicFontSize(20) }}
            >
              Add New Subscription
            </Text>

            <View className="space-y-4 gap-4">
              {["emailScan", "manualEntry", "documentUpload"].map(
                (action, index) => (
                  <Animated.View
                    key={action}
                    style={{
                      transform: [
                        {
                          scale:
                            buttonScales[action as keyof typeof buttonScales],
                        },
                      ],
                    }}
                  >
                    <TouchableOpacity
                      ref={index === 0 ? initialFocusRef : undefined}
                      className="flex-row items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
                      onPress={() => {
                        Haptics.notificationAsync(
                          Haptics.NotificationFeedbackType.Success
                        );
                        [onEmailScan, handleManualEntry, onDocumentUpload][
                          index
                        ]();
                      }}
                      onPressIn={() =>
                        animateButtonPress(
                          action as keyof typeof buttonScales,
                          true
                        )
                      }
                      onPressOut={() =>
                        animateButtonPress(
                          action as keyof typeof buttonScales,
                          false
                        )
                      }
                      accessibilityRole="button"
                    >
                      <View className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4">
                        <Ionicons
                          name={
                            [
                              "mail-outline",
                              "pencil-outline",
                              "document-outline",
                            ][index] as any
                          }
                          size={30}
                          className="text-blue-500 dark:text-blue-400"
                        />
                      </View>

                      <View className="flex-1">
                        <Text
                          className="text-base font-semibold text-gray-900 dark:text-white"
                          style={{ fontSize: getDynamicFontSize(17) }}
                        >
                          {
                            [
                              "Scan Your Inbox",
                              "Add Manually",
                              "Upload Documents",
                            ][index]
                          }
                        </Text>
                        <Text
                          className="text-sm text-gray-500 dark:text-gray-400"
                          style={{ fontSize: getDynamicFontSize(13) }}
                        >
                          {
                            [
                              "Connect email to find subscriptions",
                              "Enter service details yourself",
                              "Parse PDF/CSV statements",
                            ][index]
                          }
                        </Text>
                      </View>

                      <Ionicons
                        name="chevron-forward-outline"
                        size={20}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </TouchableOpacity>
                  </Animated.View>
                )
              )}
            </View>

            <TouchableOpacity
              className="mt-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg items-center"
              onPress={handleOutsideTap}
              accessibilityRole="button"
            >
              <Text
                className="text-blue-500 font-medium"
                style={{ fontSize: getDynamicFontSize(16) }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddSubscriptionModal;
