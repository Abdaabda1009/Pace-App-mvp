import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "nativewind";
import tw from "tailwind-react-native-classnames";

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
  <View className="flex-row items-center py-3 px-4">
    <View className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 justify-center items-center mr-3">
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          className="text-gray-500 dark:text-slate-400"
        />
      )}
    </View>
    <View className="flex-1">
      <Text className="text-sm text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </Text>
      <Text
        className={`text-base text-slate-800 dark:text-slate-200 font-medium ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </Text>
    </View>
  </View>
);
