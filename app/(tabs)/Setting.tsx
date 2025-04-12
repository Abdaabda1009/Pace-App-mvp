import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const Setting = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => router.replace("./(auth)/index"),
      },
    ]);
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
      className="flex-row items-center py-4 px-6 border-b border-light-secondary dark:border-secondary"
      onPress={onPress}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={isDarkMode ? "#FFFFFF" : "#212B36"}
      />
      <Text className="text-light-text dark:text-textLight ml-4 text-lg">
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      className={`flex-1 bg-light-background dark:bg-primary mt-24 ${
        isDarkMode ? "dark" : ""
      }`}
    >
      <ScrollView>
        <View className="py-4">
          <Text className="text-light dark:text-secondary px-6 py-2 text-sm">
            Account
          </Text>
          <SettingItem icon="person-outline" title="Account" />
          <SettingItem icon="notifications-outline" title="Notifications" />
          <SettingItem icon="lock-closed-outline" title="Privacy" />
        </View>

        <View className="py-4">
          <Text className="text-light-secondary dark:text-secondary px-6 py-2 text-sm">
            Preferences
          </Text>
          <SettingItem icon="language-outline" title="Language" />
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            onPress={toggleDarkMode}
          />
          <SettingItem icon="help-circle-outline" title="Help & Support" />
        </View>

        <View className="py-4">
          <Text className="text-light-secondary dark:text-secondary px-6 py-2 text-sm">
            About
          </Text>
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
