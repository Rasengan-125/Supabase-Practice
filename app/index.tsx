import useAuthStore from "@/Store/useAuthStore";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/authContext";

export default function IndexScreen() {
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.ready);

  const { isLoading, signInAnonymously } = useAuth();
  const router = useRouter();
  const hasRun = useRef(false); // ← prevent double-execution from StrictMode / re-renders

  useEffect(() => {
    if (isLoading || !ready || hasRun.current) return;
    hasRun.current = true;

    const bootstrap = async () => {
      if (user?.id) {
        // Valid session already exists — just redirect
        router.replace({ pathname: "/Screens/Home" });
        return;
      }

      // No session — sign out stale cache and create anonymous user
      await supabase.auth.signOut();
      try {
        await signInAnonymously();
        router.replace({ pathname: "/Screens/Home" });
      } catch (err: any) {
        Alert.alert("Sign-in failed", err.message ?? "Please try again.");
      }
    };

    bootstrap();
  }, [isLoading, ready]);
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
