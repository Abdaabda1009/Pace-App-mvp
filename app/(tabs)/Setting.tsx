import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  useColorScheme,
  Linking,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../utils/supabase";

const Setting = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            // Clear the session and storage
            await supabase.auth.signOut();
            // Clear any additional stored data if needed
            await AsyncStorage.clear();
            // Navigate to auth screen
            await router.replace("/(auth)");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  const handleLegalPress = (type: "privacy" | "terms") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/legal",
      params: { initialTab: type },
    });
  };

  const handleAboutPacePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/Pace");
  };

  const handleAccountPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate("Account");
  };

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/Notifications");
  };

  const handleHelpSupportPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const url = "https://www.paceinv.com";
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open the Pace website, try again");
      }
    } catch (error) {
      console.error("Error opening URL:", error);
      Alert.alert("Error", "Failed to open the Pace website");
    }
  };

  const SettingItem = ({
    icon,
    title,
    onPress,
    subtitle,
  }: {
    icon: string;
    title: string;
    onPress?: () => void;
    subtitle?: string;
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
      <View className="flex-1 ml-4">
        <Text className="text-light-text dark:text-textLight text-lg">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-light-secondary dark:text-white/60 text-sm mt-1">
            {subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-light-background dark:bg-primary mt-24">
      <ScrollView>
        <View className="py-4">
          <Text className="text-light dark:text-white/60 px-6 py-2 text-sm">
            Account
          </Text>
          <SettingItem
            icon="person-outline"
            title="Account"
            onPress={handleAccountPress}
          />
          <SettingItem
            icon="notifications-outline"
            title="Notifications"
            onPress={handleNotificationPress}
          />
          <SettingItem
            icon="lock-closed-outline"
            title="Privacy"
            onPress={() => handleLegalPress("privacy")}
          />
        </View>

        <View className="py-4">
          <Text className="text-light-secondary dark:text-white/60 px-6 py-2 text-sm">
            Preferences
          </Text>
          <SettingItem
            icon="language-outline"
            title="Language"
            subtitle="This function is not supported yet"
          />
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={handleHelpSupportPress}
          />
        </View>

        <View className="py-4">
          <Text className="text-light-secondary dark:text-white/60 px-6 py-2 text-sm">
            About
          </Text>
          <SettingItem
            icon="information-circle-outline"
            title="About Pace"
            onPress={handleAboutPacePress}
          />
          <SettingItem
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => handleLegalPress("terms")}
          />
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center py-4 px-6 mt-4"
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="text-red-500 ml-4 text-lg font-semibold">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Setting;
