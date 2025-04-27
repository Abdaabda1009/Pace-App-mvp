import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "nativewind";
import tw from "tailwind-react-native-classnames";

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color: "primary" | "secondary"; // Only allow colors with light/dark variants
  isConfirm?: boolean;
  isLoading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  color,
  isConfirm = false,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TouchableOpacity
      className={`flex-1 items-center py-4 rounded-2xl ${
        isConfirm
          ? `bg-light-${color} dark:bg-${color}`
          : "bg-slate-50 dark:bg-primary"
      } shadow-sm`}
      style={{
        shadowColor: isDark ? colors[color] : colors.light[color],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
      }}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isLoading}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            isConfirm ? "white" : isDark ? colors[color] : colors.light[color]
          }
        />
      ) : (
        <>
          <Ionicons
            name={icon}
            size={22}
            className={
              isConfirm
                ? "text-white"
                : `text-light-${color} dark:text-${color}`
            }
          />
          <Text
            className={`mt-2 text-sm font-semibold ${
              isConfirm
                ? "text-white"
                : `text-light-${color} dark:text-${color}`
            }`}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// Colors should be imported from your actual theme configuration
const colors = {
  light: {
    primary: "rgba(245, 248, 250, 1)",
    secondary: "rgba(220, 230, 235, 1)",
  },
  primary: "rgba(18, 28, 41, 1)",
  secondary: "rgba(110, 130, 140, 1)",
};
