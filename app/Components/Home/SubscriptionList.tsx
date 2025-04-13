import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
  Animated,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Subscription } from "../../Components/Calender/types";
import {
  getAllSubscriptions,
  deleteSubscription,
} from "../../utils/subscriptionLogic";
import { useFocusEffect } from "@react-navigation/native";
import { getLogoData } from "../../utils/logoUtils";

interface SubscriptionListProps {
  onAddPress: () => void;
  onSubscriptionPress: (subscription: Subscription) => void;
  listBottomPadding?: number;
  selectedCategory?: string;
}

type SortOption = "price" | "alphabetical" | "date" | "none";
type SortOrder = "asc" | "desc";

const SubscriptionListItem = React.memo(
  ({
    item,
    onPress,
    onDelete,
  }: {
    item: Subscription;
    onPress: () => void;
    onDelete: () => void;
  }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const [logoData, setLogoData] = useState<{
      url: string;
      color: string;
    } | null>(null);

    useEffect(() => {
      const loadLogo = async () => {
        const data = await getLogoData(item.name);
        setLogoData(data);
      };
      loadLogo();
    }, [item.name]);

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const daysUntilRenewal = (
      renewalDate: string
    ): { text: string; isUrgent: boolean } => {
      const today = new Date();
      const renewal = new Date(renewalDate);
      const diffDays = Math.ceil(
        (renewal.getTime() - today.getTime()) / (1000 * 3600 * 24)
      );

      if (diffDays <= 0) return { text: "Due today", isUrgent: true };
      if (diffDays <= 3)
        return { text: `${diffDays} days (Soon)`, isUrgent: true };
      return { text: `${diffDays} days`, isUrgent: false };
    };

    const renewalInfo = daysUntilRenewal(item.renewalDate);
    const logoColor = logoData?.color || "#2F80ED";

    return (
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
      >
        <TouchableOpacity
          className="flex-row bg-light-card rounded-2xl p-4 mb-4 items-center border-2 border-black/20 dark:bg-dark-card dark:border-dark-border"
          onPress={onPress}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <View
            className="w-12 h-12 rounded-xl justify-center items-center"
            style={{ backgroundColor: `${logoColor}20` }}
          >
            {logoData ? (
              <Image
                source={{ uri: logoData.url }}
                className="w-10 h-10 rounded-xl"
                resizeMode="contain"
                accessibilityLabel={`${item.name} logo`}
              />
            ) : (
              <ActivityIndicator size="small" color={logoColor} />
            )}
          </View>

          <View className="flex-1 ml-4">
            <Text className="text-light-foreground text-lg font-semibold mb-1 dark:text-white">
              {item.name}
            </Text>
            <View className="flex-row items-center">
              <View
                className="px-2 py-1 rounded-md"
                style={{ backgroundColor: `${logoColor}20` }}
              >
                <Text className="text-xs" style={{ color: logoColor }}>
                  {item.category}
                </Text>
              </View>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-light-foreground text-lg font-bold dark:text-white">
              ${item.price.toFixed(2)}
            </Text>
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
                  renewalInfo.isUrgent ? "text-amber-600" : "text-white/50"
                }`}
              >
                {renewalInfo.text}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const SubscriptionList: React.FC<SubscriptionListProps> = ({
  onAddPress,
  onSubscriptionPress,
  listBottomPadding = 100,
  selectedCategory = "All",
}) => {
  const insets = useSafeAreaInsets();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("none");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [showDropdown, setShowDropdown] = useState(false);
  const lastRefreshTime = useRef<number>(0);
  const refreshTimeout = useRef<NodeJS.Timeout>();
  const retryCount = useRef(0);
  const maxRetries = 3;

  const fetchSubscriptions = useCallback(async (force = false) => {
    // Prevent too frequent refreshes (minimum 2 seconds between refreshes)
    const now = Date.now();
    if (!force && now - lastRefreshTime.current < 2000) {
      return;
    }

    try {
      console.log("Starting subscription fetch...");
      setError(null);
      if (force) {
        setRefreshing(true);
      }

      const data = await getAllSubscriptions();
      console.log("Received subscription data:", data);

      if (!data && retryCount.current < maxRetries) {
        console.warn("No data received, retrying...");
        retryCount.current += 1;
        // Exponential backoff for retries
        setTimeout(
          () => fetchSubscriptions(force),
          Math.pow(2, retryCount.current) * 1000
        );
        return;
      }

      if (!data) {
        console.warn("No data received from getAllSubscriptions after retries");
        setError("Failed to load subscriptions. No data received.");
        return;
      }

      setSubscriptions(data);
      console.log("Subscriptions state updated:", data.length, "items");
      lastRefreshTime.current = now;
      retryCount.current = 0; // Reset retry count on success
    } catch (error) {
      console.error("Error in fetchSubscriptions:", error);
      if (retryCount.current < maxRetries) {
        console.warn(
          `Retry attempt ${retryCount.current + 1} of ${maxRetries}`
        );
        retryCount.current += 1;
        setTimeout(
          () => fetchSubscriptions(force),
          Math.pow(2, retryCount.current) * 1000
        );
      } else {
        setError("Failed to load subscriptions. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    console.log("Component mounted, fetching initial data...");
    fetchSubscriptions(true);
    return () => {
      // Reset retry count when component unmounts
      retryCount.current = 0;
    };
  }, []);

  // Enhanced focus effect with immediate and delayed refresh
  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, refreshing data...");

      // Immediate refresh
      fetchSubscriptions(true);

      // Delayed refresh to catch any pending database updates
      const delayedRefresh = setTimeout(() => {
        console.log("Performing delayed refresh...");
        fetchSubscriptions(true);
      }, 1000);

      // Set up periodic refresh (every 5 minutes)
      refreshTimeout.current = setInterval(() => {
        console.log("Periodic refresh triggered");
        fetchSubscriptions(true);
      }, 5 * 60 * 1000);

      return () => {
        if (refreshTimeout.current) {
          clearInterval(refreshTimeout.current);
        }
        clearTimeout(delayedRefresh);
      };
    }, [fetchSubscriptions])
  );

  const handleRefresh = useCallback(async () => {
    console.log("Manual refresh triggered");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await fetchSubscriptions(true);
  }, [fetchSubscriptions]);

  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  const handleFilterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDropdown(!showDropdown);
  };

  const handleSortOptionPress = (option: SortOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (option === sortOption) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortOption(option);
      setSortOrder("asc");
    }
    setShowDropdown(false);
  };

  const getSortedSubscriptions = useCallback(() => {
    let sorted = [...subscriptions];

    if (selectedCategory !== "All") {
      sorted = sorted.filter(
        (sub) => sub.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    switch (sortOption) {
      case "price":
        sorted.sort((a, b) =>
          sortOrder === "asc" ? a.price - b.price : b.price - a.price
        );
        break;
      case "alphabetical":
        sorted.sort((a, b) =>
          sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
        break;
      case "date":
        sorted.sort((a, b) => {
          const dateA = new Date(a.renewalDate);
          const dateB = new Date(b.renewalDate);
          return sortOrder === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        });
        break;
    }

    return sorted;
  }, [subscriptions, selectedCategory, sortOption, sortOrder]);

  const handleDelete = async (subscription: Subscription) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Alert.alert(
      "Delete Subscription",
      `Are you sure you want to delete ${subscription.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await deleteSubscription(subscription.id);
              if (success) {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
                setSubscriptions((prev) =>
                  prev.filter((sub) => sub.id !== subscription.id)
                );
              } else {
                Alert.alert(
                  "Error",
                  "Failed to delete subscription. Please try again."
                );
              }
            } catch (error) {
              console.error("Error deleting subscription:", error);
              Alert.alert(
                "Error",
                "An unexpected error occurred. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center px-4 bg-background dark:bg-darkBackground">
        <Text className="text-textPrimary/80 dark:text-darkTextPrimary/80 text-lg font-semibold mb-2 text-center">
          {error}
        </Text>
        <TouchableOpacity
          className="bg-brandBlue px-8 py-3 rounded-full"
          onPress={() => handleRefresh()}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 px-4 bg-background dark:bg-darkBackground">
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-textPrimary dark:text-white text-xl font-bold">
            Subscriptions
          </Text>
          <Text className="text-textSecondary dark:text-white text-sm">
            {getSortedSubscriptions().length}{" "}
            {getSortedSubscriptions().length === 1
              ? "subscription"
              : "subscriptions"}{" "}
            found
          </Text>
        </View>
        <View>
          <TouchableOpacity
            className="flex-row items-center bg-brandBlue/10 px-4 py-2 rounded-full"
            onPress={handleFilterPress}
            activeOpacity={0.7}
          >
            <Ionicons name="filter" size={20} color="#2F80ED" />
            <Text className="text-brandBlue ml-2 font-semibold">Filter</Text>
          </TouchableOpacity>

          {showDropdown && (
            <View className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-48">
              <TouchableOpacity
                className="flex-row items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700"
                onPress={() => handleSortOptionPress("price")}
              >
                <View className="flex-row items-center">
                  <Ionicons name="cash-outline" size={20} color="#6B7280" />
                  <Text className="ml-3 text-gray-900 dark:text-white">
                    Price
                  </Text>
                </View>
                {sortOption === "price" && (
                  <Ionicons
                    name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
                    size={16}
                    color="#2F80ED"
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700"
                onPress={() => handleSortOptionPress("alphabetical")}
              >
                <View className="flex-row items-center">
                  <Ionicons name="text-outline" size={20} color="#6B7280" />
                  <Text className="ml-3 text-gray-900 dark:text-white">
                    Alphabetical
                  </Text>
                </View>
                {sortOption === "alphabetical" && (
                  <Ionicons
                    name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
                    size={16}
                    color="#2F80ED"
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700"
                onPress={() => handleSortOptionPress("date")}
              >
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                  <Text className="ml-3 text-gray-900 dark:text-white">
                    Renewal Date
                  </Text>
                </View>
                {sortOption === "date" && (
                  <Ionicons
                    name={sortOrder === "asc" ? "arrow-up" : "arrow-down"}
                    size={16}
                    color="#2F80ED"
                  />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center p-3"
                onPress={() => {
                  setSortOption("none");
                  setShowDropdown(false);
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#6B7280"
                  />
                  <Text className="ml-3 text-gray-900 dark:text-white">
                    Clear Sort
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {getSortedSubscriptions().length > 0 ? (
        <FlatList
          data={getSortedSubscriptions()}
          renderItem={({ item }) => (
            <SubscriptionListItem
              item={item}
              onPress={() => handlePress(() => onSubscriptionPress(item))}
              onDelete={() => handleDelete(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: listBottomPadding + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#2F80ED"
              colors={["#2F80ED"]}
              progressBackgroundColor="rgba(255,255,255,0.1)"
            />
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center py-10">
          <View className="bg-textPrimary/10 dark:bg-darkTextPrimary/10 p-6 rounded-full mb-4">
            <Ionicons name="wallet-outline" size={40} color="#2F80ED" />
          </View>
          <Text className="text-textPrimary/80 dark:text-white/80 text-lg font-semibold mb-2">
            No Subscriptions Found
          </Text>
          <Text className="text-textSecondary dark:text-white text-sm text-center px-8 mb-6">
            {selectedCategory === "All"
              ? "Start by adding your first subscription to manage your recurring expenses"
              : `No subscriptions found in the ${selectedCategory} category`}
          </Text>
        </View>
      )}
    </View>
  );
};

export default React.memo(SubscriptionList);
