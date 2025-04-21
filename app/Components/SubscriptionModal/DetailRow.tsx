import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles/SubscriptionModalStyles";

interface DetailRowProps {
  icon: string;
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
  <View style={styles.detailRow}>
    <View style={styles.detailLabelContainer}>
      {icon && (
        <Ionicons
          name={icon}
          size={16}
          color="#64748B"
          style={styles.detailIcon}
        />
      )}
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
    <Text style={[styles.cardValue, capitalize && styles.capitalize]}>
      {value}
    </Text>
  </View>
);
