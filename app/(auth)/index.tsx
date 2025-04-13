import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ScrollView as RNScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useCallback, memo, useEffect } from "react";
import { router, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { supabase } from "../utils/supabase"; // Create this config file
import React from "react";
import InputField from "./components/InputField";
import SocialLoginButton from "./components/SocialLoginButton";
import { useColorScheme } from "react-native";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

const PASSWORD_REQUIREMENTS = [
  { text: "At least 6 characters", regex: /.{6,}/ },
  { text: "At least one uppercase letter", regex: /[A-Z]/ },
  { text: "At least one lowercase letter", regex: /[a-z]/ },
  { text: "At least one number", regex: /[0-9]/ },
  { text: "At least one special character", regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] =
    useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
  });
  const scrollViewRef = useRef<RNScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Animate form when mounted
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkSession();
  }, []);

  const checkPasswordStrength = useCallback((pass: string) => {
    return PASSWORD_REQUIREMENTS.map((req) => ({
      ...req,
      met: req.regex.test(pass),
    }));
  }, []);

  const validateField = useCallback(
    (field: string, value: string) => {
      const newErrors = { ...errors };

      switch (field) {
        case "email":
          if (!value) {
            newErrors.email = "Email is required";
          } else if (!isLogin && !EMAIL_REGEX.test(value)) {
            newErrors.email = "Please enter a valid email address";
          } else {
            newErrors.email = "";
          }
          break;
        case "password":
          if (!value) {
            newErrors.password = "Password is required";
          } else if (!isLogin && value.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
          } else {
            newErrors.password = "";
          }
          break;
        case "fullName":
          if (!isLogin && !value) {
            newErrors.fullName = "Full name is required";
          } else if (!isLogin && value.trim().length < 2) {
            newErrors.fullName = "Please enter your full name";
          } else {
            newErrors.fullName = "";
          }
          break;
        case "phoneNumber":
          if (!isLogin && !value) {
            newErrors.phoneNumber = "Phone number is required";
          } else if (!isLogin && !PHONE_REGEX.test(value)) {
            newErrors.phoneNumber = "Please enter a valid phone number";
          } else {
            newErrors.phoneNumber = "";
          }
          break;
      }

      setErrors(newErrors);
    },
    [isLogin, errors]
  );

  const handleInputChange = useCallback(
    (field: string, value: string) => {
      switch (field) {
        case "email":
          setEmail(value);
          break;
        case "password":
          setPassword(value);
          if (!isLogin) {
            setShowPasswordRequirements(true);
          }
          break;
        case "fullName":
          setFullName(value);
          break;
        case "phoneNumber":
          setPhoneNumber(value);
          break;
      }
      validateField(field, value);
    },
    [isLogin, validateField]
  );

  const handleAuth = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();

    // Validate all fields before submission
    const fieldsToValidate = isLogin
      ? ["email", "password"]
      : ["email", "password", "fullName", "phoneNumber"];

    fieldsToValidate.forEach((field) => {
      const value =
        {
          email,
          password,
          fullName,
          phoneNumber,
        }[field as keyof typeof errors] || "";
      validateField(field, value);
    });

    // Check if there are any errors
    const hasErrors = fieldsToValidate.some(
      (field) => errors[field as keyof typeof errors]
    );

    if (hasErrors) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // If rememberMe is true, store the session in AsyncStorage
        if (rememberMe) {
          await supabase.auth.setSession({
            access_token: data.session?.access_token || "",
            refresh_token: data.session?.refresh_token || "",
          });
        }

        router.replace("/(tabs)");
      } else {
        // Additional validation for sign-up
        if (!EMAIL_REGEX.test(email)) {
          setErrors((prev) => ({
            ...prev,
            email: "Please enter a valid email address",
          }));
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phoneNumber,
            },
            emailRedirectTo: "your-app-scheme://auth-callback",
          },
        });
        if (error) throw error;

        if (data.user) {
          alert("Please check your email for verification link");
          return;
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMessage = "An error occurred during authentication";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password";
      } else if (error.message.includes("User already registered")) {
        errorMessage = "This email is already registered";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email address first";
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    email,
    password,
    fullName,
    phoneNumber,
    isLogin,
    rememberMe,
    errors,
    validateField,
  ]);

  const handleSocialLogin = useCallback(
    async (provider: "google" | "apple") => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    },
    []
  );

  const handleForgotPassword = useCallback(async () => {
    if (!email) {
      alert("Please enter your email address first");
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "your-app-scheme://reset-password",
      });
      if (error) throw error;
      alert("Password reset instructions have been sent to your email");
    } catch (error: any) {
      console.error("Password reset error:", error);
      alert("Failed to send password reset instructions");
    } finally {
      setIsLoading(false);
    }
  }, [email]);

  const handleScrollToEnd = useCallback(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  const toggleAuthMode = useCallback(() => {
    Haptics.selectionAsync();
    setIsLogin((prev) => !prev);
    // Reset fields and errors when switching modes
    setErrors({
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
    });
    if (isLogin) {
      setShowPasswordRequirements(true);
    } else {
      setShowPasswordRequirements(false);
    }
  }, [isLogin]);

  // Calculate password strength as percentage
  const passwordStrength = useCallback(() => {
    if (!password) return 0;
    const metRequirements = checkPasswordStrength(password).filter(
      (req) => req.met
    ).length;
    return (metRequirements / PASSWORD_REQUIREMENTS.length) * 100;
  }, [password, checkPasswordStrength]);

  const handleLegalPress = (type: "privacy" | "terms") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/legal",
      params: { initialTab: type },
    });
  };

  return (
    <SafeAreaView className="flex-1 dark:bg-slate-900 bg-light-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          accessibilityRole="none"
        >
          <View className="flex-1 p-5 justify-center">
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className="bg-[#1a2633]/90 rounded-3xl p-6 shadow-xl shadow-black/30"
              accessibilityRole="none"
            >
              <View className="flex-row mb-6 border-b border-white/15">
                <Pressable
                  className={`flex-1 items-center py-3 ${
                    isLogin ? "border-b-2 border-blue-500" : ""
                  }`}
                  onPress={toggleAuthMode}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isLogin }}
                  accessibilityLabel="Login tab"
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
                  className={`flex-1 items-center py-3 ${
                    !isLogin ? "border-b-2 border-blue-500" : ""
                  }`}
                  onPress={toggleAuthMode}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: !isLogin }}
                  accessibilityLabel="Sign Up tab"
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
                    onChange={(text) => handleInputChange("fullName", text)}
                    error={errors.fullName}
                    onFocus={handleScrollToEnd}
                    returnKeyType="next"
                  />
                  <InputField
                    label="Phone Number"
                    icon="call-outline"
                    value={phoneNumber}
                    onChange={(text) => handleInputChange("phoneNumber", text)}
                    error={errors.phoneNumber}
                    keyboardType="phone-pad"
                    onFocus={handleScrollToEnd}
                    returnKeyType="next"
                  />
                </>
              )}

              <InputField
                label="Email Address"
                icon="mail-outline"
                value={email}
                onChange={(text) => handleInputChange("email", text)}
                error={errors.email}
                keyboardType="email-address"
                onFocus={handleScrollToEnd}
                autoCapitalize="none"
                returnKeyType="next"
              />

              <InputField
                label="Password"
                icon="lock-closed-outline"
                value={password}
                onChange={(text) => handleInputChange("password", text)}
                error={errors.password}
                secure={!passwordVisible}
                rightIcon={passwordVisible ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setPasswordVisible(!passwordVisible)}
                textContentType={isLogin ? "password" : "newPassword"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                onFocus={handleScrollToEnd}
                autoCapitalize="none"
                returnKeyType={isLogin ? "go" : "next"}
                onSubmitEditing={isLogin ? handleAuth : undefined}
              />

              {!isLogin && showPasswordRequirements && (
                <View className="mb-5 bg-white/10 p-4 rounded-xl">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-white/80 text-sm font-medium">
                      Password Strength
                    </Text>
                    <Text className="text-white/70 text-xs">
                      {passwordStrength() <= 20
                        ? "Weak"
                        : passwordStrength() <= 60
                        ? "Moderate"
                        : passwordStrength() <= 80
                        ? "Strong"
                        : "Very Strong"}
                    </Text>
                  </View>

                  {/* Password strength meter */}
                  <View className="h-2 w-full bg-white/20 rounded-full mb-3">
                    <View
                      className={`h-2 rounded-full ${
                        passwordStrength() <= 20
                          ? "bg-red-500"
                          : passwordStrength() <= 60
                          ? "bg-yellow-500"
                          : passwordStrength() <= 80
                          ? "bg-green-500"
                          : "bg-emerald-400"
                      }`}
                      style={{ width: `${passwordStrength()}%` }}
                    />
                  </View>

                  <Text className="text-white/80 text-sm mb-2">
                    Requirements:
                  </Text>
                  {checkPasswordStrength(password).map((req, index) => (
                    <View key={index} className="flex-row items-center mb-1.5">
                      <Ionicons
                        name={req.met ? "checkmark-circle" : "ellipse-outline"}
                        size={18}
                        color={req.met ? "#4ade80" : "#94a3b8"}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        className={`text-sm ${
                          req.met ? "text-white/90" : "text-white/60"
                        }`}
                      >
                        {req.text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View className="flex-row justify-between items-center mb-5">
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.selectionAsync();
                      setRememberMe(!rememberMe);
                    }}
                    className="flex-row items-center"
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: rememberMe }}
                    accessibilityLabel="Remember me"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <View
                      className={`w-5 h-5 rounded-md border flex items-center justify-center mr-2 ${
                        rememberMe
                          ? "bg-blue-500 border-blue-500"
                          : "border-white/50"
                      }`}
                    >
                      {rememberMe && (
                        <Ionicons name="checkmark" size={14} color="white" />
                      )}
                    </View>
                    <Text className="text-white/80 text-sm">Remember me</Text>
                  </TouchableOpacity>
                </View>
                {isLogin && (
                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    accessibilityRole="link"
                    accessibilityLabel="Forgot password"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text className="text-blue-400 font-medium">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                className="w-full mb-2 rounded-lg active:opacity-80"
                onPress={handleAuth}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel={isLogin ? "Login" : "Sign Up"}
                accessibilityState={{ disabled: isLoading }}
                accessibilityHint={
                  isLoading
                    ? "Please wait while we process your request"
                    : undefined
                }
              >
                <LinearGradient
                  colors={["#3A6D8E", "#4D8EAF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="w-full py-3.5 items-center justify-center"
                >
                  {isLoading ? (
                    <ActivityIndicator
                      color="white"
                      size="small"
                      accessibilityLabel="Loading"
                    />
                  ) : (
                    <Text className="text-white text-center py-2.5 text-base font-semibold">
                      {isLogin ? "Login" : "Sign Up"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View className="flex-row items-center my-5">
                <View className="flex-1 h-px bg-white/15" />
                <Text
                  className="text-white/50 px-4 text-sm"
                  accessibilityRole="text"
                >
                  OR CONTINUE WITH
                </Text>
                <View className="flex-1 h-px bg-white/15" />
              </View>

              <View className="flex-row justify-center gap-5 mb-5">
                <SocialLoginButton
                  provider="google"
                  onPress={() => handleSocialLogin("google")}
                  disabled={isLoading}
                />
                <SocialLoginButton
                  provider="apple"
                  onPress={() => handleSocialLogin("apple")}
                  disabled={isLoading}
                />
              </View>

              <View className="items-center justify-center mt-4">
                <Text
                  className="text-white/60 text-xs text-center leading-5"
                  accessibilityRole="text"
                >
                  By continuing, you agree to our{" "}
                  <Text
                    className="text-blue-400 underline font-medium"
                    accessibilityRole="link"
                    accessibilityLabel="Terms of Service"
                    onPress={() => handleLegalPress("terms")}
                  >
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text
                    className="text-blue-400 underline font-medium"
                    accessibilityRole="link"
                    accessibilityLabel="Privacy Policy"
                    onPress={() => handleLegalPress("privacy")}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default memo(Auth);
