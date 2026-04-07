import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/authContext";

export default function IndexScreen() {
  const { isLoading, signInAnonymously } = useAuth();
  const router = useRouter();
  const hasRun = useRef(false); // ← prevent double-execution from StrictMode / re-renders

  useEffect(() => {
    if (isLoading || hasRun.current) return;
    hasRun.current = true;

    const bootstrap = async () => {
      // Validate the session by actually hitting Supabase, not just reading
      // from AsyncStorage. If the user was deleted, getUser() returns an error
      // even though getSession() would still return a stale cached session.
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userData?.user && !userError) {
        // Valid live session — go straight to the app
        router.replace({ pathname: "/Screens/Home" });
        return;
      }

      // Session is stale or missing — clear it and create a fresh anonymous user
      await supabase.auth.signOut(); // clears AsyncStorage cache
      try {
        await signInAnonymously();
        router.replace({ pathname: "/Screens/Home" });
      } catch (err: any) {
        Alert.alert("Sign-in failed", err.message ?? "Please try again.");
      }
    };

    bootstrap();
  }, [isLoading]); // ← only depends on isLoading, not session, so it won't loop

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={styles.label}>Setting up your session…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f12",
    gap: 16,
  },
  label: {
    color: "#a1a1aa",
    fontSize: 14,
  },
});
