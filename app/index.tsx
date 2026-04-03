import { supabase } from "@/utils/supabase";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [session, setSession] = useState(false);
  const [checkSession, setCheckSession] = useState(false);

  // Get user session when the screen loads
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
      setCheckSession(true);
    });
  }, []);

  // Loading spiner background while its checking for session
  if (!checkSession) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "red",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size={"large"} color={"white"} />
      </View>
    );
  }

  // If theres a session, go to home screen. Else go to login screen
  return session ? (
    <Redirect href="/Screens/Home" />
  ) : (
    <Redirect href="/Screens/login" />
  );
}
