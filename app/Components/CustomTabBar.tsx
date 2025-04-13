import React from "react";
import { TouchableOpacity, Platform, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

export interface CustomBottomTabBarProps extends BottomTabBarProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
  onAddPress: () => void;
  bottomInset: number;
  isHidden: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const BottomTabBar: React.FC<CustomBottomTabBarProps> = ({
  activeTab = "home",
  onTabPress,
  onAddPress,
  bottomInset = 0,
  isHidden = false,
  isDarkMode,
  toggleDarkMode,
}) => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();

  const inactiveIconColor =
    colorScheme === "dark"
      ? "rgba(255, 255, 255, 0.6)"
      : "rgba(33, 43, 54, 0.6)";
  const borderTopColor =
    colorScheme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
  const backgroundColor =
    colorScheme === "dark"
      ? "rgba(15, 23, 35, 0.98)"
      : "rgba(255, 255, 255, 0.98)";

  return (
    <View
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: "row",
          borderTopWidth: 0,
          borderTopColor,
          backgroundColor,
        },
        {
          paddingBottom: Platform.OS === "ios" ? bottomInset + 8 : 10,
          height: Platform.OS === "ios" ? 80 + bottomInset : 70,
        },
      ]}
    >
      {/* Home Tab */}
      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 0,
        }}
        onPress={() => onTabPress("home")}
        accessibilityRole="tab"
      >
        <View style={{ alignItems: "center", paddingHorizontal: 8 }}>
          <Ionicons
            name={activeTab === "home" ? "home" : "home-outline"}
            size={24}
            color={activeTab === "home" ? "#3A6D8E" : inactiveIconColor}
          />
          <Text
            style={[
              { fontSize: 12, marginTop: 4, fontWeight: "500" },
              activeTab === "home"
                ? { color: "#3A6D8E", fontWeight: "600" }
                : { color: inactiveIconColor },
            ]}
          >
            Home
          </Text>
        </View>
        {activeTab === "home" && (
          <View
            style={{
              position: "absolute",
              width: "50%",
              height: 4,
              backgroundColor: "#3A6D8E",
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
              bottom: bottomInset > 0 ? bottomInset + -24 : 10,
            }}
          />
        )}
      </TouchableOpacity>

      {/* Add Subscription Button */}
      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          marginTop: -25,
        }}
        onPress={onAddPress}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={["#3A6D8E", "#4D8EAF"]}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor:
              colorScheme === "dark"
                ? "rgba(15, 23, 35, 0.98)"
                : "rgba(255, 255, 255, 0.98)",
            shadowColor: "#3A6D8E",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "500",
            color: inactiveIconColor,
            marginTop: 4,
          }}
        >
          Add
        </Text>
      </TouchableOpacity>

      {/* Calendar Tab */}
      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 0,
        }}
        onPress={() => onTabPress("calendar")}
        accessibilityRole="tab"
      >
        <View style={{ alignItems: "center", paddingHorizontal: 8 }}>
          <Ionicons
            name={activeTab === "calendar" ? "calendar" : "calendar-outline"}
            size={24}
            color={activeTab === "calendar" ? "#3A6D8E" : inactiveIconColor}
          />
          <Text
            style={[
              { fontSize: 12, marginTop: 4, fontWeight: "500" },
              activeTab === "calendar"
                ? { color: "#3A6D8E", fontWeight: "600" }
                : { color: inactiveIconColor },
            ]}
          >
            Calendar
          </Text>
        </View>
        {activeTab === "calendar" && (
          <View
            style={{
              position: "absolute",
              width: "50%",
              height: 4,
              backgroundColor: "#3A6D8E",
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
              bottom: bottomInset > 0 ? bottomInset + -24 : 10,
            }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default BottomTabBar;
