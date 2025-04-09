import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { DateObject, Subscription } from "../Components/Calender/types";
import { MonthNavigator } from "../Components/Calender/MonthNavigator";
import { DayHeaders } from "../Components/Calender/DayHeaders";
import CalendarGrid from "../Components/Calender/CalendarGrid";

const Calender = () => {
  // Initialize with current date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);

  // Mock subscriptions data - replace with actual data
  const [subscriptions] = useState<Subscription[]>([]);

  const handleNavigateMonth = useCallback(
    (direction: "prev" | "next") => {
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
    setSelectedDate(date);
  }, []);

  const handleSubscriptionPress = useCallback((subscription: Subscription) => {
    // Handle subscription press
    console.log("Subscription pressed:", subscription);
  }, []);

  const handleDateLongPress = useCallback(
    (date: DateObject, dateSubscriptions: Subscription[]) => {
      // Handle date long press
      console.log("Date long pressed:", date, dateSubscriptions);
    },
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="mb-4 px-4">
        {/* Month Navigator */}
        <MonthNavigator
          currentDate={currentDate}
          onNavigateMonth={handleNavigateMonth}
        />

        {/* Calendar */}
        <View className="bg-white/10 rounded-2xl overflow-hidden mb-4">
          <DayHeaders />
          <View className="h-2" />
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
