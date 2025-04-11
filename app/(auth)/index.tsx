import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInputProps,
  ScrollView as RNScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { supabase } from "../utils/supabase"; // Create this config file
import React from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

interface InputFieldProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChange: (text: string) => void;
  error: string;
  secure?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
  });
  const scrollViewRef = useRef<RNScrollView>(null);

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
    };

    if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLogin) {
      if (fullName.trim().length < 2) {
        newErrors.fullName = "Please enter your full name";
      }
      if (!PHONE_REGEX.test(phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid phone number";
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phoneNumber,
            },
          },
        });
        if (error) throw error;
      }
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Auth error:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: "your-app-scheme://auth-callback",
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Social login error:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({
    label,
    icon,
    value,
    onChange,
    error,
    secure = false,
    keyboardType = "default",
    rightIcon,
    onRightIconPress,
  }: InputFieldProps) => (
    <View className="mb-4">
      <View className="relative">
        <Ionicons
          name={icon}
          size={20}
          color="#9CA3AF"
          className="absolute left-4 top-5 z-10"
        />
        <Text
          className={`absolute left-4 text-xs text-white/80 z-10 ${
            value || error ? "top-2" : "top-5"
          } transition-all duration-200`}
        >
          {label}
        </Text>
        <TextInput
          className={`bg-white/15 text-white p-4 pl-12 rounded-lg border ${
            error ? "border-red-500" : "border-transparent"
          } ${value ? "pt-6 pb-2" : ""}`}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        />
        {rightIcon && (
          <TouchableOpacity
            className="absolute right-4 top-5 z-10"
            onPress={onRightIconPress}
          >
            <Ionicons name={rightIcon} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-500 text-sm mt-1 ml-2 flex items-center">
          <Ionicons name="warning-outline" size={14} className="mr-1" />
          {error}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 p-5 justify-center">
            <View className="bg-[#1a2633]/75 rounded-2xl p-5 shadow-lg shadow-black/20">
              <View className="flex-row mb-5 border-b border-white/15">
                <Pressable
                  className={`flex-1 items-center py-2.5 ${
                    isLogin ? "border-b-2 border-blue-500" : ""
                  }`}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setIsLogin(true);
                  }}
                >
                  <Text
                    className={`text-base ${
                      isLogin ? "text-white font-semibold" : "text-white/50"
                    }`}
                  >
                    Login
                  </Text>
                </Pressable>
                <Pressable
                  className={`flex-1 items-center py-2.5 ${
                    !isLogin ? "border-b-2 border-blue-500" : ""
                  }`}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setIsLogin(false);
                  }}
                >
                  <Text
                    className={`text-base ${
                      !isLogin ? "text-white font-semibold" : "text-white/50"
                    }`}
                  >
                    Sign Up
                  </Text>
                </Pressable>
              </View>

              {!isLogin && (
                <>
                  <InputField
                    label="Full Name"
                    icon="person-outline"
                    value={fullName}
                    onChange={setFullName}
                    error={errors.fullName}
                    secure={false}
                    keyboardType="default"
                    rightIcon={undefined}
                    onRightIconPress={undefined}
                  />
                  <InputField
                    label="Phone Number"
                    icon="call-outline"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    error={errors.phoneNumber}
                    keyboardType="phone-pad"
                    secure={false}
                    rightIcon={undefined}
                    onRightIconPress={undefined}
                  />
                </>
              )}

              <InputField
                label="Email Address"
                icon="mail-outline"
                value={email}
                onChange={setEmail}
                error={errors.email}
                keyboardType="email-address"
                secure={false}
                rightIcon={undefined}
                onRightIconPress={undefined}
              />

              <InputField
                label="Password"
                icon="lock-closed-outline"
                value={password}
                onChange={setPassword}
                error={errors.password}
                secure={!passwordVisible}
                keyboardType="default"
                rightIcon={passwordVisible ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setPasswordVisible(!passwordVisible)}
              />

              <TouchableOpacity
                className="w-full h-12 mb-4 active:opacity-80"
                onPress={handleAuth}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={["#3A6D8E", "#4D8EAF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="w-full h-full rounded-lg items-center justify-center"
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white text-lg font-semibold">
                      {isLogin ? "Login" : "Sign Up"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View className="flex-row items-center my-4">
                <View className="flex-1 h-px bg-white/15" />
                <Text className="text-white/50 px-4 text-sm">OR</Text>
                <View className="flex-1 h-px bg-white/15" />
              </View>

              <View className="flex-row justify-center gap-4">
                <TouchableOpacity
                  className="bg-white/10 p-3 rounded-full active:opacity-80"
                  onPress={() => handleSocialLogin("google")}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-google" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-white/10 p-3 rounded-full active:opacity-80"
                  onPress={() => handleSocialLogin("apple")}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-apple" size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View className="items-center justify-center mt-4">
                <Text className="text-white/60 text-xs text-center">
                  By continuing, you agree to our{" "}
                  <Text className="text-blue-400 underline">
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text className="text-blue-400 underline">
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
