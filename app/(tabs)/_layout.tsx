import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BottomTabBar from "../Components/CustomTabBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const _layout = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0F1723",
          borderBottomWidth: 0,
        },
        headerTitle: "",
        headerTransparent: true,
        headerShadowVisible: false,
      }}
      tabBar={(props) => {
        const { state, navigation } = props;
        const routeName = state.routes[state.index].name;
        const routeToTabMap: Record<string, string> = {
          index: "home",
          Calender: "calendar",
          Profile: "Profile",
          Setting: "Setting",
        };
        const activeTab = routeToTabMap[routeName] || "home";

        const handleTabPress = (tabName: string) => {
          const targetRoute = tabName === "home" ? "index" : "Calender";
          navigation.navigate(targetRoute);
        };

        const handleAddPress = () => {
          navigation.navigate("add-subscription");
        };

        return (
          <BottomTabBar
            activeTab={activeTab}
            onTabPress={handleTabPress}
            onAddPress={handleAddPress}
            bottomInset={0}
            isHidden={false}
          />
        );
      }}
    >
      <Tabs.Screen
        name="index"
        options={({ navigation }) => ({
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
              <Ionicons
                name="settings-outline"
                size={24}
                color="white"
                style={{ marginLeft: 15 }}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Ionicons
                name="person-outline"
                size={24}
                color="white"
                style={{ marginRight: 15 }}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Tabs.Screen
        name="Calender"
        options={{
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => console.log("Navigate to Settings")}
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color="white"
                style={{ marginLeft: 15 }}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => console.log("Navigate to Profile")}
            >
              <Ionicons
                name="person-outline"
                size={24}
                color="white"
                style={{ marginRight: 15 }}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;