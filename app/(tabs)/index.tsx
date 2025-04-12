import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Components/Home/Header";
import CategorySelector from "../Components/Home/CateogrySelctor";
import SubscriptionList from "../Components/Home/SubscriptionList";
import SubscriptionModal from "../Components/SubscriptionModal";
import React, { useState, useEffect } from "react";
import { Subscription } from "../Components/Calender/types";
import { getAllSubscriptions } from "../utils/subscriptionLogic";

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [upcomingRenewal, setUpcomingRenewal] = useState<Subscription | null>(
    null
  );
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const data = await getAllSubscriptions();
      if (data) {
        setSubscriptions(data);
        // Calculate total monthly cost
        const total = data.reduce((sum, sub) => sum + sub.price, 0);
        setTotalMonthly(total);

        // Find next upcoming renewal
        const nextRenewal =
          data.length > 0
            ? data.reduce((prev, current) =>
                new Date(prev.renewalDate) < new Date(current.renewalDate)
                  ? prev
                  : current
              )
            : null;
        setUpcomingRenewal(nextRenewal);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleAddPress = () => {
    console.log("Add subscription pressed");
  };

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-primary">
      <Header
        userName="John Doe"
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
        onDelete={(sub) => console.log("Delete subscription:", sub)}
      />
    </SafeAreaView>
  );
}
