import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  useColorScheme,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useProfile } from "../context/ProfileContext";

const Account = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const navigation = useNavigation();
  const { profile, loading, error, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background dark:bg-primary">
        <Text style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}>
          Loading...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-light-background dark:bg-primary">
        <Text style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}>
          Error: {error}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-primary mt-4">
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-light-secondary dark:border-secondary">
        <TouchableOpacity
          onPress={handleBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ padding: 8 }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? "#FFFFFF" : "#000000"}
          />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold"
          style={{
            color: isDarkMode ? "#FFFFFF" : "#000000",
            fontSize: 20,
            fontWeight: "bold",
            flex: 1,
            textAlign: "center",
            marginLeft: -24,
            opacity: 1,
          }}
        >
          Account
        </Text>
        {!isEditing ? (
          <TouchableOpacity onPress={handleEdit} style={{ padding: 8 }}>
            <Text
              className="text-blue-500 font-medium"
              style={{ color: isDarkMode ? "#60A5FA" : "#3B82F6" }}
            >
              Edit
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row">
            <TouchableOpacity
              onPress={handleCancel}
              className="mr-4"
              style={{ padding: 8 }}
            >
              <Text
                className="text-red-500 font-medium"
                style={{ color: isDarkMode ? "#F87171" : "#EF4444" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={{ padding: 8 }}>
              <Text
                className="text-blue-500 font-medium"
                style={{ color: isDarkMode ? "#60A5FA" : "#3B82F6" }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView className="flex-1 px-6 py-4">
        <View className="mb-6">
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
              className="text-base flex-1"
              style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
            >
              {profile?.email}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text
            className="text-sm mb-2"
            style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
          >
            Full Name
          </Text>
          {isEditing ? (
            <View className="flex-row items-center border border-light-secondary dark:border-secondary rounded-lg px-4 py-2">
              <MaterialIcons
                name="person-outline"
                size={20}
                color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={editValues.full_name}
                onChangeText={(text) =>
                  setEditValues({ ...editValues, full_name: text })
                }
                className="flex-1"
                style={{
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                }}
                placeholder="Enter your full name"
                placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                autoCapitalize="words"
              />
            </View>
          ) : (
            <View className="flex-row items-center border border-light-secondary dark:border-secondary rounded-lg px-4 py-2">
              <MaterialIcons
                name="person-outline"
                size={20}
                color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-base flex-1"
                style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
              >
                {profile?.full_name || "Not set"}
              </Text>
            </View>
          )}
        </View>

        <View className="mb-6">
          <Text
            className="text-sm mb-2"
            style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
          >
            Phone Number
          </Text>
          {isEditing ? (
            <View className="flex-row items-center border border-light-secondary dark:border-secondary rounded-lg px-4 py-2">
              <MaterialIcons
                name="phone-iphone"
                size={20}
                color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                style={{ marginRight: 8 }}
              />
              <TextInput
                value={editValues.phone}
                onChangeText={(text) =>
                  setEditValues({ ...editValues, phone: text })
                }
                className="flex-1"
                style={{
                  color: isDarkMode ? "#FFFFFF" : "#000000",
                }}
                placeholder="Enter phone number"
                placeholderTextColor={isDarkMode ? "#6B7280" : "#9CA3AF"}
                keyboardType="phone-pad"
              />
            </View>
          ) : (
            <View className="flex-row items-center border border-light-secondary dark:border-secondary rounded-lg px-4 py-2">
              <MaterialIcons
                name="phone-iphone"
                size={20}
                color={isDarkMode ? "#9CA3AF" : "#6B7280"}
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-base flex-1"
                style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
              >
                {profile?.phone || "Not set"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Account;
