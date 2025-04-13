import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Components/Home/Header";
import CategorySelector from "../Components/Home/CateogrySelctor";
import SubscriptionList from "../Components/Home/SubscriptionList";
import SubscriptionModal from "../Components/SubscriptionModal";
import React, { useState, useEffect, useCallback } from "react";
import { Subscription } from "../Components/Calender/types";
import { getAllSubscriptions } from "../utils/subscriptionLogic";
import { useFocusEffect } from "@react-navigation/native";
import { useProfile } from "../context/ProfileContext";

export default function Index() {
  const { profile } = useProfile();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [upcomingRenewal, setUpcomingRenewal] = useState<Subscription | null>(
    null
  );
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const updateHeaderData = useCallback((data: Subscription[]) => {
    // Calculate total monthly cost
    const total = data.reduce((sum, sub) => sum + sub.price, 0);
    setTotalMonthly(total);

    // Find next upcoming renewal
    const today = new Date();
    const upcomingSubscriptions = data.filter(
      (sub) => new Date(sub.renewalDate) >= today
    );

    const nextRenewal =
      upcomingSubscriptions.length > 0
        ? upcomingSubscriptions.reduce((prev, current) =>
            new Date(prev.renewalDate) < new Date(current.renewalDate)
              ? prev
              : current
          )
        : null;

    setUpcomingRenewal(nextRenewal);
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    const data = await getAllSubscriptions();
    if (data) {
      setSubscriptions(data);
      updateHeaderData(data);
    }
  }, [updateHeaderData]);

  // Fetch data on mount and when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions();
    }, [fetchSubscriptions])
  );

  const handleAddPress = () => {
    console.log("Add subscription pressed");
  };

  const handleDeleteSubscription = async (subscription: Subscription) => {
    // Remove the subscription from the list
    const updatedSubscriptions = subscriptions.filter(
      (sub) => sub.id !== subscription.id
    );
    setSubscriptions(updatedSubscriptions);
    updateHeaderData(updatedSubscriptions);
  };

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-primary">
      <Header
        userName={profile?.full_name || "Guest"}
        totalMonthly={totalMonthly}
        upcomingRenewal={upcomingRenewal}
        onProfilePress={() => console.log("Profile pressed")}
      />

      <CategorySelector
        categories={[
          "All",
          "Streaming",
          "Utilities",
          "Entertainment",
          "Productivity",
          "Finance",
          "Web Services",
          "Others",
        ]}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <SubscriptionList
        onAddPress={handleAddPress}
        onSubscriptionPress={(sub) => setSelectedSubscription(sub)}
        listBottomPadding={100}
        selectedCategory={selectedCategory}
      />

      <SubscriptionModal
        visible={!!selectedSubscription}
        subscription={selectedSubscription}
        onDismiss={() => setSelectedSubscription(null)}
        onEdit={(sub) => console.log("Edit subscription:", sub)}
        onPause={(sub) => console.log("Pause subscription:", sub)}
        onDelete={handleDeleteSubscription}
      />
    </SafeAreaView>
  );
}
