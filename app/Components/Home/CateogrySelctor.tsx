import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import * as Haptics from "expo-haptics";

interface CategorySelectorProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const animatedScales = useRef<Record<string, Animated.Value>>(
    categories.reduce((acc, category) => {
      acc[category] = new Animated.Value(1);
      return acc;
    }, {} as Record<string, Animated.Value>)
  );

  useEffect(() => {
    // Add new categories
    categories.forEach((category) => {
      if (!animatedScales.current[category]) {
        animatedScales.current[category] = new Animated.Value(1);
      }
    });

    // Cleanup removed categories
    const currentCategories = Object.keys(animatedScales.current);
    currentCategories.forEach((category) => {
      if (!categories.includes(category)) {
        animatedScales.current[category].stopAnimation();
        delete animatedScales.current[category];
      }
    });
  }, [categories]);

  const handlePress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectCategory(category);

    const scale = animatedScales.current[category];
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 500,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 500,
      }),
    ]).start();
  };

  const getShadowClass = (isSelected: boolean) => {
    if (isSelected) {
      return Platform.select({
        ios: "shadow-lg shadow-brandBlue/30",
        android: "elevation-4",
      });
    }
    return Platform.select({
      ios: "shadow-sm shadow-black/10",
      android: "elevation-1",
    });
  };

  return (
    <View className="my-4 ml-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="py-0 pr-4"
        decelerationRate="fast"
        snapToAlignment="center"
      >
        {categories.map((category) => (
          <Animated.View
            key={category}
            style={{ transform: [{ scale: animatedScales.current[category] }] }}
          >
            <TouchableOpacity
              className={`px-5 py-2.5 rounded-full border-2 mr-3 min-w-[90px] items-center ${getShadowClass(
                selectedCategory === category
              )} ${
                selectedCategory === category
                  ? "bg-brandBlue border-brandBlue"
                  : "dark:bg-white/10 bg-gray-100 dark:border-white/20 border-gray-300"
              }`}
              onPress={() => handlePress(category)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedCategory === category }}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedCategory === category 
                    ? "text-white" 
                    : "dark:text-white/90 text-gray-700"
                }`}
                numberOfLines={1}
              >
                {category}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

export default CategorySelector;