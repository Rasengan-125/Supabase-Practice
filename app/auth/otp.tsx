import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OTPScreen() {
  const router = useRouter();

  // State for the 8-digit code
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { email } = useLocalSearchParams();
  const cleanEmail = email as string;

  const handleResend = async () => {
    if (!cleanEmail) {
      setError("Email not found. Please try signing up again.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
    });
    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      Alert.alert("Success", "A new 8-digit code has been sent to your email.");
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 8) return setError("Please enter a valid 8-digit code");
    if (!cleanEmail) return setError("Missing email address.");

    setLoading(true);
    setError("");

    // Logic for verifying OTP with Supabase will be implemented
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: otp.trim(),
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace({ pathname: "/Screens/Home" });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        Please enter the 8-digit code sent to your email address to continue.
      </Text>

      {/* OTP Input Field */}
      <TextInput
        style={styles.input}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={8}
        value={otp}
        onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))}
        textAlign="center"
      />

      {/* Error Feedback */}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.button, otp.length !== 8 && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Verify Code</Text>
        )}
      </TouchableOpacity>

      {/* Resend Logic */}
      <TouchableOpacity onPress={handleResend} disabled={loading}>
        <Text style={styles.link}>Didn't receive a code? Resend</Text>
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
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    fontSize: 24,
    letterSpacing: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#A0CCFF",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  link: {
    marginTop: 25,
    textAlign: "center",
    color: "#007BFF",
    fontWeight: "500",
  },
});
