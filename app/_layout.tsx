import { AuthProvider } from "@/context/authContext";
import useAuthStore from "@/Store/useAuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
const queryClient = new QueryClient();
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
  const authInit = useAuthStore((state) => state.init);
  useEffect(() => {
    authInit();
  }, []);

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
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
