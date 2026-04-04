import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { supabase } from "../../utils/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const url = Linking.useURL();
  const processing = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      // Only proceed if we have a URL, it contains a code, and we aren't already processing
      if (url && url.includes("code=") && !processing.current) {
        processing.current = true;

        const { data, error } = await supabase.auth.exchangeCodeForSession(url);

        if (error) {
          console.error("Auth error:", error.message);
          processing.current = false; // Reset so user can try again if needed
          router.replace("/Screens/login");
          return;
        }

        // ✅ Session is now created
        router.replace("/Screens/Home");
      }
    };

    handleAuth();
  }, [url]);

  return null;
}
