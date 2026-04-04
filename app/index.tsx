import { supabase } from "@/utils/supabase";
import * as Linking from "expo-linking";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const url = Linking.useURL();

  // Detect if the app was opened via an authentication deep link (contains a code).
  // If so, we must wait for /auth/callback to exchange the code for a session
  // before we decide to redirect the user to the login page.
  const isAuthCallback = url?.includes("code=") || url?.includes("error=");

  useEffect(() => {
    // Check for an existing session on mount
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasSession(!!session);
    };

    getInitialSession();

    // Listen for auth state changes (e.g., session creation via confirmation link)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setHasSession(!!session);
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, []); // Only set up the listener once on mount

  // Show a loading spinner while determining the authentication state
  if (hasSession === null || (isAuthCallback && !hasSession)) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size={"large"} color={"#007BFF"} />
      </View>
    );
  }

  // Redirect based on whether a session exists
  return hasSession ? (
    <Redirect href="/Screens/Home" />
  ) : (
    <Redirect href="/Screens/login" />
  );
}
