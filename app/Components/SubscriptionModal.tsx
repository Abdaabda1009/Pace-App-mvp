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
  const scaleButtons = useRef(new Animated.Value(1)).current;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [notesHeight, setNotesHeight] = useState(50);
  const [notes, setNotes] = useState("");
  const [logoData, setLogoData] = useState<{
    url: string;
    color: string;
  } | null>(null);

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
          // Add dismiss animation
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 1000,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => onDismiss());
        } else {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              damping: 80,
              stiffness: 250,
            }),
            Animated.spring(opacity, {
              toValue: 1,
              useNativeDriver: true,
            }),
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
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 1000,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
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
    if (diffDays === 1) return { text: "Tomorrow", isUrgent: true };
    if (diffDays <= 3)
      return { text: `${diffDays} days (Soon)`, isUrgent: true };
    return { text: `${diffDays} days`, isUrgent: false };
  };

  const handleButtonPress = (action: () => void) => {
    // Add button press animation
    Animated.sequence([
      Animated.timing(scaleButtons, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleButtons, {
        toValue: 1,
        duration: 100,
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
        // Show loading indicator
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
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const saveNotes = () => {
    // Here you would typically call an API to save notes
    // For now, we'll just show a success indicator
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        accessibilityLabel="Close subscription details"
        accessibilityHint="Dismisses the subscription modal"
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
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.headerContainer}>
            <View style={styles.handleIndicator}>
              <View style={styles.handleBar} />
            </View>
            <TouchableOpacity
              onPress={onDismiss}
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
          >
            {/* Logo and Title Section */}
            <View style={styles.logoSection}>
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    backgroundColor: `${logoColor}20`,
                    shadowColor: logoColor,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
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
                      size={16}
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
            </View>

            {/* Action Buttons */}
            <Animated.View
              style={[
                styles.actionButtons,
                { transform: [{ scale: scaleButtons }] },
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
              />
            </Animated.View>

            {/* Notes Section */}
            <View style={styles.notesCard}>
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
                  setNotesHeight(e.nativeEvent.contentSize.height)
                }
              />
              <TouchableOpacity
                style={styles.saveNotesButton}
                onPress={saveNotes}
                accessibilityLabel="Save notes"
                accessibilityHint="Saves your notes for this subscription"
              >
                <Text style={styles.saveNotesText}>Save Notes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const DetailRow = ({ icon, label, value, capitalize = false }: any) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabelContainer}>
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color="#64748B"
          style={styles.detailIcon}
        />
      )}
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
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
    style={[
      styles.actionButton,
      isConfirm && { backgroundColor: color },
      {
        shadowColor: color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityLabel={label}
    accessibilityRole="button"
  >
    <Ionicons name={icon} size={22} color={isConfirm ? "white" : color} />
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
    paddingTop: 32,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 24,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  handleIndicator: {
    flex: 1,
    alignItems: "center",
  },
  handleBar: {
    width: 48,
    height: 5,
    backgroundColor: "#CBD5E1",
    borderRadius: 3,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  logoSection: {
    alignItems: "center",
    marginVertical: 24,
    gap: 16,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  yearlyPrice: {
    fontSize: 13,
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
    fontSize: 15,
    color: "#64748B",
  },
  renewalContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  alertIcon: {
    marginRight: 4,
  },
  renewalText: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
  },
  urgentText: {
    color: "#F59E0B",
    fontWeight: "600",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#64748B",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailIcon: {
    width: 18,
  },
  cardValue: {
    fontSize: 15,
    fontWeight: "500",
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
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  notesCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  notesInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: "#0F172A",
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  saveNotesButton: {
    backgroundColor: "#2F80ED",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "flex-end",
    marginTop: 16,
    shadowColor: "#2F80ED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveNotesText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default SubscriptionModal;
