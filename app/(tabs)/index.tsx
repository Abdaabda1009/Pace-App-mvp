import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../Components/Home/Header";
import CategorySelector from "../Components/Home/CateogrySelctor";
import SubscriptionList from "../Components/Home/SubscriptionList";
import SubscriptionModal from "../Components/SubscriptionModal";
import React, { useState } from "react";

// Temporary sample data
const sampleSubscriptions = [
  {
    id: "1",
    name: "Netflix",
    icon: "netflix",
    price: 15.99,
    renewalDate: "2023-12-15",
    category: "Streaming",
    color: "#E50914",
  },
];

const logoImages = {
  netflix: require("../../assets/images/Netflix.png"),
};

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<
    (typeof sampleSubscriptions)[0] | null
  >(null);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSubscriptionPress = (sub: (typeof sampleSubscriptions)[0]) => {
    setSelectedSubscription(sub);
  };

  const handleModalDismiss = () => {
    setSelectedSubscription(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <Header
        userName="John Doe"
        totalMonthly={89.99}
        upcomingRenewal={{
          name: "Netflix",
          renewalDate: "2023-12-15",
          price: 15.99,
        }}
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
        subscriptions={sampleSubscriptions}
        logoImages={logoImages}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onAddPress={() => console.log("Add subscription pressed")}
        onSubscriptionPress={handleSubscriptionPress}
        listBottomPadding={100}
      />

      <SubscriptionModal
        visible={!!selectedSubscription}
        subscription={selectedSubscription}
        onDismiss={handleModalDismiss}
        logoImages={logoImages}
      />
    </SafeAreaView>
  );
}
