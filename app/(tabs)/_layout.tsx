import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import BottomTabBar from "../Components/CustomTabBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AddSubscriptionModal from "../Components/AddSubscriptionModal";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { NavigationProp } from "@react-navigation/native";

const _layout = () => {
  const insets = useSafeAreaInsets();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const router = useRouter();

  const HeaderButtons = ({
    navigation,
  }: {
    navigation: NavigationProp<any>;
  }) => (
    <View className="flex-row items-center justify-between w-full">
      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <Ionicons
          name="person-outline"
          size={24}
          color="white"
          style={{ marginLeft: -200 }}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
        <Ionicons
          name="settings-outline"
          size={24}
          color="white"
          style={{ marginRight: 15 }}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
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
              activeTab={activeTab}
              onTabPress={handleTabPress}
              onAddPress={() => setIsAddModalVisible(true)}
              bottomInset={0}
              isHidden={false}
            />
          );
        }}
      >
        <Tabs.Screen
          name="index"
          options={({ navigation }: { navigation: NavigationProp<any> }) => ({
            headerShown: true,
            headerRight: () => <HeaderButtons navigation={navigation} />,
          })}
        />
        <Tabs.Screen
          name="Calender"
          options={({ navigation }: { navigation: NavigationProp<any> }) => ({
            headerShown: true,
            headerRight: () => <HeaderButtons navigation={navigation} />,
          })}
        />
        <Tabs.Screen
          name="Profile"
          options={({ navigation }: { navigation: NavigationProp<any> }) => ({
            headerShown: true,
            headerTitle: "Profile",
            headerTitleStyle: {
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="white"
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
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
            },
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="white"
                  style={{ marginLeft: 15 }}
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
      />
    </View>
  );
};

export default _layout;
