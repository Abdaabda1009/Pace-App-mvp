import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

const Profile = () => {
  // Mock user data - replace with actual user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    subscriptionCount: 5,
    totalMonthly: 49.99,
    memberSince: "January 2024",
  };

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

            // Navigate to auth screen
            router.replace("/(auth)/index");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const ProfileSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-6">
      <Text className="text-gray-400 text-sm mb-2 px-6">{title}</Text>
      {children}
    </View>
  );

  const ProfileItem = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value: string;
  }) => (
    <View className="flex-row items-center py-3 px-6 border-b border-gray-800">
      <Ionicons name={icon as any} size={20} color="white" />
      <Text className="text-white ml-4 flex-1">{label}</Text>
      <Text className="text-gray-400">{value}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-primary mt-24">
      <ScrollView>
        {/* Profile Header */}
        <View className="items-center py-8">
          <View className="w-24 h-24 rounded-full bg-gray-700 items-center justify-center mb-4">
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text className="text-white text-2xl font-bold">{user.name}</Text>
          <Text className="text-gray-400 mt-1">{user.email}</Text>

          <TouchableOpacity className="mt-4 flex-row items-center">
            <Text className="text-accent text-white mr-2">Edit Profile</Text>
            <Ionicons name="pencil-outline" size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="flex-row justify-around py-4 border-y border-gray-800">
          <View className="items-center">
            <Text className="text-white text-xl font-bold">
              {user.subscriptionCount}
            </Text>
            <Text className="text-gray-400 text-sm">Subscriptions</Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-xl font-bold">
              ${user.totalMonthly}
            </Text>
            <Text className="text-gray-400 text-sm">Monthly</Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-xl font-bold">
              {user.memberSince}
            </Text>
            <Text className="text-gray-400 text-sm">Member Since</Text>
          </View>
        </View>

        {/* Account Information */}
        <ProfileSection title="ACCOUNT INFORMATION">
          <ProfileItem icon="mail-outline" label="Email" value={user.email} />
          <ProfileItem
            icon="calendar-outline"
            label="Member Since"
            value={user.memberSince}
          />
          <ProfileItem
            icon="card-outline"
            label="Payment Method"
            value="•••• 4242"
          />
        </ProfileSection>

        {/* Preferences */}
        <ProfileSection title="PREFERENCES">
          <ProfileItem
            icon="notifications-outline"
            label="Notifications"
            value="On"
          />
          <ProfileItem
            icon="language-outline"
            label="Language"
            value="English"
          />
          <ProfileItem icon="moon-outline" label="Dark Mode" value="On" />
        </ProfileSection>

        {/* Support */}
        <ProfileSection title="SUPPORT">
          <ProfileItem
            icon="help-circle-outline"
            label="Help Center"
            value=""
          />
          <ProfileItem
            icon="document-text-outline"
            label="Terms of Service"
            value=""
          />
          <ProfileItem
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            value=""
          />
        </ProfileSection>

        {/* Logout Button */}
        <View className="items-center my-6 px-6">
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 px-8 bg-red-500/10 rounded-lg"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 ml-3 font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;
