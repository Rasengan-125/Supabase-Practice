import { AuthProvider } from "@/context/authContext";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Module-level variable — survives re-renders and is readable by any screen
// without needing context or state. The callback screen reads this directly.
let pendingDeepLinkUrl: string | null = null;

export function getPendingDeepLink() {
  return pendingDeepLinkUrl;
}
export function clearPendingDeepLink() {
  pendingDeepLinkUrl = null;
}

export default function RootLayout() {
  const capturedRef = useRef(false);

  useEffect(() => {
    if (capturedRef.current) return;
    capturedRef.current = true;

    // Case 1: App was COLD STARTED by tapping the magic link
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("access_token")) {
        console.log("[Layout] Cold-start deep link captured:", url);
        pendingDeepLinkUrl = url;
      }
    });

    // Case 2: App was already running in the background
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (url && url.includes("access_token")) {
        console.log("[Layout] Background deep link captured:", url);
        pendingDeepLinkUrl = url;
      }
    });

    return () => sub.remove();
  }, []);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
