import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  useColorScheme,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useProfile } from "../context/ProfileContext";
import { supabase } from "../utils/supabase";

const Account = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const navigation = useNavigation();
  const { profile, loading, error, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editValues, setEditValues] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditValues({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile(editValues);
      setIsEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    });
  };

  const handlePasswordChange = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordValues;

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: profile?.email || "",
        password: currentPassword,
      });

      if (reauthError) {
        throw new Error("Current password is incorrect");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setPasswordValues({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      Alert.alert("Success", "Password changed successfully");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to change password. Please try again."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.auth.admin.deleteUser(
                profile?.id || ""
              );
              if (error) throw error;

              await supabase.auth.signOut();
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-light-background dark:bg-primary">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator
            size="large"
            color={isDarkMode ? "#FFFFFF" : "#000000"}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-light-background dark:bg-primary">
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}>
            Error: {error}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-primary">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-light-secondary dark:border-secondary">
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? "#FFFFFF" : "#000000"}
          />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold"
          style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
        >
          Account Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View className="mb-8">
          <Text
            className="text-xl font-semibold mb-4"
            style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
          >
            Account Settings
          </Text>

          <View className="mb-4">
            <Text
              className="text-sm mb-2"
              style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
            >
              Email
            </Text>
            <View className="flex-row items-center border border-light-secondary dark:border-secondary rounded-lg px-4 py-2">
              <MaterialIcons
                name="email"
                size={20}
                color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                style={{ marginRight: 8 }}
              />
              <Text
                className="flex-1"
                style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
              >
                {profile?.email}
              </Text>
            </View>
          </View>

          <View className="mb-4">
            <Text
              className="text-sm mb-2"
              style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
            >
              Full Name
            </Text>
            <View className="flex-row items-center border border-light-secondary dark:border-secondary rounded-lg px-4 py-2">
              <MaterialIcons
                name="person-outline"
                size={20}
                color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                style={{ marginRight: 8 }}
              />
              {isEditing ? (
                <TextInput
                  value={editValues.full_name}
                  onChangeText={(text) =>
                    setEditValues({ ...editValues, full_name: text })
                  }
                  className="flex-1"
                  style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
                  placeholder="Enter your full name"
                  placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                />
              ) : (
                <Text
                  className="flex-1"
                  style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
                >
                  {profile?.full_name || "Not set"}
                </Text>
              )}
            </View>
          </View>

          <View className="mb-4">
            <Text
              className="text-sm mb-2"
              style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
            >
              Phone Number
            </Text>
            <View className="flex-row items-center border border-light-secondary dark:border-secondary rounded-lg px-4 py-2">
              <MaterialIcons
                name="phone"
                size={20}
                color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                style={{ marginRight: 8 }}
              />
              {isEditing ? (
                <TextInput
                  value={editValues.phone}
                  onChangeText={(text) =>
                    setEditValues({ ...editValues, phone: text })
                  }
                  className="flex-1"
                  style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
                  placeholder="Enter your phone number"
                  placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text
                  className="flex-1"
                  style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
                >
                  {profile?.phone || "Not set"}
                </Text>
              )}
            </View>
          </View>

          {isEditing ? (
            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                onPress={handleCancel}
                className="px-4 py-2 rounded-lg border border-light-secondary dark:border-secondary"
              >
                <Text
                  style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
                  className="font-medium"
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className="bg-blue-500 dark:bg-blue-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleEdit}
              className="bg-blue-500 dark:bg-blue-600 py-2 rounded-lg items-center"
            >
              <Text className="text-white font-medium">Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Password Change Section */}
        <View className="mb-8">
          <Text
            className="text-xl font-semibold mb-4"
            style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
          >
            Password Settings
          </Text>

          <View className="mb-4">
            <Text
              className="text-sm mb-2"
              style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
            >
              Current Password
            </Text>
            <View className="flex-row items-center border border-light-secondary dark:border-secondary rounded-lg px-4 py-2">
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={passwordValues.currentPassword}
                onChangeText={(text) =>
                  setPasswordValues({
                    ...passwordValues,
                    currentPassword: text,
                  })
                }
                className="flex-1"
                style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
                placeholder="Enter current password"
                placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                secureTextEntry
              />
            </View>
          </View>

          <View className="mb-4">
            <Text
              className="text-sm mb-2"
              style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
            >
              New Password
            </Text>
            <View className="flex-row items-center border border-light-secondary dark:border-secondary rounded-lg px-4 py-2">
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={passwordValues.newPassword}
                onChangeText={(text) =>
                  setPasswordValues({ ...passwordValues, newPassword: text })
                }
                className="flex-1"
                style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
                placeholder="Enter new password"
                placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                secureTextEntry
              />
            </View>
          </View>

          <View className="mb-6">
            <Text
              className="text-sm mb-2"
              style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
            >
              Confirm New Password
            </Text>
            <View className="flex-row items-center border border-light-secondary dark:border-secondary rounded-lg px-4 py-2">
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={passwordValues.confirmPassword}
                onChangeText={(text) =>
                  setPasswordValues({
                    ...passwordValues,
                    confirmPassword: text,
                  })
                }
                className="flex-1"
                style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
                placeholder="Confirm new password"
                placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handlePasswordChange}
            disabled={isChangingPassword}
            className={`bg-blue-500 dark:bg-blue-600 py-3 rounded-lg items-center ${
              isChangingPassword ? "opacity-50" : ""
            }`}
          >
            {isChangingPassword ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-medium">Change Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Danger Zone Section */}
        <View className="mt-8 border-t border-red-100 dark:border-red-900 pt-6">
          <Text
            className="text-xl font-semibold mb-4 text-red-500"
            style={{ color: "#EF4444" }}
          >
            Danger Zone
          </Text>

          <TouchableOpacity
            onPress={handleAccountDeletion}
            className="flex-row items-center justify-center py-3 rounded-lg border border-red-500"
          >
            <MaterialIcons
              name="delete-outline"
              size={20}
              color="#EF4444"
              style={{ marginRight: 8 }}
            />
            <Text className="text-red-500 font-medium">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Account;
