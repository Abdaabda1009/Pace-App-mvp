import React, { useCallback, useState, useEffect } from "react";
import { View, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { DateObject, Subscription } from "../Components/Calender/types";
import { MonthNavigator } from "../Components/Calender/MonthNavigator";
import { DayHeaders } from "../Components/Calender/DayHeaders";
import CalendarGrid from "../Components/Calender/CalendarGrid";
import { SubscriptionPopover } from "../Components/Calender/SubscriptionPopover";
import SubscriptionModal from "../Components/SubscriptionModal";
import { getAllSubscriptions } from "../utils/subscriptionLogic";
import { getLogoData } from "../utils/logoUtils";
import { getSubscriptionsForDate } from "../Components/Calender/utils";

const Calender = () => {
  // Initialize with current date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    pageX: number;
    pageY: number;
  } | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const data = await getAllSubscriptions();

      // Fetch logos for each subscription
      const subscriptionsWithLogos = await Promise.all(
        data.map(async (subscription) => {
          const logoData = await getLogoData(subscription.name);
          return {
            ...subscription,
            logo: logoData.url,
            color: logoData.color,
          };
        })
      );

      setSubscriptions(subscriptionsWithLogos);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSubscriptions();
  }, []);

  const handleNavigateMonth = useCallback(
    (direction: "prev" | "next") => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newDate = new Date(currentDate);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      setCurrentDate(newDate);
    },
    [currentDate]
  );

  const handleDatePress = useCallback((date: DateObject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(date);
  }, []);

  const handleSubscriptionPress = useCallback((subscription: Subscription) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSubscription(subscription);
    setShowModal(true);
  }, []);

  const handleDateLongPress = useCallback(
    (
      date: DateObject,
      dateSubscriptions: Subscription[],
      cellMeasurement: any
    ) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSelectedDate(date);
      setPopoverPosition(cellMeasurement);
      setShowPopover(true);
    },
    []
  );

  const handleDismissPopover = useCallback(() => {
    setShowPopover(false);
    setPopoverPosition(null);
  }, []);

  const handleDismissModal = useCallback(() => {
    setShowModal(false);
    setSelectedSubscription(null);
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-light-primary dark:bg-primary mt-4">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-primary dark:bg-primary mt-4">
      <View className="flex-1 px-4">
        <MonthNavigator
          currentDate={currentDate}
          onNavigateMonth={handleNavigateMonth}
        />

        {/* Calendar Container */}
        <View className="flex-1 bg-light-secondary dark:bg-secondary rounded-2xl overflow-hidden mb-4">
          <CalendarGrid
            currentDate={currentDate}
            onNavigateMonth={handleNavigateMonth}
            subscriptions={subscriptions}
            selectedDate={selectedDate}
            onDatePress={handleDatePress}
            onSubscriptionPress={handleSubscriptionPress}
            onDateLongPress={handleDateLongPress}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>

        {/* Subscription Popover */}
        <SubscriptionPopover
          visible={showPopover}
          subscriptions={
            selectedDate
              ? getSubscriptionsForDate(subscriptions, selectedDate.dateString)
              : []
          }
          date={selectedDate?.dateString || ""}
          cellPosition={popoverPosition}
          onDismiss={handleDismissPopover}
          onSubscriptionPress={handleSubscriptionPress}
        />

        {/* Subscription Modal */}
        <SubscriptionModal
          visible={showModal}
          subscription={selectedSubscription}
          onDismiss={handleDismissModal}
        />
      </View>
    </SafeAreaView>
  );
};

export default Calender;
