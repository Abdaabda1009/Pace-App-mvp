import React, { memo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputFieldProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChange: (text: string) => void;
  error: string;
  secure?: boolean;
  keyboardType?: TextInput["props"]["keyboardType"];
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  textContentType?: TextInput["props"]["textContentType"];
  autoComplete?: TextInput["props"]["autoComplete"];
  onFocus?: () => void;
  onBlur?: () => void;
  returnKeyType?: TextInput["props"]["returnKeyType"];
  onSubmitEditing?: () => void;
  autoCapitalize?: TextInput["props"]["autoCapitalize"];
}

const InputField = memo(
  ({
    label,
    icon,
    value,
    onChange,
    error,
    secure = false,
    keyboardType = "default",
    rightIcon,
    onRightIconPress,
    textContentType,
    autoComplete,
    onFocus,
    onBlur,
    returnKeyType,
    onSubmitEditing,
    autoCapitalize = "none",
  }: InputFieldProps) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className="mb-4">
        <View className="relative">
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? "#60a5fa" : "#9CA3AF"}
            className="absolute left-4 top-5 z-10 transition-colors duration-200"
            accessibilityElementsHidden={true}
            importantForAccessibility="no"
          />
          <Text
            className={`absolute left-12 text-xs z-10 transition-all duration-200 ${
              value || error || isFocused
                ? "top-2 text-blue-400"
                : "top-5 text-white/80"
            }`}
            accessibilityElementsHidden={true}
            importantForAccessibility="no"
          >
            {label}
          </Text>
          <TextInput
            className={`bg-white/15 text-white p-4 pl-12 rounded-lg border transition-all duration-200 ${
              error
                ? "border-red-500"
                : isFocused
                ? "border-blue-400 bg-white/20"
                : "border-transparent"
            } ${value ? "pt-6 pb-2" : ""}`}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={value}
            onChangeText={onChange}
            secureTextEntry={secure}
            keyboardType={keyboardType}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
            accessibilityLabel={label}
            accessibilityHint={
              error ? `${label} field has an error: ${error}` : undefined
            }
            accessibilityRole="text"
            accessibilityState={{ disabled: !!error }}
            importantForAccessibility="yes"
            textContentType={textContentType}
            autoComplete={autoComplete}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            autoCapitalize={autoCapitalize}
          />
          {rightIcon && (
            <TouchableOpacity
              className="absolute right-4 top-5 z-10"
              onPress={onRightIconPress}
              accessibilityLabel={`${secure ? "Show" : "Hide"} password`}
              accessibilityRole="button"
              accessibilityHint="Toggles password visibility"
            >
              <Ionicons
                name={rightIcon}
                size={20}
                color={isFocused ? "#60a5fa" : "#9CA3AF"}
                className="transition-colors duration-200"
              />
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Text
            className="text-red-500 text-sm mt-1 ml-2 flex items-center"
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Ionicons name="warning-outline" size={14} className="mr-1" />
            {error}
          </Text>
        )}
      </View>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
