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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { getLogoData } from "../utils/logoUtils";
import { deleteSubscription } from "../utils/subscriptionLogic";

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
  const [notesHeight, setNotesHeight] = useState(50);
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
          opacity.setValue(1 - gestureState.dy / 400);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 200) {
          onDismiss();
        } else {
          Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
            Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
          ]).start();
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
          stiffness: 250,
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

  const handleDeletePress = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      try {
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
      }
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
    <Animated.View style={[styles.container, { opacity }]}>
      <TouchableOpacity
        style={styles.backgroundOverlay}
        activeOpacity={1}
        onPress={onDismiss}
        hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top}
        style={styles.keyboardAvoidingView}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{ translateY }],
              paddingBottom: insets.bottom + 20,
              backgroundColor: "#FFFFFF",
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.handleIndicator} {...panResponder.panHandlers}>
            <View style={styles.handleBar} />
          </View>

          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Section */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={onDismiss}
                style={styles.closeButton}
                hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            {/* Logo and Title Section */}
            <View style={styles.logoSection}>
              <View
                style={[
                  styles.logoContainer,
                  { backgroundColor: `${logoColor}20` },
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
              </View>
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
            <View style={styles.card}>
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
                      size={14}
                      color="#F59E0B"
                      style={styles.alertIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.renewalText,
                      renewalInfo.isUrgent && styles.urgentText,
                    ]}
                  >
                    {getFormattedDate(subscription.renewalDate)} (
                    {renewalInfo.text})
                  </Text>
                </View>
              </View>
            </View>

            {/* Billing & Plan Details Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Billing & Plan</Text>

              {subscription.paymentMethod && (
                <DetailRow
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
                  label="Expiry Date"
                  value={subscription.paymentMethod.expiryDate}
                />
              )}

              {subscription.billingCycle && (
                <DetailRow
                  label="Billing Cycle"
                  value={subscription.billingCycle}
                  capitalize
                />
              )}

              <DetailRow
                label="Plan Tier"
                value={subscription.price === 0 ? "Free Plan" : "Premium Plan"}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
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
                onPress={handleDeletePress}
                color="#EF4444"
                isConfirm={showDeleteConfirm}
              />
            </View>

            {/* Notes Section */}
            <View style={styles.notesCard}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <TextInput
                style={[
                  styles.notesInput,
                  { minHeight: Math.max(48, notesHeight) },
                ]}
                placeholder="Add notes about this subscription..."
                placeholderTextColor="#94A3B8"
                multiline
                defaultValue={subscription.notes || ""}
                onFocus={() =>
                  scrollViewRef.current?.scrollToEnd({ animated: true })
                }
                onContentSizeChange={(e) =>
                  setNotesHeight(e.nativeEvent.contentSize.height)
                }
              />
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const DetailRow = ({ label, value, capitalize = false }: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={[styles.cardValue, capitalize && styles.capitalize]}>
      {value}
    </Text>
  </View>
);

const ActionButton = ({
  icon,
  label,
  onPress,
  color,
  isConfirm = false,
}: any) => (
  <TouchableOpacity
    style={[styles.actionButton, isConfirm && { backgroundColor: color }]}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <Ionicons name={icon} size={20} color={isConfirm ? "white" : color} />
    <Text
      style={[styles.actionButtonText, { color: isConfirm ? "white" : color }]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 62,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  handleIndicator: {
    alignItems: "center",
    marginBottom: 16,
  },
  handleBar: {
    width: 48,
    height: 4,
    backgroundColor: "#CBD5E1",
    borderRadius: 2,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  closeButton: {
    padding: 8,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 24,
    gap: 12,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  yearlyPrice: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  renewalContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  alertIcon: {
    marginRight: 4,
  },
  renewalText: {
    fontSize: 14,
    color: "#0F172A",
  },
  urgentText: {
    color: "#F59E0B",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 14,
    color: "#0F172A",
  },
  capitalize: {
    textTransform: "capitalize",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(47, 128, 237, 0.1)",
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
  },
  notesCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
  },
  notesInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#0F172A",
    textAlignVertical: "top",
  },
});

export default SubscriptionModal;
