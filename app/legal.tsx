import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type LegalTab = "privacy" | "terms";

const Legal = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [activeTab, setActiveTab] = useState<LegalTab>("privacy");

  const handleTabPress = (tab: LegalTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View className="flex-1 bg-light-background dark:bg-primary">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Legal",
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} className="ml-2">
              <Ionicons
                name="arrow-back"
                size={24}
                color={isDarkMode ? "#FFFFFF" : "#212B36"}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-row border-b border-light-secondary dark:border-secondary">
        <TouchableOpacity
          className={`flex-1 items-center py-4 ${
            activeTab === "privacy"
              ? "border-b-2 border-brandBlue"
              : "border-b border-light-secondary dark:border-secondary"
          }`}
          onPress={() => handleTabPress("privacy")}
        >
          <Text
            className={`text-base font-medium ${
              activeTab === "privacy"
                ? "text-brandBlue dark:text-brandBlue/90"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Privacy Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 items-center py-4 ${
            activeTab === "terms"
              ? "border-b-2 border-brandBlue"
              : "border-b border-light-secondary dark:border-secondary"
          }`}
          onPress={() => handleTabPress("terms")}
        >
          <Text
            className={`text-base font-medium ${
              activeTab === "terms"
                ? "text-brandBlue dark:text-brandBlue/90"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Terms of Use
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {activeTab === "privacy" ? (
          <View>
            <Text className="text-2xl font-bold text-light-text dark:text-textLight mb-6">
              Privacy Policy
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              Last updated: {new Date().toLocaleDateString()}
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              Your privacy is important to us. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you
              use our mobile application.
            </Text>
            {/* Add more privacy policy content here */}
          </View>
        ) : (
          <View>
            <Text className="text-2xl font-bold text-light-text dark:text-textLight mb-6">
              Terms of Use
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              Last updated: {new Date().toLocaleDateString()}
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              Please read these Terms of Use carefully before using our mobile
              application. By accessing or using the app, you agree to be bound
              by these Terms.
            </Text>
            {/* Add more terms of use content here */}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Legal;
