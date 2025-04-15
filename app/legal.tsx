import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Linking,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type LegalTab = "privacy" | "terms";

const Legal = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [activeTab, setActiveTab] = useState<LegalTab>("privacy");

  const handleTabPress = (tab: LegalTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-light-background dark:bg-primary">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Legal",
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} className="ml-2">
              <Ionicons
                name="arrow-back"
                size={24}
                color={isDarkMode ? "#FFFFFF" : "#212B36"}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="flex-row border-b border-light-secondary dark:border-secondary">
        <TouchableOpacity
          className={`flex-1 items-center py-4 ${
            activeTab === "privacy"
              ? "border-b-2 border-brandBlue"
              : "border-b border-light-secondary dark:border-secondary"
          }`}
          onPress={() => handleTabPress("privacy")}
        >
          <Text
            className={`text-base font-medium ${
              activeTab === "privacy"
                ? "text-brandBlue dark:text-brandBlue/90"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Privacy Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 items-center py-4 ${
            activeTab === "terms"
              ? "border-b-2 border-brandBlue"
              : "border-b border-light-secondary dark:border-secondary"
          }`}
          onPress={() => handleTabPress("terms")}
        >
          <Text
            className={`text-base font-medium ${
              activeTab === "terms"
                ? "text-brandBlue dark:text-brandBlue/90"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Terms of Use
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {activeTab === "privacy" ? (
          <View>
            <Text className="text-2xl font-bold text-light-text dark:text-textLight mb-6">
              Privacy Policy
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              Last updated: April 15, 2025
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              This Privacy Policy describes Our policies and procedures on the
              collection, use and disclosure of Your information when You use
              the Service and tells You about Your privacy rights and how the
              law protects You.
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              We use Your Personal data to provide and improve the Service. By
              using the Service, You agree to the collection and use of
              information in accordance with this Privacy Policy. This Privacy
              Policy has been created with the help of the{" "}
              <Text
                className="text-brandBlue"
                onPress={() =>
                  handleLinkPress(
                    "https://www.termsfeed.com/privacy-policy-generator/"
                  )
                }
              >
                Privacy Policy Generator
              </Text>
              .
            </Text>

            <Text className="text-xl font-bold text-light-text dark:text-textLight mt-6 mb-4">
              Interpretation and Definitions
            </Text>
            <Text className="text-lg font-semibold text-light-text dark:text-textLight mb-2">
              Interpretation
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              The words of which the initial letter is capitalized have meanings
              defined under the following conditions. The following definitions
              shall have the same meaning regardless of whether they appear in
              singular or in plural.
            </Text>

            <Text className="text-lg font-semibold text-light-text dark:text-textLight mb-2">
              Definitions
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              For the purposes of this Privacy Policy:
            </Text>
            <View className="mb-4">
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • <Text className="font-semibold">Account</Text> means a unique
                account created for You to access our Service or parts of our
                Service.
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • <Text className="font-semibold">Affiliate</Text> means an
                entity that controls, is controlled by or is under common
                control with a party, where "control" means ownership of 50% or
                more of the shares, equity interest or other securities entitled
                to vote for election of directors or other managing authority.
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • <Text className="font-semibold">Application</Text> refers to
                Pace, the software program provided by the Company.
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • <Text className="font-semibold">Company</Text> (referred to as
                either "the Company", "We", "Us" or "Our" in this Agreement)
                refers to Pace.
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • <Text className="font-semibold">Country</Text> refers to:
                Sweden
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • <Text className="font-semibold">Device</Text> means any device
                that can access the Service such as a computer, a cellphone or a
                digital tablet.
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • <Text className="font-semibold">Personal Data</Text> is any
                information that relates to an identified or identifiable
                individual.
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • <Text className="font-semibold">Service</Text> refers to the
                Application.
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • <Text className="font-semibold">Service Provider</Text> means
                any natural or legal person who processes the data on behalf of
                the Company.
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                •{" "}
                <Text className="font-semibold">
                  Third-party Social Media Service
                </Text>{" "}
                refers to any website or any social network website through
                which a User can log in or create an account to use the Service.
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • <Text className="font-semibold">Usage Data</Text> refers to
                data collected automatically, either generated by the use of the
                Service or from the Service infrastructure itself.
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • <Text className="font-semibold">You</Text> means the
                individual accessing or using the Service, or the company, or
                other legal entity on behalf of which such individual is
                accessing or using the Service, as applicable.
              </Text>
            </View>

            <Text className="text-xl font-bold text-light-text dark:text-textLight mt-6 mb-4">
              Collecting and Using Your Personal Data
            </Text>
            <Text className="text-lg font-semibold text-light-text dark:text-textLight mb-2">
              Types of Data Collected
            </Text>
            <Text className="text-base font-semibold text-light-text dark:text-textLight mb-2">
              Personal Data
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              While using Our Service, We may ask You to provide Us with certain
              personally identifiable information that can be used to contact or
              identify You. Personally identifiable information may include, but
              is not limited to:
            </Text>
            <View className="mb-4">
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • Email address
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • First name and last name
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • Phone number
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • Usage Data
              </Text>
            </View>

            <Text className="text-base font-semibold text-light-text dark:text-textLight mb-2">
              Usage Data
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              Usage Data is collected automatically when using the Service.
              Usage Data may include information such as Your Device's Internet
              Protocol address (e.g. IP address), browser type, browser version,
              the pages of our Service that You visit, the time and date of Your
              visit, the time spent on those pages, unique device identifiers
              and other diagnostic data.
            </Text>

            <Text className="text-base font-semibold text-light-text dark:text-textLight mb-2">
              Information from Third-Party Social Media Services
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              The Company allows You to create an account and log in to use the
              Service through the following Third-party Social Media Services:
            </Text>
            <View className="mb-4">
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • Google
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • Facebook
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • Instagram
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • Twitter
              </Text>
              <Text className="text-base text-light-text dark:text-textLight mb-2">
                • LinkedIn
              </Text>
            </View>

            <Text className="text-xl font-bold text-light-text dark:text-textLight mt-6 mb-4">
              Contact Us
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              If you have any questions about this Privacy Policy, You can
              contact us:
            </Text>
            <Text
              className="text-base text-brandBlue mb-4"
              onPress={() => handleLinkPress("https://www.paceinv.com")}
            >
              By visiting this page on our website: www.paceinv.com
            </Text>
          </View>
        ) : (
          <View>
            <Text className="text-2xl font-bold text-light-text dark:text-textLight mb-6">
              Terms of Use
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              Last updated: April 15, 2025
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              Welcome to PaceInv – a subscription management platform designed
              to help users stay on top of their active subscriptions.
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              By accessing or using our app or services, you agree to be bound
              by these Terms of Use. If you do not agree with any part of these
              terms, please do not use PaceInv.
            </Text>

            <Text className="text-lg font-semibold text-light-text dark:text-textLight mt-6 mb-2">
              1. Eligibility
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              You must be at least 16 years old to use this app. By using
              PaceInv, you represent that you meet this age requirement.
            </Text>

            <Text className="text-lg font-semibold text-light-text dark:text-textLight mt-6 mb-2">
              2. Use of Service
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-2">
              You may create and manage personal subscription information and
              content within the app. You are responsible for the accuracy and
              legality of all content you create, upload, or edit.
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              You agree not to use the app for any unlawful purpose or in
              violation of any applicable laws or regulations.
            </Text>

            <Text className="text-lg font-semibold text-light-text dark:text-textLight mt-6 mb-2">
              3. User-Generated Content
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-2">
              You retain ownership of any content you create or update within
              the app. However, by using our services, you grant us a
              non-exclusive, worldwide, royalty-free license to use your content
              solely to provide and improve our services.
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              We do not claim ownership of your data, and you can delete your
              content at any time.
            </Text>

            <Text className="text-lg font-semibold text-light-text dark:text-textLight mt-6 mb-2">
              4. Intellectual Property
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              All content, trademarks, logos, and design elements on the PaceInv
              platform (excluding user-generated content) are owned by PaceInv
              or licensed to us and are protected under EU copyright and
              intellectual property laws.
            </Text>

            <Text className="text-lg font-semibold text-light-text dark:text-textLight mt-6 mb-2">
              5. Privacy
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              We take your privacy seriously. Please refer to our Privacy Policy
              to understand how your data is collected, used, and stored.
            </Text>

            <Text className="text-lg font-semibold text-light-text dark:text-textLight mt-6 mb-2">
              6. Modifications to the Service
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              We reserve the right to modify or discontinue the app or services
              at any time without notice. We are not liable for any loss or
              inconvenience caused by such changes.
            </Text>

            <Text className="text-lg font-semibold text-light-text dark:text-textLight mt-6 mb-2">
              7. Termination
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              We may suspend or terminate your access to PaceInv at any time if
              we believe you have violated these terms or used the service
              inappropriately.
            </Text>

            <Text className="text-lg font-semibold text-light-text dark:text-textLight mt-6 mb-2">
              8. Disclaimer of Warranties
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              PaceInv is provided "as is" and "as available." We do not
              guarantee that the app will always be secure, error-free, or
              available.
            </Text>

            <Text className="text-lg font-semibold text-light-text dark:text-textLight mt-6 mb-2">
              9. Limitation of Liability
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              To the fullest extent permitted by law, PaceInv shall not be
              liable for any indirect, incidental, or consequential damages
              arising out of your use of the app.
            </Text>

            <Text className="text-lg font-semibold text-light-text dark:text-textLight mt-6 mb-2">
              10. Governing Law
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-4">
              These terms are governed by the laws of the European Union. You
              agree that any disputes will be resolved in the courts of the EU
              jurisdiction applicable to your residence.
            </Text>

            <Text className="text-lg font-semibold text-light-text dark:text-textLight mt-6 mb-2">
              11. Contact Us
            </Text>
            <Text className="text-base text-light-text dark:text-textLight mb-2">
              For any questions or concerns regarding these Terms of Use, please
              visit:
            </Text>
            <Text
              className="text-base text-brandBlue mb-4"
              onPress={() => handleLinkPress("https://paceinv.com")}
            >
              🌐 https://paceinv.com
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Legal;
