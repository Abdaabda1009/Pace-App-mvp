import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles/SubscriptionModalStyles";

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
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
}) => (
  <TouchableOpacity
    style={[
      styles.actionButton,
      isConfirm && { backgroundColor: color },
      {
        shadowColor: color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
    disabled={isLoading}
    accessibilityLabel={label}
    accessibilityRole="button"
  >
    {isLoading ? (
      <ActivityIndicator size="small" color={isConfirm ? "white" : color} />
    ) : (
      <>
        <Ionicons name={icon} size={22} color={isConfirm ? "white" : color} />
        <Text
          style={[
            styles.actionButtonText,
            { color: isConfirm ? "white" : color },
          ]}
        >
          {label}
        </Text>
      </>
    )}
  </TouchableOpacity>
);
