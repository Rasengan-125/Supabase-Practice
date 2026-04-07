import { uploadImage } from "@/utils/storge";
import { supabase } from "@/utils/supabase";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Home = () => {
  type Book = {
    id: number;
    created_at: Date;
    title: string;
    genre: string;
    author: string;
    rating: number | null;
    review: string;
    image_url?: string | null;
  };

  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filled, setFilled] = useState(false);

  // --- New/Recurring user state ---
  // "new"       = anonymous user on first ever launch (created_at within last 10s)
  // "returning" = anonymous user who has used the app before
  // "member"    = has a real email account
  type UserKind = "new" | "returning" | "member" | null;
  const [userKind, setUserKind] = useState<UserKind>(null);

  const [newBook, setNewBook] = useState({
    title: "",
    genre: "",
    author: "",
    rating: null as number | null,
    review: "",
  });

  // Detect whether this is a new user, a returning anonymous user, or a member
  useEffect(() => {
    const detectUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;

      if (!user.is_anonymous) {
        // Has email — confirmed member
        setUserKind("member");
        return;
      }

      // Anonymous user: compare created_at to now.
      // If the account was created less than 15 seconds ago, treat as "new".
      const createdAt = new Date(user.created_at).getTime();
      const ageSeconds = (Date.now() - createdAt) / 1000;
      setUserKind(ageSeconds < 15 ? "new" : "returning");
    };

    detectUser();
  }, []);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access photos is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Anonymous users must sign up before adding books
    if (session?.user.is_anonymous) {
      router.push("/auth/signUp");
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setErrorMessage("You must be logged in to add a book.");
        return;
      }

      let finalImageUrl = null;
      if (imageUri) {
        setUploading(true);
        try {
          finalImageUrl = await uploadImage(userData.user.id, imageUri);
        } catch (uploadErr) {
          console.error(uploadErr);
          setErrorMessage("Failed to upload image.");
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const bookData: any = { ...newBook, user_id: userData.user.id };
      if (finalImageUrl) bookData.image_url = finalImageUrl;

      const { error, data } = await supabase
        .from("books")
        .insert(bookData)
        .select()
        .single();

      if (error) {
        setErrorMessage(
          error.message.includes("duplicate")
            ? "This book already exists!"
            : error.message,
        );
        return;
      }

      setBooks((prev) => [...prev, data]);
      setNewBook({
        title: "",
        genre: "",
        author: "",
        review: "",
        rating: null,
      });
      setImageUri(null);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong");
    }
  };

  // Fixed: was routing to wrong path "/Screens/login"
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
    } else {
      router.replace("/"); // go back to index which creates a fresh anon session
    }
  };

  useEffect(() => {
    const isFilled =
      newBook.author.trim() !== "" &&
      newBook.title.trim() !== "" &&
      newBook.genre.trim() !== "" &&
      newBook.rating !== null;
    setFilled(isFilled);
  }, [newBook]);

  // Banner colours and messages per user kind
  const bannerConfig: Record<
    NonNullable<UserKind>,
    { bg: string; text: string; label: string }
  > = {
    new: {
      bg: "#e0f7e9",
      text: "#1a7a3c",
      label: "👋 Welcome! You're browsing as a guest.",
    },
    returning: {
      bg: "#fff8e1",
      text: "#8a6000",
      label: "👤 Welcome back, guest! Sign up to save your books.",
    },
    member: {
      bg: "#e8f0fe",
      text: "#1a56db",
      label: "✅ Signed in as a member.",
    },
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add Book</Text>

      {/* ── User kind banner ── */}
      {userKind && (
        <View
          style={[
            styles.banner,
            { backgroundColor: bannerConfig[userKind].bg },
          ]}
        >
          <Text
            style={[styles.bannerText, { color: bannerConfig[userKind].text }]}
          >
            {bannerConfig[userKind].label}
          </Text>
          {/* Prompt guests to sign up */}
          {(userKind === "new" || userKind === "returning") && (
            <TouchableOpacity onPress={() => router.push("/auth/signUp")}>
              <Text style={styles.bannerLink}>Sign up to save your work →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {submitted && (
        <Text style={styles.successText}>Book added successfully!</Text>
      )}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Title"
        placeholderTextColor="#888888"
        value={newBook.title}
        onChangeText={(text) =>
          setNewBook((prev) => ({ ...prev, title: text }))
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Genre"
        placeholderTextColor="#888888"
        value={newBook.genre}
        onChangeText={(text) =>
          setNewBook((prev) => ({ ...prev, genre: text }))
        }
      />
      <TextInput
        style={styles.input}
        placeholder="Author"
        placeholderTextColor="#888888"
        value={newBook.author}
        onChangeText={(text) =>
          setNewBook((prev) => ({ ...prev, author: text }))
        }
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Review"
        placeholderTextColor="#888888"
        value={newBook.review}
        onChangeText={(text) =>
          setNewBook((prev) => ({ ...prev, review: text }))
        }
        multiline
        numberOfLines={4}
      />
      <TextInput
        style={styles.input}
        placeholder="Rating (1-5)"
        placeholderTextColor="#888888"
        value={newBook.rating !== null ? newBook.rating.toString() : ""}
        onChangeText={(text) =>
          setNewBook((prev) => ({
            ...prev,
            rating: text === "" ? null : Math.min(Math.max(Number(text), 1), 5),
          }))
        }
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
        {uploading ? (
          <ActivityIndicator color="#9093d5" />
        ) : imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <Text style={{ color: "#9093d5", fontSize: 15 }}>Upload Image</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, (!filled || uploading) && styles.buttonDisabled]}
        onPress={() => filled && handleSubmit()}
        disabled={!filled || uploading}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/Screens/Note")}
      >
        <Text style={styles.buttonText}>Notes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logoutBtn]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  banner: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 4,
  },
  bannerText: {
    fontSize: 13,
    fontWeight: "600",
  },
  bannerLink: {
    fontSize: 12,
    color: "#007BFF",
    marginTop: 4,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    marginVertical: 8,
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  logoutBtn: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  successText: {
    color: "green",
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 5,
    padding: 5,
  },
  imageBtn: {
    height: 160,
    width: 120,
    borderWidth: 1,
    borderColor: "#9093d5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
  },
});
