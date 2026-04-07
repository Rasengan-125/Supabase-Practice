import { clearPendingDeepLink, getPendingDeepLink } from "@/app/_layout";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState("Verifying your link…");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Small delay to ensure the root layout's Linking listeners have fired
    // and stored the URL before we try to read it.
    const timer = setTimeout(() => {
      handleCallback();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleCallback = async () => {
    // Read the URL that was captured at the root layout level
    const url = getPendingDeepLink();

    console.log("[Callback] Pending URL:", url);

    if (!url) {
      setStatus("No link found. The link may have expired.");
      setIsError(true);
      setTimeout(() => router.replace("/auth/login"), 2500);
      return;
    }

    // Magic links put tokens in the fragment: myapp://auth/callback#access_token=...
    // They can also sometimes arrive as query params depending on Supabase config,
    // so we check both.
    const fragment = url.includes("#") ? url.split("#")[1] : url.split("?")[1];

    if (!fragment) {
      setStatus("Invalid link format.");
      setIsError(true);
      setTimeout(() => router.replace("/auth/login"), 2500);
      return;
    }

    const params = new URLSearchParams(fragment);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const errorParam = params.get("error");
    const errorDescription = params.get("error_description");

    console.log("[Callback] access_token present:", !!access_token);
    console.log("[Callback] refresh_token present:", !!refresh_token);
    console.log("[Callback] error:", errorParam);

    if (errorParam) {
      setStatus(errorDescription ?? "Link error. Please try again.");
      setIsError(true);
      setTimeout(() => router.replace("/auth/login"), 2500);
      return;
    }

    if (!access_token || !refresh_token) {
      setStatus("Missing tokens. The link may have already been used.");
      setIsError(true);
      setTimeout(() => router.replace("/auth/login"), 2500);
      return;
    }

    setStatus("Signing you in…");

    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (sessionError) {
      console.error("[Callback] setSession error:", sessionError.message);
      setStatus(sessionError.message);
      setIsError(true);
      setTimeout(() => router.replace("/auth/login"), 2500);
      return;
    }

    // Clear the stored URL so it isn't re-used on next app open
    clearPendingDeepLink();

    setStatus("Success! Setting up your account…");
    router.replace("/auth/password");
  };

  return (
    <View style={styles.container}>
      {!isError && <ActivityIndicator size="large" color="#007BFF" />}
      {isError && <Text style={styles.errorIcon}>⚠️</Text>}
      <Text style={[styles.status, isError && styles.errorText]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    gap: 16,
    padding: 32,
  },
  status: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
  },
  errorText: {
    color: "#dc2626",
  },
  errorIcon: {
    fontSize: 40,
  },
});
