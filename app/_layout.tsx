import { Stack } from "expo-router";
import "./global.css";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import React from "react";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    // In a real app, you would check for a token or user session
    // For demo purposes, we'll start with the auth screen
    setIsAuthenticated(false);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="(auth)/index" />
      ) : (
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="Subscription/[id]"
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack>
  );
}
