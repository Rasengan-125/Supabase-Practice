import { supabase } from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const router = useRouter(); // Hook to handle navigation between screens
  const {
    control,
    handleSubmit,

    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  const handleLogIn: SubmitHandler<FormValues> = async ({
    email,
    password,
  }) => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });
    if (error) {
      setError("root", {
        message: error.message,
      });
    } else {
      router.replace({ pathname: "/Screens/Home" });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      {/* Email input field */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input]}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      {/* Password input field */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input]}
            placeholder="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <TouchableOpacity
        style={[
          styles.button,
          (!!errors.email || !!errors.password) && { opacity: 0.7 },
        ]}
        onPress={handleSubmit(handleLogIn)}
        disabled={!!errors.email || !!errors.password}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>
      {errors.root && <Text style={styles.error}>{errors.root.message}</Text>}

      <TouchableOpacity onPress={() => router.push("/auth/signUp")}>
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
  textError: {
    color: "red",
    marginBottom: 10,
  },
  // Styling for the "Sign Up" navigation link
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#007BFF",
  },
  inputError: {
    borderColor: "red",
  },
});
