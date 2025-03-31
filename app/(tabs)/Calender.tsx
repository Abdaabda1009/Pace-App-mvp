import React, { useCallback } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { DateObject, Subscription } from "../Components/Calender";
import { MonthNavigator } from "../Components/Calender/MonthNavigator";
import { DayHeaders } from "../Components/Calender/DayHeaders";
import  CalendarGrid  from "../Components/Calender/CalendarGrid";

interface CalendarProps {
  currentDate: Date;
  onNavigateMonth: (direction: "prev" | "next") => void;
  subscriptions: Subscription[];
  selectedDate: DateObject | null;
  onDatePress: (date: DateObject) => void;
  onSubscriptionPress: (subscription: Subscription) => void;
  onDateLongPress?: (
    date: DateObject,
    dateSubscriptions: Subscription[]
  ) => void;
}

export const Calendar = ({
  currentDate,
  onNavigateMonth,
  subscriptions,
  selectedDate,
  onDatePress,
  onSubscriptionPress,
  onDateLongPress,
}: CalendarProps) => {
  const handleMonthNavigation = useCallback(
    (direction: "prev" | "next") => {
      Haptics.selectionAsync();
      onNavigateMonth(direction);
    },
    [onNavigateMonth]
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="mb-4 px-4">
        {/* Month Navigator */}
        <MonthNavigator
          currentDate={currentDate}
          onNavigateMonth={handleMonthNavigation}
        />

        {/* Calendar */}
        <View className="bg-white/10 rounded-2xl overflow-hidden mb-4">
          <DayHeaders />
          <View className="h-2" />
          <CalendarGrid
            currentDate={currentDate}
            onNavigateMonth={onNavigateMonth}
            subscriptions={subscriptions}
            selectedDate={selectedDate}
            onDatePress={onDatePress}
            onSubscriptionPress={onSubscriptionPress}
            onDateLongPress={onDateLongPress}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Calendar;
