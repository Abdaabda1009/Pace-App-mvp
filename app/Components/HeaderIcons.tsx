import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";

interface HeaderIconsProps {
  navigation: NavigationProp<any>;
  isDarkMode: boolean;
}

const HeaderIcons: React.FC<HeaderIconsProps> = ({
  navigation,
  isDarkMode,
}) => {
  return (
    <View className="flex-row items-center justify-between w-full">
      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}
        className="ml-[-200px]"
      >
        <Ionicons
          name="person-outline"
          size={24}
          className="rgba(8, 151, 218, 0.98)"
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Setting")}
        className="mr-4"
      >
        <Ionicons
          name="settings-outline"
          size={24}
          className="rgba(8, 151, 218, 0.98)"
        />
      </TouchableOpacity>
    </View>
  );
};

export default HeaderIcons;
