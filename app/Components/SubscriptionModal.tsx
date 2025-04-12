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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { getLogoData } from "../../utils/logoUtils";

interface SubscriptionModalProps {
  visible: boolean;
  subscription: any;
  onDismiss: () => void;
  onEdit?: (subscription: any) => void;
  onPause?: (subscription: any) => void;
  onDelete?: (subscription: any) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  subscription,
  onDismiss,
  onEdit = () => {},
  onPause = () => {},
  onDelete = () => {},
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(1000)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [notesHeight, setNotesHeight] = useState(48);
  const [logoData, setLogoData] = useState<{
    url: string;
    color: string;
  } | null>(null);

  useEffect(() => {
    const loadLogo = async () => {
      if (subscription?.name) {
        const data = await getLogoData(subscription.name);
        setLogoData(data);
      }
    };
    loadLogo();
  }, [subscription?.name]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onDismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 80,
          stiffness: 300,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 1000,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      setShowDeleteConfirm(false);
    }
  }, [visible]);

  const daysUntilRenewal = (
    renewalDate: string
  ): { text: string; isUrgent: boolean } => {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const diffDays = Math.ceil(
      (renewal.getTime() - today.getTime()) / (1000 * 3600 * 24)
    );

    if (diffDays <= 0) return { text: "Today", isUrgent: true };
    if (diffDays <= 3)
      return { text: `${diffDays} days (Soon)`, isUrgent: true };
    return { text: `${diffDays} days`, isUrgent: false };
  };

  const handleButtonPress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  const handleDeletePress = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onDelete(subscription);
      onDismiss();
    }
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (!visible || !subscription) return null;

  const renewalInfo = daysUntilRenewal(subscription.renewalDate);
  const logoColor = logoData?.color || "#2F80ED";

  return (
    <Animated.View className="absolute inset-0 z-50" style={{ opacity }}>
      <TouchableOpacity
        className="absolute inset-0 bg-black/50"
        activeOpacity={1}
        onPress={onDismiss}
        hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top}
        className="flex-1 justify-end"
      >
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-light-primary dark:bg-primary rounded-t-3xl pt-4 px-4"
          style={{
            transform: [{ translateY }],
            paddingBottom: insets.bottom + 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 20,
          }}
          {...panResponder.panHandlers}
        >
          <View className="items-center mb-4" {...panResponder.panHandlers}>
            <View className="w-12 h-1.5 bg-light-text/20 dark:bg-white/20 rounded-full" />
          </View>

          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Header Section */}
            <View className="flex-row justify-end mb-2">
              <TouchableOpacity
                onPress={onDismiss}
                className="p-2"
                hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  className="text-light-text dark:text-white"
                />
              </TouchableOpacity>
            </View>

            {/* Logo and Title Section */}
            <View className="items-center mb-4 gap-3">
              <View
                className="w-20 h-20 rounded-xl justify-center items-center"
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
              <Text className="text-light-text dark:text-white text-2xl font-bold mt-2">
                {subscription.name}
              </Text>
              <View
                className="px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: `${logoColor}20` }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: logoColor }}
                >
                  {subscription.category}
                </Text>
              </View>
            </View>

            {/* Price and Renewal Card */}
            <View className="bg-light-secondary dark:bg-white/5 rounded-3xl p-5 mb-6 overflow-hidden">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-light-text/70 dark:text-white/70 text-base">
                  Monthly Price
                </Text>
                <View className="items-end">
                  <Text className="text-light-text dark:text-white text-xl font-bold">
                    ${subscription.price.toFixed(2)}
                  </Text>
                  <Text className="text-light-text/50 dark:text-white/50 text-xs">
                    ${(subscription.price * 12).toFixed(2)}/year
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Ionicons
                    name="calendar"
                    size={16}
                    className="text-light-text/70 dark:text-white/70"
                  />
                  <Text className="text-light-text/70 dark:text-white/70 text-sm ml-2">
                    Next renewal
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {renewalInfo.isUrgent && (
                    <Ionicons
                      name="alert-circle"
                      size={14}
                      color="#F59E0B"
                      className="mr-1"
                    />
                  )}
                  <Text
                    className={`text-sm ${
                      renewalInfo.isUrgent
                        ? "text-amber-400"
                        : "text-light-text dark:text-white"
                    }`}
                  >
                    {getFormattedDate(subscription.renewalDate)} (
                    {renewalInfo.text})
                  </Text>
                </View>
              </View>
            </View>

            {/* Billing & Plan Details Card */}
            <View className="bg-light-secondary dark:bg-white/5 rounded-3xl p-5 mb-6 overflow-hidden">
              <Text className="text-light-text/70 dark:text-white/70 text-base mb-3">
                Billing & Plan
              </Text>

              {/* Payment Method */}
              {subscription.paymentMethod && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-light-text/70 dark:text-white/70 text-sm">
                    Payment Method
                  </Text>
                  <Text className="text-light-text dark:text-white text-sm">
                    {subscription.paymentMethod.type === "card"
                      ? `•••• ${subscription.paymentMethod.lastFour}`
                      : subscription.paymentMethod.type}
                  </Text>
                </View>
              )}

              {/* Expiry Date */}
              {subscription.paymentMethod?.expiryDate && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-light-text/70 dark:text-white/70 text-sm">
                    Expiry Date
                  </Text>
                  <Text className="text-light-text dark:text-white text-sm">
                    {subscription.paymentMethod.expiryDate}
                  </Text>
                </View>
              )}

              {/* Billing Cycle */}
              {subscription.billingCycle && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-light-text/70 dark:text-white/70 text-sm">
                    Billing Cycle
                  </Text>
                  <Text className="text-light-text dark:text-white text-sm capitalize">
                    {subscription.billingCycle}
                  </Text>
                </View>
              )}

              {/* Plan Tier */}
              <View className="flex-row justify-between items-center">
                <Text className="text-light-text/70 dark:text-white/70 text-sm">
                  Plan Tier
                </Text>
                <Text className="text-light-text dark:text-white text-sm">
                  {subscription.price === 0 ? "Free Plan" : "Premium Plan"}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between mb-6">
              <TouchableOpacity
                className="flex-1 items-center p-3 mx-1 rounded-xl bg-brandBlue/10"
                onPress={() => handleButtonPress(() => onEdit(subscription))}
              >
                <Ionicons name="pencil" size={20} color="#2F80ED" />
                <Text className="mt-2 font-semibold text-brandBlue">Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 items-center p-3 mx-1 rounded-xl bg-brandBlue/10"
                onPress={() => handleButtonPress(() => onPause(subscription))}
              >
                <Ionicons name="pause" size={20} color="#2F80ED" />
                <Text className="mt-2 font-semibold text-brandBlue">Pause</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 items-center p-3 mx-1 rounded-xl ${
                  showDeleteConfirm ? "bg-red-500" : "bg-red-500/10"
                }`}
                onPress={() => handleButtonPress(handleDeletePress)}
              >
                <Ionicons
                  name="trash"
                  size={20}
                  color={showDeleteConfirm ? "white" : "#EF4444"}
                />
                <Text
                  className={`mt-2 font-semibold ${
                    showDeleteConfirm ? "text-white" : "text-red-500"
                  }`}
                >
                  {showDeleteConfirm ? "Confirm" : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Notes Section */}
            <View className="bg-light-secondary dark:bg-white/5 rounded-2xl p-4 mb-4">
              <Text className="text-light-text/70 dark:text-white/70 text-base mb-2">
                Notes
              </Text>
              <TextInput
                className="bg-light-primary dark:bg-white/10 rounded-lg px-3 py-2 text-light-text dark:text-white text-sm"
                placeholder="Add notes about this subscription..."
                placeholderTextColor="#64748B" // Neutral color that works in both modes
                multiline={true}
                defaultValue={subscription.notes || ""}
                onFocus={() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }}
                style={{ minHeight: Math.max(48, notesHeight) }}
                onContentSizeChange={(e) => {
                  setNotesHeight(e.nativeEvent.contentSize.height);
                }}
              />
            </View>

            <View className="h-4" />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

export default SubscriptionModal;
