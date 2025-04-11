import React, { memo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SocialLoginButtonProps {
  provider: "google" | "apple";
  onPress: () => void;
  disabled?: boolean;
}

const SocialLoginButton = memo(
  ({ provider, onPress, disabled }: SocialLoginButtonProps) => {
    const iconName = provider === "google" ? "logo-google" : "logo-apple";
    const label = provider.charAt(0).toUpperCase() + provider.slice(1);

    return (
      <TouchableOpacity
        className="bg-white/20 p-4 rounded-xl active:opacity-80 transition-all duration-200 hover:bg-white/30"
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Sign in with ${label}`}
        accessibilityHint={`Opens ${label} authentication`}
      >
        <View className="flex-row items-center">
          <Ionicons name={iconName} size={24} color="white" className="mr-2" />
          <Text className="text-white font-medium">{label}</Text>
        </View>
      </TouchableOpacity>
    );
  }
);

SocialLoginButton.displayName = "SocialLoginButton";

export default SocialLoginButton;
