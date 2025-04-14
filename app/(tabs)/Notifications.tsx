import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  useColorScheme,
  Platform,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ExpoNotifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../utils/supabase";
import { Subscription } from "../types";

// Configure notification handler
ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationsScreen = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    subscriptionReminders: true,
    paymentReminders: true,
  });
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    registerForPushNotificationsAsync();
    loadNotificationSettings();
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("renewal_date", { ascending: true });

      if (error) throw error;
      if (data) setSubscriptions(data);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("notificationSettings");
      if (savedSettings) {
        setNotifications(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  const saveNotificationSettings = async (
    newSettings: typeof notifications
  ) => {
    try {
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify(newSettings)
      );
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === "android") {
      await ExpoNotifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: ExpoNotifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await ExpoNotifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await ExpoNotifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await ExpoNotifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  };

  const scheduleSubscriptionNotification = async (
    subscription: Subscription
  ) => {
    const renewalDate = new Date(subscription.renewal_date);
    const now = new Date();

    // Only schedule if renewal date is in the future
    if (renewalDate > now) {
      const trigger = {
        date: renewalDate,
        channelId: "subscription-reminders",
      } as ExpoNotifications.NotificationTriggerInput;

      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: "Subscription Renewal",
          body: `${subscription.name} will renew today for ${subscription.price} ${subscription.currency}`,
          data: { subscriptionId: subscription.id },
        },
        trigger,
      });
    }
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
    const newSettings = {
      ...notifications,
      [key]: !notifications[key],
    };

    setNotifications(newSettings);
    await saveNotificationSettings(newSettings);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // If subscription reminders are enabled, schedule notifications for all subscriptions
    if (key === "subscriptionReminders" && newSettings.subscriptionReminders) {
      for (const subscription of subscriptions) {
        await scheduleSubscriptionNotification(subscription);
      }
    }
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const SettingItem = ({
    title,
    value,
    onValueChange,
    icon,
  }: {
    title: string;
    value: boolean;
    onValueChange: () => void;
    icon?: string;
  }) => (
    <View className="flex-row items-center justify-between py-4 px-6 border-b border-light-secondary dark:border-secondary">
      <View className="flex-row items-center">
        {icon && (
          <Ionicons
            name={icon as any}
            size={24}
            color={isDarkMode ? "#FFFFFF" : "#000000"}
            style={{ marginRight: 12 }}
          />
        )}
        <Text
          className="text-light-text dark:text-textLight text-lg"
          style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
        >
          {title}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={value ? "#3b82f6" : "#f4f3f4"}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-light-background dark:bg-primary mt-24">
      <ScrollView>
        <View className="py-4">
          <Text className="text-light dark:text-white/60 px-6 py-2 text-sm">
            Notification Settings
          </Text>
          <SettingItem
            title="Email Notifications"
            value={notifications.emailNotifications}
            onValueChange={() => toggleNotification("emailNotifications")}
            icon="mail-outline"
          />
          <SettingItem
            title="Push Notifications"
            value={notifications.pushNotifications}
            onValueChange={() => toggleNotification("pushNotifications")}
            icon="notifications-outline"
          />
          <SettingItem
            title="Subscription Reminders"
            value={notifications.subscriptionReminders}
            onValueChange={() => toggleNotification("subscriptionReminders")}
            icon="calendar-outline"
          />
          <SettingItem
            title="Payment Reminders"
            value={notifications.paymentReminders}
            onValueChange={() => toggleNotification("paymentReminders")}
            icon="card-outline"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;
