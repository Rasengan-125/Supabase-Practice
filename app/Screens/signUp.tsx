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
  const router = useRouter(); // Hook for navigation
  // State variables for form inputs
  const [email, setEmail] = useState(""); // Stores the user's email input
  const [password, setPassword] = useState(""); // Stores the user's password input
  // State variables for UI feedback
  const [loading, setLoading] = useState(false); // Controls the loading indicator during sign-up
  const [error, setError] = useState(""); // Stores and displays any error messages

  // Creates a deep link URL for email redirection after sign-up.
  // This URL will be used by Supabase to redirect the user back to the app
  // after they confirm their email. Redirecting to "/" ensures index.tsx handles the session.
  const redirectTo = Linking.createURL("/auth/callback");

  const handleSignUp = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    if (!cleanEmail || !cleanPassword) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    // Calls the Supabase authentication service to sign up a new user
    const { error, data } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        // Specifies the URL to redirect to after email confirmation
        emailRedirectTo: redirectTo,
      },
    });
    console.log("SignUp data:", data);
    console.log("SignUp error:", error);
    setLoading(false);

    if (error) {
      setError(error.message);
    }

    if (!data.user?.confirmed_at) {
      setError(
        "Please check your email to confirm your account before continuing.",
      );
      return;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password input field */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        // secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Displays error message if any */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      {/* Link to navigate to the Login screen */}
      <TouchableOpacity onPress={() => router.push("/Screens/login")}>
        <Text style={styles.link}>Already have an account? Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container for the screen
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  // Title styling for the page
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  // Styling for text input fields
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  // Styling for the main action button
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  // Text styling for the button
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // Styling for error messages
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  // Styling for navigation links
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#007BFF",
  },
});
