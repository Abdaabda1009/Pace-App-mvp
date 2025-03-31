import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "nativewind";


export const EmptyDateState = () => {
  return (
    <View
      className="items-center justify-center h-6 mt-0"
      accessibilityLabel="No subscriptions for this date"
    >
      <Ionicons
        name="calendar-clear-outline"
        size={14}
        className="text-white/20" // Using Tailwind opacity modifier
      />
    </View>
  );
};
