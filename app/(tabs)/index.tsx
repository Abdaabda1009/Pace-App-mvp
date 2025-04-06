import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Components/Home/Header";
import CategorySelector from "../Components/Home/CateogrySelctor";
import SubscriptionList from "../Components/Home/SubscriptionList";
import SubscriptionModal from "../Components/SubscriptionModal";
import React, { useState } from "react";

// Empty subscriptions array
const sampleSubscriptions: Array<any> = [];

const logoImages = {
  netflix: require("../../assets/images/Netflix.png"),
  spotify: require("../../assets/images/Spotify.png"),
  amazon: require("../../assets/images/Amazon.png"),
};

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);

  // Calculate total monthly cost
  const totalMonthly = sampleSubscriptions.reduce(
    (sum, sub) => sum + sub.price,
    0
  );

  // Find next upcoming renewal
  const upcomingRenewal =
    sampleSubscriptions.length > 0
      ? sampleSubscriptions.reduce((prev, current) =>
          new Date(prev.renewalDate) < new Date(current.renewalDate)
            ? prev
            : current
        )
      : null;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddPress = () => {
    console.log("Add subscription pressed");
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
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

      {sampleSubscriptions.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-white text-lg font-semibold mb-2">
            No Subscriptions Found
          </Text>
          <Text className="text-gray-400 text-center mb-6">
            Start by adding your first subscription to keep track of{"\n"}
            your recurring expenses and renewal dates.
          </Text>
          <TouchableOpacity
            className="bg-accent py-3 px-6 rounded-lg"
            onPress={handleAddPress}
          >
            <Text className="text-white font-semibold">Add Subscription</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SubscriptionList
          subscriptions={sampleSubscriptions}
          logoImages={logoImages}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onAddPress={handleAddPress}
          onSubscriptionPress={(sub) => setSelectedSubscription(sub)}
          listBottomPadding={100}
        />
      )}

      <SubscriptionModal
        visible={!!selectedSubscription}
        subscription={selectedSubscription}
        onDismiss={() => setSelectedSubscription(null)}
        logoImages={logoImages}
      />
    </SafeAreaView>
  );
}
