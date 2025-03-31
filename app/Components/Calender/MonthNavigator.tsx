import React, { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatMonthYear } from "./utils";
import { Haptics } from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "nativewind";


interface MonthNavigatorProps {
  currentDate: Date;
  onNavigateMonth: (direction: "prev" | "next") => void;
}

export const MonthNavigator = ({
  currentDate,
  onNavigateMonth,
}: MonthNavigatorProps) => {
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 300 });
  }, [currentDate]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePress = (direction: "prev" | "next") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigateMonth(direction);
  };

  return (
    <Animated.View
      className="flex-row justify-between items-center mb-2 mx-4"
      style={{ paddingTop: insets.top }}
    >
      <TouchableOpacity
        className="p-2 rounded-2xl bg-white/5 active:bg-white/10"
        onPress={() => handlePress("prev")}
        accessibilityLabel="Previous month"
        accessibilityHint="Double tap to navigate to the previous month"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-back" size={24} className="text-white" />
      </TouchableOpacity>

      <Animated.Text
        className="text-2xl font-bold text-white"
        style={animatedStyle}
        accessibilityLabel={formatMonthYear(currentDate)}
        accessibilityRole="header"
      >
        {formatMonthYear(currentDate)}
      </Animated.Text>

      <TouchableOpacity
        className="p-2 rounded-2xl bg-white/5 active:bg-white/10"
        onPress={() => handlePress("next")}
        accessibilityLabel="Next month"
        accessibilityHint="Double tap to navigate to the next month"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-forward" size={24} className="text-white" />
      </TouchableOpacity>
    </Animated.View>
  );
};
