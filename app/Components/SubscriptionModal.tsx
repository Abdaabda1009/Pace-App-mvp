import React, { useEffect, useRef, useState, useCallback } from "react";
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
  ActivityIndicator,
  Alert,
  Dimensions,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { getLogoData } from "../utils/logoUtils";
import { deleteSubscription } from "../utils/subscriptionLogic";
import { BlurView } from "expo-blur";

const { height: screenHeight } = Dimensions.get("window");

interface SubscriptionModalProps {
  visible: boolean;
  subscription: any;
  onDismiss: () => void;
  onEdit?: (subscription: any) => void;
  onDelete?: (subscription: any) => void;
  onSheetAnimationEnd?: (visible: boolean) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  subscription,
  onDismiss,
  onEdit = () => {},
  onDelete = () => {},
  onSheetAnimationEnd,
}) => {
  const insets = useSafeAreaInsets();
  const [isDragging, setIsDragging] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [notes, setNotes] = useState("");
  const [logoData, setLogoData] = useState<{
    url: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    if (subscription?.notes) setNotes(subscription.notes);
  }, [subscription?.notes]);

  const loadLogo = useCallback(async () => {
    if (subscription?.name) {
      const data = await getLogoData(subscription.name);
      setLogoData(data);
    }
  }, [subscription?.name]);

  useEffect(() => {
    loadLogo();
  }, [loadLogo]);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const animateModal = useCallback(
    (toValue: number, callback?: () => void) => {
      Animated.timing(animation, {
        toValue,
        duration: 300,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start(() => {
        if (callback) callback();
        if (toValue === 1) onSheetAnimationEnd?.(true);
      });
    },
    [animation, onSheetAnimationEnd]
  );

  useEffect(() => {
    if (visible) {
      animateModal(1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      animation.setValue(0);
    }
  }, [visible, animateModal]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy, dx }) => {
        return Math.abs(dy) > Math.abs(dx) * 1.2;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) {
          const newValue = 1 - dy / (screenHeight * 0.6);
          animation.setValue(Math.max(0, newValue));
        }
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        setIsDragging(false);
        const velocityThreshold = vy > 0.5;
        const distanceThreshold = dy > screenHeight * 0.2;

        if (velocityThreshold || distanceThreshold) {
          animateModal(0, onDismiss);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          animateModal(1);
        }
      },
    })
  ).current;

  const handleOutsideTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateModal(0, onDismiss);
  }, [animateModal, onDismiss]);

  const daysUntilRenewal = useCallback((renewalDate: string) => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffDays = Math.ceil(
      (renewal.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );

    if (diffDays <= 0) return { text: "Today", severity: "danger" };
    if (diffDays === 1) return { text: "Tomorrow", severity: "warning" };
    if (diffDays <= 3) return { text: `${diffDays} days`, severity: "warning" };
    return { text: `${diffDays} days`, severity: "textSecondary" };
  }, []);

  const handleButtonPress = useCallback((action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  }, []);

  const handleDeletePress = useCallback(async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    try {
      setIsDeleting(true);
      const success = await deleteSubscription(subscription.id);
      if (success) {
        onDelete(subscription);
        animateModal(0, onDismiss);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete subscription. Please try again.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  }, [showDeleteConfirm, subscription, animateModal, onDismiss, onDelete]);

  const saveNotes = useCallback(async () => {
    setIsSavingNotes(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setIsSavingNotes(false);
    }
  }, []);

  if (!visible || !subscription) return null;

  const renewalInfo = daysUntilRenewal(subscription.renewalDate);
  const logoColor = logoData?.color || "#3A6D8E";

  return (
    <View className="absolute inset-0 z-50">
      <Animated.View
        className="absolute inset-0 bg-black/50"
        style={{ opacity: backdropOpacity }}
      >
        <TouchableOpacity
          className="flex-1"
          onPress={handleOutsideTap}
          accessibilityRole="button"
          accessibilityLabel="Close subscription details"
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.bottom + 20 : 0}
        className="flex-1 justify-end"
      >
        <Animated.View
          className="bg-light-background dark:bg-primary rounded-t-3xl px-3 pt-3 shadow-xl"
          style={[
            {
              transform: [{ translateY }],
              paddingBottom: insets.bottom,
            },
          ]}
          {...panResponder.panHandlers}
          accessibilityViewIsModal
        >
          <View className="flex-row justify-between items-center py-3 px-2">
            <View className="flex-1 items-center">
              <View className="w-12 h-1 bg-light-secondary dark:bg-secondary rounded-full" />
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            className="pb-10"
            bounces={false}
          >
            {/* Logo Section */}
            <View className="items-center my-4 gap-3">
              <View
                className="w-22 h-22 rounded-2xl justify-center items-center bg-opacity-20 shadow-md"
                style={{ backgroundColor: `${logoColor}20` }}
              >
                {logoData ? (
                  <Image
                    source={{ uri: logoData.url }}
                    className="w-16 h-16 rounded-xl"
                    resizeMode="contain"
                  />
                ) : (
                  <ActivityIndicator size="large" color={logoColor} />
                )}
              </View>
              <Text className="text-2xl font-bold text-textDark dark:text-textLight">
                {subscription.name}
              </Text>
              <View
                className="px-3.5 py-2 rounded-xl bg-opacity-20"
                style={{ backgroundColor: `${logoColor}20` }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: logoColor }}
                >
                  {subscription.category}
                </Text>
              </View>
            </View>

            {/* Pricing Card */}
            <BlurView
              intensity={20}
              className="bg-light-primary dark:bg-primary rounded-2xl p-5 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-textSecondary dark:text-textLightSecondary text-base">
                  Monthly Price
                </Text>
                <View className="items-end">
                  <Text className="text-textDark dark:text-textLight text-xl font-bold">
                    ${subscription.price.toFixed(2)}
                  </Text>
                  <Text className="text-textSecondary dark:text-textLightSecondary text-xs mt-1">
                    ${(subscription.price * 12).toFixed(2)}/year
                  </Text>
                </View>
              </View>

              <View className="h-px bg-light-secondary dark:bg-secondary my-4" />

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={Platform.select({
                      ios: "#64748B",
                      default: "#64748B",
                    })}
                    className="dark:text-textLightSecondary"
                  />
                  <Text className="text-textSecondary dark:text-textLightSecondary text-base">
                    Next renewal
                  </Text>
                </View>
                <Text
                  className={`text-base font-medium ${
                    renewalInfo.severity === "danger"
                      ? "text-error"
                      : renewalInfo.severity === "warning"
                      ? "text-warning"
                      : "text-textSecondary dark:text-textLightSecondary"
                  }`}
                >
                  {renewalInfo.text}
                </Text>
              </View>
            </BlurView>

            {/* Action Buttons */}
            <View className="flex-row justify-between gap-3 mb-5">
              <TouchableOpacity
                className="flex-1 items-center py-4 rounded-2xl bg-light-secondary dark:bg-secondary"
                onPress={() => handleButtonPress(() => onEdit(subscription))}
              >
                <Ionicons
                  name="pencil"
                  size={20}
                  className="text-brandBlue dark:text-brandBlueLight"
                />
                <Text className="text-brandBlue dark:text-brandBlueLight text-sm font-semibold mt-2">
                  Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center py-4 rounded-2xl bg-light-secondary dark:bg-secondary"
                onPress={handleDeletePress}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" className="text-error" />
                ) : (
                  <>
                    <Ionicons
                      name="trash"
                      size={20}
                      className="text-error dark:text-errorLight"
                    />
                    <Text className="text-error dark:text-errorLight text-sm font-semibold mt-2">
                      {showDeleteConfirm ? "Confirm" : "Delete"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Notes Section */}
            <BlurView
              intensity={20}
              className="bg-light-primary dark:bg-primary rounded-2xl p-5 shadow-sm"
            >
              <View className="flex-row items-center gap-2 mb-4">
                <Ionicons
                  name="create-outline"
                  size={18}
                  className="text-textSecondary dark:text-textLightSecondary"
                />
                <Text className="text-textSecondary dark:text-textLightSecondary text-lg font-semibold">
                  Notes
                </Text>
              </View>
              <TextInput
                className="bg-light-background dark:bg-primary rounded-xl p-4 text-textDark dark:text-textLight text-base border border-light-secondary dark:border-secondary"
                placeholder="Add notes about this subscription..."
                placeholderTextColor="#64748B"
                multiline
                value={notes}
                onChangeText={setNotes}
                onFocus={() =>
                  scrollViewRef.current?.scrollToEnd({ animated: true })
                }
              />
              <TouchableOpacity
                className={`py-3 px-5 rounded-lg self-end mt-4 flex-row items-center justify-center shadow-md ${
                  notes.trim() === subscription.notes || isSavingNotes
                    ? "bg-light-secondary dark:bg-secondary"
                    : "bg-brandBlue dark:bg-brandBlueDark"
                }`}
                onPress={saveNotes}
                disabled={notes.trim() === subscription.notes || isSavingNotes}
              >
                {isSavingNotes ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="white" />
                    <Text className="text-white text-sm font-semibold ml-2">
                      Save
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </BlurView>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SubscriptionModal;
