import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = () => {
    // TODO: Implement actual authentication logic
    // For now, just navigate to home
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-white text-2xl font-bold mb-8">
          Welcome to Pace
        </Text>

        <View className="w-full mb-4">
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg mb-4"
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="bg-gray-800 text-white p-4 rounded-lg"
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="bg-accent w-full py-4 rounded-lg mb-4"
          onPress={handleAuth}
        >
          <Text className="text-white text-center font-semibold">
            {isLogin ? "Login" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-gray-400 mr-1">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </Text>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text className="text-accent">{isLogin ? "Sign Up" : "Login"}</Text>
          </TouchableOpacity>
        </View>

        {isLogin && (
          <TouchableOpacity className="mt-4">
            <Text className="text-gray-400">Forgot Password?</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
