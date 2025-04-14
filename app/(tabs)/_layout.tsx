import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import React, { useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BottomTabBar from "../Components/CustomTabBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddSubscriptionModal from "../Components/AddSubscriptionModal";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { NavigationProp } from "@react-navigation/native";
import HeaderIcons from "../Components/HeaderIcons";

interface CustomBottomTabBarProps extends BottomTabBarProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
  onAddPress: () => void;
  bottomInset: number;
  isHidden: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

interface AddSubscriptionModalProps {
  visible: boolean;
  onDismiss: () => void;
  onEmailScan: () => void;
  onDocumentUpload: () => void;
  isDarkMode: boolean;
}

const _layout = () => {
  const insets = useSafeAreaInsets();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  return (
    <View style={{ flex: 1 }} className={isDarkMode ? "light" : ""}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      <Tabs
        screenOptions={{
          headerBackground: () => (
            <View
              className="bg-light-background dark:bg-primary"
              style={{ flex: 1 }}
            />
          ),
          headerStyle: {
            borderBottomWidth: 0,
          },
          headerTitle: "",
          headerTransparent: true,
          headerShadowVisible: false,
        }}
        tabBar={(props: BottomTabBarProps) => {
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
            switch (tabName) {
              case "home":
                navigation.navigate("index");
                break;
              case "calendar":
                navigation.navigate("Calender");
                break;
              case "Profile":
                navigation.navigate("Profile");
                break;
              case "Setting":
                navigation.navigate("Setting");
                break;
            }
          };

          return (
            <BottomTabBar
              {...props}
              activeTab={activeTab}
              onTabPress={handleTabPress}
              onAddPress={() => setIsAddModalVisible(true)}
              bottomInset={insets.bottom}
              isHidden={false}
              isDarkMode={isDarkMode}
              toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />
          );
        }}
      >
        <Tabs.Screen
          name="index"
          options={({ navigation }: { navigation: NavigationProp<any> }) => ({
            headerShown: true,
            headerRight: () => (
              <HeaderIcons navigation={navigation} isDarkMode={isDarkMode} />
            ),
          })}
        />
        <Tabs.Screen
          name="Calender"
          options={({ navigation }: { navigation: NavigationProp<any> }) => ({
            headerShown: true,
            headerRight: () => (
              <HeaderIcons navigation={navigation} isDarkMode={isDarkMode} />
            ),
          })}
        />
        <Tabs.Screen
          name="Profile"
          options={({ navigation }: { navigation: NavigationProp<any> }) => ({
            headerShown: true,
            headerTitle: "Profile",
            headerTitleStyle: {
              color: isDarkMode ? "#FFFFFF" : "#000000",
              fontSize: 20,
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={isDarkMode ? "white" : "black"}
                  style={{ marginLeft: 15 }}
                />
              </TouchableOpacity>
            ),
          })}
        />
        <Tabs.Screen
          name="Setting"
          options={({ navigation }: { navigation: NavigationProp<any> }) => ({
            headerShown: true,
            headerTitle: "Settings",
            headerTitleStyle: {
              color: isDarkMode ? "#FFFFFF" : "#000000",
              fontSize: 20,
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={isDarkMode ? "white" : "black"}
                  style={{ marginLeft: 15 }}
                />
              </TouchableOpacity>
            ),
          })}
        />
        <Tabs.Screen
          name="Pace"
          options={({ navigation }: { navigation: NavigationProp<any> }) => ({
            headerShown: true,
            headerTitle: "About Us",
            headerTitleStyle: {
              color: isDarkMode ? "#FFFFFF" : "#000000",
              fontSize: 20,
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 8, marginLeft: 8 }}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={isDarkMode ? "#FFFFFF" : "#000000"}
                />
              </TouchableOpacity>
            ),
          })}
        />
        <Tabs.Screen
          name="Account"
          options={({ navigation }: { navigation: NavigationProp<any> }) => ({
            headerShown: true,
            headerTitle: "Account",
            headerTitleStyle: {
              color: isDarkMode ? "#FFFFFF" : "#000000",
              fontSize: 20,
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 8, marginLeft: 8 }}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={isDarkMode ? "#FFFFFF" : "#000000"}
                />
              </TouchableOpacity>
            ),
          })}
        />
        <Tabs.Screen
          name="Notifications"
          options={({ navigation }: { navigation: NavigationProp<any> }) => ({
            headerShown: true,
            headerTitle: "Notifications",
            headerTitleStyle: {
              color: isDarkMode ? "#FFFFFF" : "#000000",
              fontSize: 20,
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ padding: 8, marginLeft: 8 }}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={isDarkMode ? "#FFFFFF" : "#000000"}
                />
              </TouchableOpacity>
            ),
          })}
        />
      </Tabs>

      <AddSubscriptionModal
        visible={isAddModalVisible}
        onDismiss={() => setIsAddModalVisible(false)}
        onEmailScan={() => console.log("Email scan pressed")}
        onDocumentUpload={() => console.log("Document upload pressed")}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

export default _layout;
