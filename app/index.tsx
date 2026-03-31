import { supabase } from "@/utils/supabase";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [session, setSession] = useState(false);
  const [checkSession, setCheckSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
      setCheckSession(true);
    });
  }, []);

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
  return session ? (
    <Redirect href="/Screens/Home" />
  ) : (
    <Redirect href="/Screens/login" />
  );
}
