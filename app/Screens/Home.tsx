import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  };
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filled, setFilled] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    genre: "",
    author: "",
    rating: null as number | null,
    review: "",
  });

  const handleSubmit = async () => {
    setErrorMessage(null);

    try {
      const { error, data } = await supabase
        .from("books")
        .insert(newBook)
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
        setBooks((prev) => [...prev, data]);
        setNewBook({
          title: "",
          genre: "",
          author: "",
          review: "",
          rating: null,
        });
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong");
    }
  };
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
    } else {
      router.replace("/Screens/login");
    }
  };
  const Notification = () => {
    return <Text style={styles.successText}>Book added successfully!</Text>;
  };

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
      {submitted && <Notification />}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={newBook.title}
        onChangeText={(text) =>
          setNewBook((prev) => ({ ...prev, title: text }))
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Genre"
        value={newBook.genre}
        onChangeText={(text) =>
          setNewBook((prev) => ({ ...prev, genre: text }))
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Author"
        value={newBook.author}
        onChangeText={(text) =>
          setNewBook((prev) => ({ ...prev, author: text }))
        }
      />

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

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          filled && handleSubmit();
        }}
        disabled={!filled}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/Screens/Note")}
      >
        <Text style={styles.buttonText}>Notes</Text>
      </TouchableOpacity>
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
});
