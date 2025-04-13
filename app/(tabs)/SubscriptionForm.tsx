import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
  Linking,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Subscription } from "../constants/Subscription";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "expo-router";
import {
  createSubscription,
  NewSubscription,
  PaymentMethod,
} from "../utils/subscriptionLogic";

const LOGO_API_SECRET_KEY = "sk_GH5uVjkPRGic2ZscGLV6Ag";
const LOGO_API_PUBLIC_KEY = "pk_QxM7ndYgS-6UFUpHdOj_eQ";

interface BrandResult {
  name: string;
  domain: string;
  logo?: string;
}

interface SubscriptionFormProps {
  onSubmit: (data: Omit<Subscription, "id">) => void;
  initialData?: Subscription;
  isEditing?: boolean;
}

const SubscriptionForm = ({
  onSubmit,
  initialData,
  isEditing = false,
}: SubscriptionFormProps) => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<Omit<NewSubscription, "id">>({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    category: initialData?.category || "streaming",
    icon: initialData?.icon || "default",
    color: initialData?.color || "#3b82f6",
    renewal_date:
      initialData?.renewalDate || new Date().toISOString().split("T")[0],
    billing_cycle: initialData?.billingCycle || "monthly",
    payment_method: {
      type: initialData?.paymentMethod?.type || "card",
      lastFour: initialData?.paymentMethod?.lastFour || "",
      expiryDate: initialData?.paymentMethod?.expiryDate || "",
    },
    notes: initialData?.notes || "",
    logo: initialData?.logo || null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<BrandResult[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(
    initialData?.logo || null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotes, setShowNotes] = useState(initialData?.notes ? true : false);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (formData.name.trim()) {
        handleBrandSearch(formData.name.trim());
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [formData.name]);

  const handleBrandSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.logo.dev/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer: ${LOGO_API_SECRET_KEY}`,
          },
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching brand search results:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Service name is required";
    if (formData.price <= 0) newErrors.price = "Please enter a valid price";
    if (!formData.renewal_date)
      newErrors.renewal_date = "Renewal date is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.payment_method.type)
      newErrors.payment_method = "Payment method is required";

    if (isNaN(Number(formData.price))) {
      newErrors.price = "Price must be a valid number";
    }

    if (formData.renewal_date) {
      const renewalDate = new Date(formData.renewal_date);
      if (isNaN(renewalDate.getTime())) {
        newErrors.renewal_date = "Please enter a valid date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFormData({
        ...formData,
        renewal_date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Subscription",
      `Are you sure you want to delete ${initialData?.name} subscription?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "Subscription deleted successfully");
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const newSubscription: NewSubscription = {
          ...formData,
          name: formData.name.trim(),
          price: Number(formData.price),
          logo: logoUrl,
        };

        Alert.alert(
          "Saving Subscription",
          "Please wait while we save your subscription...",
          [],
          { cancelable: false }
        );

        const createdSubscription = await createSubscription(newSubscription);

        if (createdSubscription) {
          setTimeout(() => {
            Alert.alert(
              "Success",
              `${formData.name} subscription ${
                isEditing ? "updated" : "created"
              } successfully!`,
              [
                {
                  text: "View Subscriptions",
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          }, 1000);
        }
      } catch (err) {
        const error = err as Error;
        Alert.alert(
          "Error",
          `Failed to save subscription: ${error?.message || "Unknown error"}.`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
            {
              text: "Try Again",
              onPress: () => handleSubmit(),
            },
          ]
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      Alert.alert(
        "Validation Error",
        "Please check all required fields and try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handlePaymentMethodUpdate = (
    field: keyof PaymentMethod,
    value: string
  ) => {
    setFormData({
      ...formData,
      payment_method: {
        ...formData.payment_method,
        [field]: value,
      },
    });
  };

  const categories = [
    { id: "streaming", icon: "tv" as const, label: "Streaming" },
    { id: "software", icon: "laptop" as const, label: "Software" },
    { id: "fitness", icon: "fitness-center" as const, label: "Fitness" },
    { id: "food", icon: "fastfood" as const, label: "Food" },
    { id: "other", icon: "category" as const, label: "Other" },
  ];

  const paymentMethods = [
    { id: "card", icon: "card" as const },
    { id: "paypal", icon: "logo-paypal" as const },
    { id: "bank", icon: "business" as const },
  ];

  const SubmitButton = () => (
    <TouchableOpacity
      className={`bg-brandBlue p-5 rounded-xl items-center shadow-lg shadow-brandBlue/30 ${
        isSubmitting ? "opacity-70" : "active:scale-98"
      }`}
      onPress={handleSubmit}
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <View className="flex-row items-center">
          <ActivityIndicator color="#fff" size="small" />
          <Text className="text-white font-bold text-lg ml-2">
            {isEditing ? "Updating..." : "Creating..."}
          </Text>
        </View>
      ) : (
        <Text className="text-white font-bold text-lg">
          {isEditing ? "Update Subscription" : "Create Subscription"}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-light-primary dark:bg-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="p-4 mt-12 bg-light-background dark:bg-gray-900 rounded-2xl shadow-xl shadow-black/30">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-light-text dark:text-textLight text-2xl font-bold">
                {isEditing ? "Edit Subscription" : "New Subscription"}
              </Text>
              {isEditing && (
                <TouchableOpacity
                  onPress={handleDelete}
                  className="bg-red-500/10 p-2 rounded-full"
                >
                  <Ionicons name="trash-outline" size={22} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>

            {/* Enhanced Service Name Field with Logo */}
            <View className="mb-5">
              <Text className="text-light-text/80 dark:text-textLight/80 mb-2 font-medium">
                Service Name
              </Text>
              <View className="relative">
                <View className="flex-row items-center">
                  <TextInput
                    className="bg-light-secondary/20 dark:bg-secondary/20 text-light-text dark:text-textLight p-4 rounded-xl 
                        border border-light-secondary/30 dark:border-secondary/30 focus:border-brandBlue flex-1 pr-12"
                    placeholder="Netflix, Spotify, Adobe..."
                    placeholderTextColor="#6B7280"
                    value={formData.name}
                    onChangeText={(text) =>
                      setFormData({ ...formData, name: text })
                    }
                  />
                  {logoUrl && (
                    <Image
                      source={{ uri: logoUrl }}
                      className="w-8 h-8 rounded absolute right-3 top-3"
                      resizeMode="contain"
                    />
                  )}
                </View>

                {isSearching && (
                  <ActivityIndicator
                    className="absolute right-3 top-5"
                    size="small"
                    color="#3b82f6"
                  />
                )}
              </View>

              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
              )}

              {searchResults.length > 0 && (
                <View className="mt-2 bg-light-secondary/20 dark:bg-secondary/20 rounded-lg border border-light-secondary/30 dark:border-secondary/30 max-h-56">
                  <ScrollView nestedScrollEnabled={true}>
                    {searchResults.map((brand) => (
                      <TouchableOpacity
                        key={brand.domain}
                        className="p-3 border-b border-light-secondary/30 dark:border-secondary/30"
                        onPress={() => {
                          setFormData({ ...formData, name: brand.name });
                          setSearchResults([]);
                          setLogoUrl(
                            `https://img.logo.dev/${brand.domain}?token=${LOGO_API_PUBLIC_KEY}&size=50&format=png`
                          );
                        }}
                      >
                        <View className="flex-row items-center">
                          <Image
                            source={{
                              uri: `https://img.logo.dev/${brand.domain}?token=${LOGO_API_PUBLIC_KEY}&size=50&format=png`,
                            }}
                            className="w-8 h-8 rounded mr-3"
                            resizeMode="contain"
                          />
                          <View>
                            <Text className="text-light-text dark:text-textLight">
                              {brand.name}
                            </Text>
                            <Text className="text-light-text/50 dark:text-textLight/50 text-xs">
                              {brand.domain}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Enhanced Price & Date Row */}
            <View className="flex-row gap-4 mb-5">
              <View className="flex-1">
                <Text className="text-light-text/80 dark:text-textLight/80 mb-2 font-medium">
                  Price
                </Text>
                <View className="flex-row items-center relative">
                  <Text className="absolute left-4 z-10 text-light-text/50 dark:text-textLight/50">
                    $
                  </Text>
                  <TextInput
                    className="bg-light-secondary/20 dark:bg-secondary/20 text-light-text dark:text-textLight p-4 rounded-xl 
                        border border-light-secondary/30 dark:border-secondary/30 focus:border-brandBlue pl-8 flex-1"
                    placeholder="0.00"
                    placeholderTextColor="#6B7280"
                    keyboardType="numeric"
                    value={String(formData.price || "")}
                    onChangeText={(text) =>
                      setFormData({ ...formData, price: Number(text) || 0 })
                    }
                  />
                </View>
                {errors.price && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.price}
                  </Text>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-light-text/80 dark:text-textLight/80 mb-2 font-medium">
                  Next Billing
                </Text>
                <TouchableOpacity
                  className="bg-light-secondary/20 dark:bg-secondary/20 text-light-text dark:text-textLight p-4 rounded-xl 
                      border border-light-secondary/30 dark:border-secondary/30 flex-row items-center justify-between"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text className="text-light-text dark:text-textLight">
                    {formData.renewal_date || "Select date"}
                  </Text>
                  <Ionicons name="calendar" size={18} color="#6B7280" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={
                      formData.renewal_date
                        ? new Date(formData.renewal_date)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>
            </View>

            {/* Enhanced Category Selection */}
            <View className="mb-6">
              <Text className="text-light-text/80 dark:text-textLight/80 mb-3 font-medium">
                Category
              </Text>
              <View className="flex flex-row flex-wrap gap-3">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    className={`px-4 py-3 rounded-xl flex-row items-center
                        ${
                          formData.category === cat.id
                            ? "bg-brandBlue/90 border border-brandBlue"
                            : "bg-light-secondary/20 dark:bg-secondary/20 border border-light-secondary/30 dark:border-secondary/30"
                        }`}
                    onPress={() =>
                      setFormData({ ...formData, category: cat.id })
                    }
                  >
                    <MaterialIcons
                      name={cat.icon}
                      size={18}
                      color={formData.category === cat.id ? "#fff" : "#6B7280"}
                    />
                    <Text
                      className={`ml-2 ${
                        formData.category === cat.id
                          ? "text-white font-semibold"
                          : "text-light-text/80 dark:text-textLight/80"
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Enhanced Payment Method Section */}
            <View className="mb-6">
              <Text className="text-light-text/80 dark:text-textLight/80 mb-3 font-medium">
                Payment Method
              </Text>
              <View className="flex flex-row gap-3 mb-4">
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    className={`flex-1 px-4 py-3 rounded-xl flex-row justify-center items-center
                        ${
                          formData.payment_method.type === method.id
                            ? "bg-brandBlue/90 border border-brandBlue"
                            : "bg-light-secondary/20 dark:bg-secondary/20 border border-light-secondary/30 dark:border-secondary/30"
                        }`}
                    onPress={() => handlePaymentMethodUpdate("type", method.id)}
                  >
                    <Ionicons
                      name={method.icon}
                      size={18}
                      color={
                        formData.payment_method.type === method.id
                          ? "#fff"
                          : "#6B7280"
                      }
                    />
                    <Text
                      className={`capitalize ml-2 ${
                        formData.payment_method.type === method.id
                          ? "text-white font-semibold"
                          : "text-light-text/80 dark:text-textLight/80"
                      }`}
                    >
                      {method.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {formData.payment_method.type === "card" && (
                <View className="space-y-4">
                  <View className="flex flex-row gap-3">
                    <TextInput
                      className="bg-light-secondary/20 dark:bg-secondary/20 text-light-text dark:text-textLight p-4 rounded-xl 
                          border border-light-secondary/30 dark:border-secondary/30 focus:border-brandBlue flex-1"
                      placeholder="Last 4 digits"
                      placeholderTextColor="#6B7280"
                      maxLength={4}
                      keyboardType="numeric"
                      value={formData.payment_method.lastFour}
                      onChangeText={(text) =>
                        handlePaymentMethodUpdate("lastFour", text)
                      }
                    />
                    <TextInput
                      className="bg-light-secondary/20 dark:bg-secondary/20 text-light-text dark:text-textLight p-4 rounded-xl 
                          border border-light-secondary/30 dark:border-secondary/30 focus:border-brandBlue flex-1"
                      placeholder="MM/YY"
                      placeholderTextColor="#6B7280"
                      value={formData.payment_method.expiryDate}
                      onChangeText={(text) =>
                        handlePaymentMethodUpdate("expiryDate", text)
                      }
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Enhanced Notes Section */}
            <View className="mb-6">
              <TouchableOpacity
                className="flex-row items-center mb-2"
                onPress={() => setShowNotes(!showNotes)}
              >
                <Text className="text-light-text/80 dark:text-textLight/80 font-medium flex-1">
                  Notes
                </Text>
                <Ionicons
                  name={showNotes ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>

              {showNotes && (
                <TextInput
                  className="bg-light-secondary/20 dark:bg-secondary/20 text-light-text dark:text-textLight p-4 rounded-xl 
                      border border-light-secondary/30 dark:border-secondary/30 focus:border-brandBlue h-32"
                  placeholder="Add any additional notes here..."
                  placeholderTextColor="#6B7280"
                  multiline
                  textAlignVertical="top"
                  value={formData.notes}
                  onChangeText={(text) =>
                    setFormData({ ...formData, notes: text })
                  }
                />
              )}
            </View>

            <View className="mt-6">
              <SubmitButton />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SubscriptionForm;
