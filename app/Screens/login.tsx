import { supabase } from "@/utils/supabase";
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

export default function Login() {
  const router = useRouter(); // Hook to handle navigation between screens

  // State management for user credentials and UI feedback
  const [email, setEmail] = useState(""); // Tracks email input
  const [password, setPassword] = useState(""); // Tracks password input
  const [loading, setLoading] = useState(false); // Controls the activity spinner
  const [error, setError] = useState(""); // Stores error messages from validation or Supabase

  /**
   * Handles the sign-in process using Supabase Authentication.
   */
  const handleLogIn = async () => {
    // Sanitize inputs by removing leading/trailing whitespace
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Basic client-side validation to ensure fields aren't empty
    if (!cleanEmail || !cleanPassword) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true); // Start the loading indicator
    setError("");

    // Attempt to authenticate the user with Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    setLoading(false);

    if (error) {
      // If Supabase returns an error (e.g., invalid credentials), show it to the user
      setError(error.message);
    } else {
      // On success, redirect to the Home screen and clear the navigation history
      router.replace({ pathname: "/Screens/Home" });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      {/* Email input field */}
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
        // Note: secureTextEntry should be uncommented in production to hide characters
        value={password}
        onChangeText={setPassword}
      />

      {/* Conditional rendering for error messages */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Submission button with loading state support */}
      <TouchableOpacity style={styles.button} onPress={handleLogIn}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      {/* Navigation link for users who don't have an account yet */}
      <TouchableOpacity onPress={() => router.push("/Screens/signUp")}>
        <Text style={styles.link}>Don’t have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main screen container
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  // Reusable input styling
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
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // Styling for the error text displayed above the button
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  // Styling for the "Sign Up" navigation link
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#007BFF",
  },
});
