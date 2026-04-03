import { uploadImage } from "@/utils/storge";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Edit = () => {
  const router = useRouter();
  // State management for loading indicators and book data
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  // Stores the URI for the book cover image
  const [imageUri, setImageUri] = useState<string | null>(null);
  // Get the 'edit' parameter from the dynamic route which serves as the book ID
  const { edit: id } = useLocalSearchParams();
  const [editBook, setEditBook] = useState({
    title: "",
    genre: "",
    author: "",
    rating: null as number | null,
    review: "",
  });
  const bookId = parseInt(id as string, 10);

  // Fetch the book's existing details from Supabase when the component mounts
  useEffect(() => {
    const fetchBook = async () => {
      if (isNaN(bookId)) {
        Alert.alert("Error", "Invalid book ID");
        router.push("/Screens/Note");
        return;
      }

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (error) {
        Alert.alert("Error", "Could not fetch book details");
        router.push("/Screens/Note");
      } else if (data) {
        setEditBook(data);
        setImageUri(data.image_url);
      }
      setLoading(false);
    };
    fetchBook();
  }, [id]);

  // Launch the image library to pick a new cover image
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "Permission to access photos is required!",
      );
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

  // Handles the update process: uploads new images and saves changes to Supabase
  const update = async () => {
    setUpdating(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not found");

      let finalImageUrl = imageUri;

      // If the imageUri is a local file path (not a URL), upload it to storage
      if (imageUri && !imageUri.startsWith("http")) {
        setUploading(true);
        finalImageUrl = await uploadImage(userData.user.id, imageUri);
        setUploading(false);
      }

      const { error } = await supabase
        .from("books")
        .update({ ...editBook, image_url: finalImageUrl })
        .eq("id", bookId);

      if (error) {
        Alert.alert("Update Failed", error.message);
      } else {
        Alert.alert("Success", "Book updated successfully!", [
          {
            text: "OK",
            onPress: () => router.push("/Screens/Note"),
          },
        ]);
      }
    } finally {
      setUpdating(false); // Ensure updating state is reset regardless of success or failure
    }
  };

  // Render a loading spinner while initial book data is being fetched
  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="blue"
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header navigation and title */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="black"
            onPress={() => router.push("/Screens/Note")}
          />
          <Text style={styles.heading}>Edit Book</Text>
        </View>

        {/* Input fields for editing book metadata */}
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={editBook.title}
          onChangeText={(text) => setEditBook({ ...editBook, title: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Genre"
          value={editBook.genre}
          onChangeText={(text) => setEditBook({ ...editBook, genre: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Author"
          value={editBook.author}
          onChangeText={(text) => setEditBook({ ...editBook, author: text })}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Review"
          multiline
          numberOfLines={4}
          value={editBook.review}
          onChangeText={(text) => setEditBook({ ...editBook, review: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Rating (1-5)"
          keyboardType="numeric"
          value={editBook.rating !== null ? String(editBook.rating) : ""}
          onChangeText={(text) => {
            const parsed =
              text === "" ? null : Math.min(Math.max(Number(text), 1), 5);
            setEditBook({ ...editBook, rating: parsed });
          }}
        />
        {/* Image picker section showing the current or newly selected image */}
        <TouchableOpacity
          style={{
            height: 160,
            width: 120,
            borderWidth: 1,
            borderColor: "#9093d5",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 15,
            overflow: "hidden",
          }}
          onPress={pickImage}
        >
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

        <TouchableOpacity style={styles.button} onPress={update}>
          <Text style={styles.buttonText}>Update Book</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Activity indicator overlay while the database update is in progress */}
      {updating && (
        <View style={styles.overlay}>
          <ActivityIndicator
            size="large"
            color="blue"
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          />
        </View>
      )}
    </View>
  );
};

export default Edit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
    marginVertical: 10,
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)", // transparent overlay
    zIndex: 10,
  },
});
