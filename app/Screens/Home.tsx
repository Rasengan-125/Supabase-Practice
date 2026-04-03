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
} from "react-native";

const Home = () => {
  // Define the structure for a Book object
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
  const router = useRouter(); // Hook for navigation
  const [books, setBooks] = useState<Book[]>([]); // Local state for added books
  const [imageUri, setImageUri] = useState<string | null>(null); // Local URI of the selected image
  const [uploading, setUploading] = useState(false); // Loading state for image uploads
  const [submitted, setSubmitted] = useState(false); // Controls success notification visibility
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Stores error messages
  const [filled, setFilled] = useState(false); // Tracks if all required fields are filled

  // Form state for a new book entry
  const [newBook, setNewBook] = useState({
    title: "",
    genre: "",
    author: "",
    rating: null as number | null,
    review: "",
  });

  // Handles selecting an image from the device's media library
  const pickImage = async () => {
    // Request permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access photos is required!");
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    // Ensures an image was selected. Assets is an array of objects
    //  with each obj containing: uri, width, height, filename, filesize
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Handles the submission logic for adding a new book
  const handleSubmit = async () => {
    setErrorMessage(null);

    try {
      // Ensure the user is authenticated before allowing insertion
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setErrorMessage("You must be logged in to add a book.");
        return;
      }

      let finalImageUrl = null;
      // If an image was selected, upload it to Supabase Storage first
      if (imageUri) {
        setUploading(true);
        try {
          // Now we upload to Supabase storage right before saving the book record
          finalImageUrl = await uploadImage(userData.user.id, imageUri);
        } catch (uploadErr) {
          console.error(uploadErr);
          setErrorMessage("Failed to upload image.");
          setUploading(false);
          return;
        }
        setUploading(false);
      }
      // Adds user Id to the book object to locate the owner easily
      const bookData: any = {
        ...newBook,
        user_id: userData.user.id,
      };

      // Only include image_url if we actually have one,
      // otherwise let the database default take over.
      if (finalImageUrl) {
        bookData.image_url = finalImageUrl;
      }

      // Insert the new book record into the 'books' table
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
      } else {
        // Update local state and reset form fields upon success
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
        // Hide success notification after 3 seconds
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong");
    }
  };

  // Logs the user out and redirects to the login screen
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
    } else {
      router.replace("/Screens/login");
    }
  };

  // Simple UI component for success feedback
  const Notification = () => {
    return <Text style={styles.successText}>Book added successfully!</Text>;
  };

  // Validation hook to check if all required fields have data
  useEffect(() => {
    const isFilled =
      newBook.author.trim() !== "" &&
      newBook.title.trim() !== "" &&
      newBook.genre.trim() !== "" &&
      newBook.rating !== null;

    setFilled(isFilled);
  }, [newBook]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add Book</Text>

      {/* Feedback messages */}
      {submitted && <Notification />}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      {/* Title */}
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={newBook.title}
        onChangeText={(text) =>
          setNewBook((prev) => ({ ...prev, title: text }))
        }
      />
      {/* Genre */}
      <TextInput
        style={styles.input}
        placeholder="Genre"
        value={newBook.genre}
        onChangeText={(text) =>
          setNewBook((prev) => ({ ...prev, genre: text }))
        }
      />
      {/* Author */}
      <TextInput
        style={styles.input}
        placeholder="Author"
        value={newBook.author}
        onChangeText={(text) =>
          setNewBook((prev) => ({ ...prev, author: text }))
        }
      />
      {/* Review */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Review"
        value={newBook.review}
        onChangeText={(text) =>
          setNewBook((prev) => ({ ...prev, review: text }))
        }
        multiline
        numberOfLines={4}
      />
      {/* Ratings */}
      <TextInput
        style={styles.input}
        placeholder="Rating (1-5)"
        value={newBook.rating !== null ? newBook.rating.toString() : ""}
        onChangeText={(text) =>
          setNewBook((prev) => ({
            ...prev,
            rating: text === "" ? null : Math.min(Math.max(Number(text), 1), 5),
          }))
        }
        keyboardType="numeric"
      />

      {/* Image Picker Trigger and Preview */}
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

      {/* Submit Buttons */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          filled && handleSubmit();
        }}
        disabled={!filled || uploading}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      {/* Go to notes screen button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/Screens/Note")}
      >
        <Text style={styles.buttonText}>Notes</Text>
      </TouchableOpacity>

      {/* Log out button */}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Home;

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
