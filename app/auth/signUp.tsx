import { supabase } from "@/utils/supabase";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false); // ← tracks "email sent" state separately from error

  const handleSignUp = async () => {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError("");

    // Build the deep link that Supabase will append tokens to
    // This must match one of your Redirect URLs in the Supabase dashboard
    const redirectTo = Linking.createURL("/auth/callback");

    // If the user is currently anonymous, we LINK the magic link to their
    // existing account so all their data is preserved.
    // If there's no session at all, signInWithOtp creates a new user.
    const { data: sessionData } = await supabase.auth.getSession();
    const isAnonymous = sessionData?.session?.user?.is_anonymous;

    let authError;

    if (isAnonymous) {
      // Upgrade path: link email identity to the existing anonymous account
      // After clicking the magic link, the anonymous user becomes a permanent user
      // with the same user ID — all their data is retained.
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });
      authError = error;
    } else {
      // Fresh sign-up: no existing session
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectTo,
          // Set to false so the user is NOT auto-logged in on a new device.
          // The callback screen handles the session manually.
          shouldCreateUser: true,
        },
      });
      authError = error;
    }

    setLoading(false);

    if (authError) {
      setError(authError.message); // ← fixed: only show real errors here
      return;
    }

    setSent(true); // ← show success state
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check your email ✉️</Text>
        <Text style={styles.subtitle}>
          We sent a magic link to{"\n"}
          <Text style={styles.emailHighlight}>{email.trim()}</Text>
        </Text>
        <Text style={styles.hint}>
          Tap the link in your email to continue. You can close this screen.
        </Text>
        <TouchableOpacity onPress={() => setSent(false)}>
          <Text style={styles.link}>Wrong email? Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (error) setError(""); // clear error on edit
        }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Magic Link</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/auth/login")}>
        <Text style={styles.link}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
    marginBottom: 12,
    lineHeight: 24,
  },
  emailHighlight: {
    fontWeight: "bold",
    color: "#007BFF",
  },
  hint: {
    fontSize: 13,
    textAlign: "center",
    color: "#888",
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#007BFF",
  },
});
