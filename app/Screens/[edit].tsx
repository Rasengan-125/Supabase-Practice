import { supabase } from "@/utils/supabase";
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
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { edit: id } = useLocalSearchParams();
  const [editBook, setEditBook] = useState({
    title: "",
    genre: "",
    author: "",
    rating: null as number | null,
    review: "",
  });
  const bookId = parseInt(id as string, 10);

  if (isNaN(bookId)) {
    console.error("Invalid ID:", id);
    return;
  }

  // Fetch existing book
  useEffect(() => {
    const fetchBook = async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (error) {
        console.error("Error fetching book:", error.message);
      } else {
        setEditBook({
          title: data.title,
          genre: data.genre,
          author: data.author,
          rating: data.rating ?? null,
          review: data.review,
        });
      }
      setLoading(false);
    };

    fetchBook();
  }, [id]);

  // Update book
  const update = async () => {
    setUpdating(true);
    const { error } = await supabase
      .from("books")
      .update(editBook)
      .eq("id", bookId);
    setLoading(false);
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
  };

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
        <Text style={styles.heading}>Edit Book</Text>

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
            const parsed = text === "" ? null : Number(text);
            setEditBook({ ...editBook, rating: parsed });
          }}
        />

        <TouchableOpacity style={styles.button} onPress={update}>
          <Text style={styles.buttonText}>Update Book</Text>
        </TouchableOpacity>
      </ScrollView>
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
