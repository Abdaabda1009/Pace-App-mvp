import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  capitalize?: boolean;
}

export const DetailRow: React.FC<DetailRowProps> = ({
  icon,
  label,
  value,
  capitalize = false,
}) => (
  <View className="flex-row items-center py-3 px-4 bg-light-background dark:bg-primary">
    <View className="w-10 h-10 rounded-lg bg-light-secondary dark:bg-secondary justify-center items-center mr-4">
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          className="text-brandBlue dark:text-brandBlueGradient-colors-1"
        />
      )}
    </View>
    <View className="flex-1">
      <Text className="text-sm text-secondary dark:text-textLight/80 mb-1 font-medium">
        {label}
      </Text>
      <Text
        className={`text-lg text-textDark dark:text-textLight font-semibold ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </Text>
    </View>
  </View>
);
