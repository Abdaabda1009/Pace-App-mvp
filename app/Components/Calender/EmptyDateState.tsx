import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "nativewind";

export const EmptyDateState = () => {
  return (
    <View
      className="items-center justify-center h-4 bg-light-background/10 dark:bg-primary"
      accessibilityLabel="No subscriptions for this date"
    >
      <Ionicons
        name="calendar-clear-outline"
        size={12}
        className="text-light-text dark:text-textLight"
      />
    </View>
  );
};

export default EmptyDateState;
