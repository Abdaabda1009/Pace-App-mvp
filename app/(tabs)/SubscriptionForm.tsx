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

const LOGO_API_SECRET_KEY = "sk_GH5uVjkPRGic2ZscGLV6Ag"; // Replace with your secret key
const LOGO_API_PUBLIC_KEY = "pk_QxM7ndYgS-6UFUpHdOj_eQ"; // Replace with your public key

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
  const [formData, setFormData] = useState<Omit<Subscription, "id">>({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    renewalDate: initialData?.renewalDate || "",
    category: initialData?.category || "streaming",
    color: initialData?.color || "#3b82f6",
    notes: initialData?.notes || "",
    billingCycle: initialData?.billingCycle || "monthly",
    paymentMethod: initialData?.paymentMethod || { type: "card" },
    billingDate: initialData?.billingDate || "1",
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
    if (!formData.renewalDate)
      newErrors.renewalDate = "Renewal date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setFormData({
        ...formData,
        renewalDate: selectedDate.toISOString().split("T")[0],
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
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        onSubmit({
          ...formData,
          logo: logoUrl,
        });

        if (!isEditing) {
          Alert.alert("Success", "Subscription created successfully");
        } else {
          Alert.alert("Success", "Subscription updated successfully");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        Alert.alert("Error", "Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const categories = [
    { id: "streaming", icon: "tv", label: "Streaming" },
    { id: "software", icon: "laptop", label: "Software" },
    { id: "fitness", icon: "fitness-center", label: "Fitness" },
    { id: "food", icon: "fastfood", label: "Food" },
    { id: "other", icon: "category", label: "Other" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-primary dark:bg-gray-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="p-4 mt-12 bg-primary dark:bg-gray-900 rounded-2xl shadow-xl shadow-black/30">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-textLight text-2xl font-bold">
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

            {/* Brand Search Section */}
            <View className="mb-5">
              <Text className="text-textLight/80 mb-2 font-medium flex-row items-center">
                <Ionicons
                  name="pricetag"
                  size={16}
                  color="#3b82f6"
                  className="mr-2"
                />
                <Text> Service Name</Text>
              </Text>
              <View className="relative">
                <TextInput
                  className="bg-secondary/20 dark:bg-gray-800 text-textLight p-4 rounded-xl 
                      border border-secondary/30 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/50"
                  placeholder="Netflix, Spotify, Adobe..."
                  placeholderTextColor="#6B7280"
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                />

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
                <View className="mt-2 bg-secondary/20 dark:bg-gray-800 rounded-lg border border-secondary/30 max-h-56">
                  <ScrollView nestedScrollEnabled={true}>
                    {searchResults.map((brand) => (
                      <TouchableOpacity
                        key={brand.domain}
                        className="p-3 border-b border-secondary/30"
                        onPress={() => {
                          setFormData({ ...formData, name: brand.name });
                          setSearchResults([]);
                          const newLogoUrl = `https://img.logo.dev/${brand.domain}?token=${LOGO_API_PUBLIC_KEY}&size=50&format=png`;
                          setLogoUrl(newLogoUrl);
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
                            <Text className="text-textLight">{brand.name}</Text>
                            <Text className="text-textLight/50 text-xs">
                              {brand.domain}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {logoUrl && (
                <View className="mt-3 flex-row items-center">
                  <Image
                    source={{ uri: logoUrl }}
                    className="w-10 h-10 rounded-lg mr-3"
                    resizeMode="contain"
                  />
                  <Text className="text-textLight flex-1">{formData.name}</Text>
                  <TouchableOpacity
                    onPress={() => setLogoUrl(null)}
                    className="p-2"
                  >
                    <Ionicons name="close-circle" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              )}

              {(searchResults.length > 0 || logoUrl) && (
                <View className="mt-3 flex-row items-center space-x-2">
                  <TouchableOpacity
                    onPress={() => Linking.openURL("https://logo.dev")}
                  >
                    <Text className="text-textLight/50 text-xs">
                      Logos provided by Logo.dev
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Price & Date Row */}
            <View className="flex-row gap-4 mb-5">
              <View className="flex-1">
                <Text className="text-textLight/80 mb-2 font-medium flex-row items-center">
                  <Ionicons
                    name="cash"
                    size={16}
                    color="#3b82f6"
                    className="mr-2"
                  />
                  <Text> Price</Text>
                </Text>
                <TextInput
                  className="bg-secondary/20 dark:bg-gray-800 text-textLight p-4 rounded-xl 
                      border border-secondary/30 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/50"
                  placeholder="0.00"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  value={String(formData.price || "")}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: Number(text) || 0 })
                  }
                />
                {errors.price && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.price}
                  </Text>
                )}
              </View>

              <View className="flex-1">
                <Text className="text-textLight/80 mb-2 font-medium flex-row items-center">
                  <Ionicons
                    name="calendar"
                    size={16}
                    color="#3b82f6"
                    className="mr-2"
                  />
                  <Text> Next Billing</Text>
                </Text>
                <TouchableOpacity
                  className="bg-secondary/20 dark:bg-gray-800 text-textLight p-4 rounded-xl 
                      border border-secondary/30 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/50"
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text className="text-textLight">
                    {formData.renewalDate || "Select date"}
                  </Text>
                </TouchableOpacity>
                {errors.renewalDate && (
                  <Text className="text-red-500 text-sm mt-1">
                    {errors.renewalDate}
                  </Text>
                )}

                {showDatePicker && (
                  <DateTimePicker
                    value={
                      formData.renewalDate
                        ? new Date(formData.renewalDate)
                        : new Date()
                    }
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
              </View>
            </View>

            {/* Category */}
            <View className="mb-6">
              <Text className="text-textLight/80 mb-3 font-medium">
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
                            : "bg-secondary/20 dark:bg-gray-800 border border-secondary/30"
                        }
                        active:scale-95 transition-all`}
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
                          : "text-textLight/80"
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Billing Cycle */}
            <View className="mb-6">
              <Text className="text-textLight/80 mb-3 font-medium">
                Billing Cycle
              </Text>
              <View className="flex flex-row gap-3">
                {["monthly", "yearly", "quarterly"].map((cycle) => (
                  <TouchableOpacity
                    key={cycle}
                    className={`flex-1 px-4 py-3 rounded-xl items-center
                        ${
                          formData.billingCycle === cycle
                            ? "bg-brandBlue/90 border border-brandBlue"
                            : "bg-secondary/20 dark:bg-gray-800 border border-secondary/30"
                        }
                        active:scale-95 transition-all`}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        billingCycle: cycle as
                          | "monthly"
                          | "yearly"
                          | "quarterly",
                      })
                    }
                  >
                    <Text
                      className={`capitalize ${
                        formData.billingCycle === cycle
                          ? "text-white font-semibold"
                          : "text-textLight/80"
                      }`}
                    >
                      {cycle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Details */}
            <View className="mb-6">
              <Text className="text-textLight/80 mb-3 font-medium">
                Payment Method
              </Text>
              <View className="flex flex-row gap-3 mb-4">
                {[
                  { id: "card", icon: "card" },
                  { id: "paypal", icon: "logo-paypal" },
                  { id: "bank", icon: "business" },
                ].map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    className={`flex-1 px-4 py-3 rounded-xl flex-row justify-center items-center
                        ${
                          formData.paymentMethod?.type === method.id
                            ? "bg-brandBlue/90 border border-brandBlue"
                            : "bg-secondary/20 dark:bg-gray-800 border border-secondary/30"
                        }
                        active:scale-95 transition-all`}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        paymentMethod: {
                          ...formData.paymentMethod,
                          type: method.id,
                        },
                      })
                    }
                  >
                    <Ionicons
                      name={method.icon}
                      size={18}
                      color={
                        formData.paymentMethod?.type === method.id
                          ? "#fff"
                          : "#6B7280"
                      }
                    />
                    <Text
                      className={`capitalize ml-2 ${
                        formData.paymentMethod?.type === method.id
                          ? "text-white font-semibold"
                          : "text-textLight/80"
                      }`}
                    >
                      {method.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {formData.paymentMethod?.type === "card" && (
                <View className="space-y-4">
                  <View>
                    <Text className="text-textLight/80 mb-2 font-medium">
                      Card Details
                    </Text>
                    <View className="flex flex-row gap-3">
                      <TextInput
                        className="bg-secondary/20 dark:bg-gray-800 text-textLight p-4 rounded-xl 
                            border border-secondary/30 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/50 flex-1"
                        placeholder="Last 4 digits"
                        placeholderTextColor="#6B7280"
                        maxLength={4}
                        keyboardType="numeric"
                        value={formData.paymentMethod?.lastFour}
                        onChangeText={(text) =>
                          setFormData({
                            ...formData,
                            paymentMethod: {
                              ...formData.paymentMethod,
                              lastFour: text,
                            },
                          })
                        }
                      />
                      <TextInput
                        className="bg-secondary/20 dark:bg-gray-800 text-textLight p-4 rounded-xl 
                            border border-secondary/30 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/50 flex-1"
                        placeholder="MM/YY"
                        placeholderTextColor="#6B7280"
                        value={formData.paymentMethod?.expiryDate}
                        onChangeText={(text) =>
                          setFormData({
                            ...formData,
                            paymentMethod: {
                              ...formData.paymentMethod,
                              expiryDate: text,
                            },
                          })
                        }
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Notes Section */}
            <View className="mb-6">
              <TouchableOpacity
                className="flex-row items-center mb-2"
                onPress={() => setShowNotes(!showNotes)}
              >
                <Text className="text-textLight/80 font-medium flex-1">
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
                  className="bg-secondary/20 dark:bg-gray-800 text-textLight p-4 rounded-xl 
                      border border-secondary/30 focus:border-brandBlue focus:ring-2 focus:ring-brandBlue/50"
                  placeholder="Add any additional notes here..."
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={formData.notes}
                  onChangeText={(text) =>
                    setFormData({ ...formData, notes: text })
                  }
                />
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`bg-brandBlue p-5 rounded-xl items-center 
                  shadow-lg shadow-brandBlue/30 ${
                    isSubmitting ? "opacity-70" : "active:scale-98"
                  } 
                  transition-all`}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  {isEditing ? "Update Subscription" : "Create Subscription"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SubscriptionForm;
