import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useProfile } from "../context/ProfileContext";
import { supabase } from "../utils/supabase";

const Profile = () => {
  const { profile, loading, error, updateProfile, refreshProfile } =
    useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
  });

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              router.replace("//(auth)/index");
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
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
      <View className="flex-1 bg-light-background dark:bg-primary items-center justify-center">
        <ActivityIndicator size="large" color="#3A6D8E" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-light-background dark:bg-primary items-center justify-center p-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-brandBlue px-4 py-2 rounded-lg"
          onPress={refreshProfile}
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-light-background dark:bg-primary items-center justify-center p-4">
        <Text className="text-light-text dark:text-white text-center mb-4">
          No profile data available
        </Text>
        <TouchableOpacity
          className="bg-brandBlue px-4 py-2 rounded-lg"
          onPress={refreshProfile}
        >
          <Text className="text-white">Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ProfileSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View className="mb-6">
      <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2 px-6">
        {title}
      </Text>
      {children}
    </View>
  );

  const ProfileItem = ({
    icon,
    label,
    value,
    editable = false,
    onChange,
  }: {
    icon: string;
    label: string;
    value: string;
    editable?: boolean;
    onChange?: (text: string) => void;
  }) => (
    <View className="flex-row items-center py-3 px-6 border-b border-gray-200 dark:border-gray-800">
      <Ionicons
        name={icon as any}
        size={20}
        color="#3A6D8E"
        className="dark:text-white"
      />
      <Text className="text-light-text dark:text-white ml-4 flex-1">
        {label}
      </Text>
      {editable && isEditing ? (
        <TextInput
          className="text-gray-600 dark:text-gray-400 flex-1 text-right"
          value={value}
          onChangeText={onChange}
          placeholderTextColor="#6B7280"
          keyboardType={label === "Phone" ? "phone-pad" : "default"}
        />
      ) : (
        <Text className="text-gray-600 dark:text-gray-400">{value}</Text>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-light-background dark:bg-primary mt-24">
      <ScrollView>
        {/* Profile Header */}
        <View className="items-center py-8">
          <View className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center mb-4">
            {profile.avatar_url ? (
              <Image
                source={{
                  uri: supabase.storage
                    .from("avatars")
                    .getPublicUrl(profile.avatar_url).data.publicUrl,
                }}
                className="w-full h-full rounded-full"
              />
            ) : (
              <Ionicons name="person" size={40} color="#3A6D8E" />
            )}
          </View>
          <Text className="text-light-text dark:text-white text-2xl font-bold">
            {profile.full_name}
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mt-1">
            {profile.email}
          </Text>

          {isEditing ? (
            <View className="flex-row mt-4 space-x-4">
              <TouchableOpacity
                className="bg-green-500/20 px-4 py-2 rounded-lg flex-row items-center"
                onPress={handleSave}
              >
                <Ionicons name="checkmark" size={16} color="#22C55E" />
                <Text className="text-green-500 ml-2">Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-red-500/20 px-4 py-2 rounded-lg flex-row items-center"
                onPress={handleCancel}
              >
                <Ionicons name="close" size={16} color="#EF4444" />
                <Text className="text-red-500 ml-2">Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="mt-4 flex-row items-center"
              onPress={handleEdit}
            >
              <Text className="text-brandBlue mr-2">Edit Profile</Text>
              <Ionicons name="pencil-outline" size={16} color="#3A6D8E" />
            </TouchableOpacity>
          )}
        </View>

        {/* Account Information */}
        <ProfileSection title="ACCOUNT INFORMATION">
          <ProfileItem
            icon="person-outline"
            label="Full Name"
            value={isEditing ? editValues.full_name : profile.full_name}
            editable={isEditing}
            onChange={(text) =>
              setEditValues((prev) => ({ ...prev, full_name: text }))
            }
          />
          <ProfileItem
            icon="mail-outline"
            label="Email"
            value={profile.email}
          />
          <ProfileItem
            icon="call-outline"
            label="Phone"
            value={isEditing ? editValues.phone : profile.phone}
            editable={isEditing}
            onChange={(text) =>
              setEditValues((prev) => ({ ...prev, phone: text }))
            }
          />
          <ProfileItem
            icon="calendar-outline"
            label="Member Since"
            value={new Date(profile.created_at).toLocaleDateString()}
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