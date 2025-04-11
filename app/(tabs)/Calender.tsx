import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { DateObject, Subscription } from "../Components/Calender/types";
import { MonthNavigator } from "../Components/Calender/MonthNavigator";
import { DayHeaders } from "../Components/Calender/DayHeaders";
import CalendarGrid from "../Components/Calender/CalendarGrid";
import { logoImages } from "../Components/Calender/constants";

// Sample subscription data with proper icon references
const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    price: 15.99,
    category: "Entertainment",
    icon: "Netflix",
    color: "#E50914",
    renewalDate: "2025-04-15",
  },
  {
    id: "2",
    name: "Spotify",
    price: 9.99,
    category: "Music",
    icon: "Spotify",
    color: "#1DB954",
    renewalDate: "2025-04-15",
  },
  {
    id: "3",
    name: "Disney+",
    price: 7.99,
    category: "Entertainment",
    icon: "Disney",
    color: "#0063E5",
    renewalDate: "2025-04-22",
  },
];

const Calender = () => {
  // Initialize with current date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
  const [subscriptions] = useState<Subscription[]>(SAMPLE_SUBSCRIPTIONS);

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
    // Handle subscription press
    console.log("Subscription pressed:", subscription);
  }, []);

  const handleDateLongPress = useCallback(
    (date: DateObject, dateSubscriptions: Subscription[]) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Handle date long press
      console.log("Date long pressed:", date, dateSubscriptions);
    },
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-primary mt-4">
      <View className="flex-1 px-4 ">
        <MonthNavigator
          currentDate={currentDate}
          onNavigateMonth={handleNavigateMonth}
        />

        {/* Calendar Container */}
        <View className="flex-1 bg-white/10 rounded-2xl overflow-hidden mb-4">
          <CalendarGrid
            currentDate={currentDate}
            onNavigateMonth={handleNavigateMonth}
            subscriptions={subscriptions}
            selectedDate={selectedDate}
            onDatePress={handleDatePress}
            onSubscriptionPress={handleSubscriptionPress}
            onDateLongPress={handleDateLongPress}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Calender;
