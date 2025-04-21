import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  AccessibilityInfo,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { getLogoData } from "../utils/logoUtils";
import { deleteSubscription } from "../utils/subscriptionLogic";
import { BlurView } from "expo-blur";
import {
  styles,
  animationConstants,
} from "./SubscriptionModal/styles/SubscriptionModalStyles";
import { DetailRow } from "./SubscriptionModal/DetailRow";
import { ActionButton } from "./SubscriptionModal/ActionButton";

const { height: screenHeight } = Dimensions.get("window");
const modalHeight = screenHeight * 0.65;
const SMOOTH_EASING = Easing.bezier(0.25, 0.1, 0.25, 1.0);

interface SubscriptionModalProps {
  visible: boolean;
  subscription: any;
  onDismiss: () => void;
  onEdit?: (subscription: any) => void;
  onPause?: (subscription: any) => void;
  onDelete?: (subscription: any) => void;
  onSheetAnimationStart?: () => void;
  onSheetAnimationEnd?: (visible: boolean) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  subscription,
  onDismiss,
  onEdit = () => {},
  onPause = () => {},
  onDelete = () => {},
  onSheetAnimationStart,
  onSheetAnimationEnd,
}) => {
  const insets = useSafeAreaInsets();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [notesHeight, setNotesHeight] = useState(50);
  const [notes, setNotes] = useState("");
  const [logoData, setLogoData] = useState<{
    url: string;
    color: string;
  } | null>(null);

  // Animation values for micro-interactions
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;

  // Initialize notes from subscription
  useEffect(() => {
    if (subscription?.notes) {
      setNotes(subscription.notes);
    }
  }, [subscription?.notes]);

  useEffect(() => {
    const loadLogo = async () => {
      if (subscription?.name) {
        const data = await getLogoData(subscription.name);
        setLogoData(data);
      }
    };
    loadLogo();
  }, [subscription?.name]);

  // Rotate logo animation on mount
  useEffect(() => {
    if (visible && logoData) {
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } else {
      logoRotation.setValue(0);
    }
  }, [visible, logoData]);

  const rotateInterpolation = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Animation interpolations
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight * 0.5, 0],
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

    onSheetAnimationStart?.();
    const anim = Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
      stiffness: 100,
      damping: 20,
    });
    animationRef.current = anim;
    anim.start(() => onSheetAnimationEnd?.(true));

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    AccessibilityInfo.announceForAccessibility("Subscription details");

    return () => {
      animationRef.current?.stop();
      animationRef.current = null;
    };
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy, dx }) => {
        return (
          Math.abs(dy) > Math.abs(dx) * 1.5 &&
          Math.abs(dy) > animationConstants.MIN_DISTANCE_TO_TRIGGER
        );
      },
      onPanResponderGrant: () => {
        animationRef.current?.stop();
        setIsDragging(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0)
          animation.setValue(Math.max(0, 1 - dy / (screenHeight * 0.6)));
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        setIsDragging(false);
        const shouldDismiss =
          (dy / screenHeight >
            animationConstants.DISMISS_THRESHOLD / screenHeight &&
            vy > 0) ||
          vy > animationConstants.VELOCITY_THRESHOLD;

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

  const handleOutsideTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(animation, {
      toValue: 0,
      useNativeDriver: true,
    }).start(onDismiss);
  };

  const daysUntilRenewal = (
    renewalDate: string
  ): {
    text: string;
    isUrgent: boolean;
    severity: "high" | "medium" | "low";
  } => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffDays = Math.ceil(
      (renewal.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );

    if (diffDays <= 0)
      return { text: "Today", isUrgent: true, severity: "high" };
    if (diffDays === 1)
      return { text: "Tomorrow", isUrgent: true, severity: "high" };
    if (diffDays <= 3)
      return {
        text: `${diffDays} days (Soon)`,
        isUrgent: true,
        severity: "medium",
      };
    if (diffDays <= 7)
      return { text: `${diffDays} days`, isUrgent: false, severity: "low" };
    return { text: `${diffDays} days`, isUrgent: false, severity: "low" };
  };

  const handleButtonPress = (action: () => void) => {
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  const handleDeletePress = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      try {
        setIsDeleting(true);
        const success = await deleteSubscription(subscription.id);
        if (success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onDelete(subscription);
          onDismiss();
        } else {
          Alert.alert(
            "Error",
            "Failed to delete subscription. Please try again."
          );
          setShowDeleteConfirm(false);
        }
      } catch (error) {
        console.error("Error deleting subscription:", error);
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
        setShowDeleteConfirm(false);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const saveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to save notes. Please try again.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (!visible || !subscription) return null;

  const renewalInfo = daysUntilRenewal(subscription.renewalDate);
  const logoColor = logoData?.color || "#2F80ED";

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      default:
        return "#64748B";
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.backgroundOverlay, { opacity: backdropOpacity }]}
      >
        <TouchableOpacity
          style={styles.backgroundOverlayTouch}
          onPress={handleOutsideTap}
          accessibilityRole="button"
          accessibilityLabel="Close subscription details"
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        style={styles.keyboardAvoidingView}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY }],
              paddingBottom: insets.bottom,
            },
          ]}
          {...panResponder.panHandlers}
          accessibilityViewIsModal
        >
          <View style={styles.headerContainer}>
            <View style={styles.handleIndicator}>
              <View style={styles.handleBar} />
            </View>
            <TouchableOpacity
              onPress={handleOutsideTap}
              style={styles.closeButton}
              accessibilityLabel="Close"
              accessibilityHint="Closes the subscription details"
            >
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            {/* Logo and Title Section */}
            <View style={styles.logoSection}>
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    backgroundColor: `${logoColor}20`,
                    shadowColor: logoColor,
                    transform: [{ rotate: rotateInterpolation }],
                  },
                ]}
              >
                {logoData ? (
                  <Image
                    source={{ uri: logoData.url }}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                ) : (
                  <ActivityIndicator size="large" color={logoColor} />
                )}
              </Animated.View>
              <Text style={styles.title}>{subscription.name}</Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: `${logoColor}20` },
                ]}
              >
                <Text style={[styles.categoryText, { color: logoColor }]}>
                  {subscription.category}
                </Text>
              </View>
            </View>

            {/* Price and Renewal Card */}
            <Animated.View
              style={[styles.card, { transform: [{ scale: cardScale }] }]}
            >
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Monthly Price</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>
                    ${subscription.price.toFixed(2)}
                  </Text>
                  <Text style={styles.yearlyPrice}>
                    ${(subscription.price * 12).toFixed(2)}/year
                  </Text>
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.cardRow}>
                <View style={styles.iconLabel}>
                  <Ionicons name="calendar" size={16} color="#64748B" />
                  <Text style={styles.cardLabel}>Next renewal</Text>
                </View>
                <View style={styles.renewalContainer}>
                  {renewalInfo.isUrgent && (
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={getSeverityColor(renewalInfo.severity)}
                      style={styles.alertIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.renewalText,
                      renewalInfo.isUrgent && [
                        styles.urgentText,
                        { color: getSeverityColor(renewalInfo.severity) },
                      ],
                    ]}
                  >
                    {getFormattedDate(subscription.renewalDate)} (
                    {renewalInfo.text})
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Billing & Plan Details Card */}
            <Animated.View
              style={[styles.card, { transform: [{ scale: cardScale }] }]}
            >
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="card-outline" size={18} color="#64748B" />
                <Text style={styles.sectionTitle}>Billing & Plan</Text>
              </View>

              {subscription.paymentMethod && (
                <DetailRow
                  icon="card-outline"
                  label="Payment Method"
                  value={
                    subscription.paymentMethod.type === "card"
                      ? `•••• ${subscription.paymentMethod.lastFour}`
                      : subscription.paymentMethod.type
                  }
                />
              )}

              {subscription.paymentMethod?.expiryDate && (
                <DetailRow
                  icon="calendar-outline"
                  label="Expiry Date"
                  value={subscription.paymentMethod.expiryDate}
                />
              )}

              {subscription.billingCycle && (
                <DetailRow
                  icon="refresh-outline"
                  label="Billing Cycle"
                  value={subscription.billingCycle}
                  capitalize
                />
              )}

              <DetailRow
                icon="star-outline"
                label="Plan Tier"
                value={subscription.price === 0 ? "Free Plan" : "Premium Plan"}
              />
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View
              style={[
                styles.actionButtons,
                { transform: [{ scale: cardScale }] },
              ]}
            >
              <ActionButton
                icon="pencil"
                label="Edit"
                onPress={() => handleButtonPress(() => onEdit(subscription))}
                color="#2F80ED"
              />
              <ActionButton
                icon="pause"
                label="Pause"
                onPress={() => handleButtonPress(() => onPause(subscription))}
                color="#2F80ED"
              />
              <ActionButton
                icon="trash"
                label={showDeleteConfirm ? "Confirm" : "Delete"}
                onPress={() => handleButtonPress(handleDeletePress)}
                color="#EF4444"
                isConfirm={showDeleteConfirm}
                isLoading={isDeleting}
              />
            </Animated.View>

            {/* Notes Section */}
            <Animated.View
              style={[styles.notesCard, { transform: [{ scale: cardScale }] }]}
            >
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="create-outline" size={18} color="#64748B" />
                <Text style={styles.sectionTitle}>Notes</Text>
              </View>
              <TextInput
                style={[
                  styles.notesInput,
                  { minHeight: Math.max(60, notesHeight) },
                ]}
                placeholder="Add notes about this subscription..."
                placeholderTextColor="#94A3B8"
                multiline
                value={notes}
                onChangeText={setNotes}
                onFocus={() =>
                  scrollViewRef.current?.scrollToEnd({ animated: true })
                }
                onContentSizeChange={(e) =>
                  setNotesHeight(Math.max(60, e.nativeEvent.contentSize.height))
                }
              />
              <TouchableOpacity
                style={[
                  styles.saveNotesButton,
                  notes.trim().length === 0 && styles.disabledButton,
                  isSavingNotes && styles.savingNotesButton,
                ]}
                onPress={saveNotes}
                disabled={notes.trim().length === 0 || isSavingNotes}
                accessibilityLabel="Save notes"
                accessibilityHint="Saves your notes for this subscription"
              >
                {isSavingNotes ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons
                      name="save-outline"
                      size={16}
                      color="white"
                      style={styles.saveIcon}
                    />
                    <Text style={styles.saveNotesText}>Save Notes</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SubscriptionModal;
