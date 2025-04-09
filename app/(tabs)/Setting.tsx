import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const Setting = () => {
  const handleLogout = () => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Ask for confirmation
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            // TODO: Implement actual logout logic like clearing tokens/session
            // Clear user session/token/data here

            // Navigate to auth screen - Update the path to the new auth location
            router.replace("/(auth)/index");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const SettingItem = ({
    icon,
    title,
    onPress,
  }: {
    icon: string;
    title: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      className="flex-row items-center py-4 px-6 border-b border-gray-800"
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={24} color="white" />
      <Text className="text-white ml-4 text-lg">{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-primary mt-24">
      <ScrollView>
        <View className="py-4">
          <Text className="text-gray-400 px-6 py-2 text-sm">Account</Text>
          <SettingItem icon="person-outline" title="Account" />
          <SettingItem icon="notifications-outline" title="Notifications" />
          <SettingItem icon="lock-closed-outline" title="Privacy" />
        </View>

        <View className="py-4">
          <Text className="text-gray-400 px-6 py-2 text-sm">Preferences</Text>
          <SettingItem icon="language-outline" title="Language" />
          <SettingItem icon="moon-outline" title="Dark Mode" />
          <SettingItem icon="help-circle-outline" title="Help & Support" />
        </View>

        <View className="py-4">
          <Text className="text-gray-400 px-6 py-2 text-sm">About</Text>
          <SettingItem icon="information-circle-outline" title="About Pace" />
          <SettingItem icon="document-text-outline" title="Terms of Service" />
          <SettingItem icon="shield-checkmark-outline" title="Privacy Policy" />
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 px-6 mt-4"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="text-red-500 ml-4 text-lg font-semibold">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Setting;
