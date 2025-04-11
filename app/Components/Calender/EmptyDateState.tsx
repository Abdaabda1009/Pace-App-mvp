import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "nativewind";

export const EmptyDateState = () => {
  return (
    <View
      className="items-center justify-center h-4"
      accessibilityLabel="No subscriptions for this date"
    >
      <Ionicons name="calendar-clear-outline" size={12} color="#fffff" />
    </View>
  );
};

export default EmptyDateState;
