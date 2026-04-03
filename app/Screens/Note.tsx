import { getBooksCache, setBooksCache } from "@/utils/cache";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Define the structure for a Book object for type safety
type Book = {
  id: number;
  title: string;
  genre: string;
  author: string;
  rating: number | null;
  review: string;
  user_id: string;
  image_url?: string;
};

const Notes = () => {
  const router = useRouter(); // Hook for navigation
  const [uid, setUid] = useState<string | null>(null); // Stores current user's ID
  const [notes, setNotes] = useState<Book[]>([]); // List of books fetched from the DB
  const [loading, setLoading] = useState(true); // Tracks loading state for the UI

  // Handles deleting a book record from Supabase
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) {
      console.error("Error deleting book:", error.message);
    } else {
      // Update local state to remove deleted book
      setNotes((prev) => prev.filter((b) => b.id !== id));
    }
  };
  const fetchBooks = async () => {
    setLoading(true);
    const cached = getBooksCache();
    if (cached) {
      setNotes(cached);
      setLoading(false);
    }
    const { error, data } = await supabase
      .from("books")
      .select("*")
      .order("id", { ascending: false });
    if (error) {
      console.error("Error Here:", error.message);
    } else {
      // Update state and refresh the local cache
      setNotes(data ?? []);
      setBooksCache(data ?? []);
    }
    setLoading(false);
  };

  // Retrieves the authenticated user's ID
  const getUid = async () => {
    const { data } = await supabase.auth.getUser();
    setUid(data.user?.id ?? null);
  };

  // Initial data fetch and UID retrieval on component mount
  useEffect(() => {
    fetchBooks();
    getUid();
  }, []);

  // Subscribes to real-time 'INSERT' events on the 'books' table
  useEffect(() => {
    const channel = supabase.channel("books-channel");
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "books" },
        (payload) => {
          const newBook = payload.new as Book;
          setNotes((prev) => [...prev, newBook]);
        },
      )
      .subscribe((status) => console.log("Subscription", status));
  }, []);

  // Pull-to-refresh logic
  const onRefresh = useCallback(async () => {
    setLoading(true);
    const newData = await fetchBooks();
    setNotes((prev) => [...(newData ?? []), ...prev]);
    setLoading(false);
  }, []);

  // Renders a single book card item in the list
  const renderItem = ({ item }: { item: Book }) => {
    return (
      <View style={styles.card}>
        <Image
          // Use book image if available, otherwise use a local placeholder
          source={
            item.image_url
              ? { uri: item.image_url }
              : require("@/assets/images/book_image.jpeg")
          }
          style={styles.bookImage}
          contentFit="cover"
        />
        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.meta}>Author: {item.author}</Text>
        <Text style={styles.meta}>Genre: {item.genre}</Text>
        <Text style={styles.meta}>Rating: {item.rating ?? null}</Text>

        <Text style={styles.review}>{item.review}</Text>

        <View style={styles.buttonRow}>
          {/* Only allow deletion if the book belongs to the current user */}
          <TouchableOpacity
            style={[styles.button, styles.deleteBtn]}
            onPress={() => {
              if (uid === item.user_id) {
                Alert.alert(
                  "Delete Book",
                  "Are you sure?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => handleDelete(item.id), // use item.id here
                    },
                  ],
                  { cancelable: false },
                );
              } else {
                Alert.alert("You can only delete books that you added.");
              }
            }}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>

          {/* Only allow editing if the book belongs to the current user */}
          <TouchableOpacity
            style={[styles.button, styles.editBtn]}
            onPress={() => {
              if (uid === item.user_id) {
                router.push({
                  pathname: "/Screens/[edit]",
                  params: { edit: item.id },
                });
              } else {
                Alert.alert("You can only edit books that you added.");
              }
            }}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render a spinner while data is being loaded for the first time
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
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* Header Bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="black"
          onPress={() => router.push("/Screens/Home")}
        />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          Books
        </Text>
      </View>

      {/* Scrollable list of books */}
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default Notes;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 12,

    // iOS shadow
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

    // Android shadow
    elevation: 4,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },

  meta: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },

  review: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
  },
  bookImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  deleteBtn: {
    backgroundColor: "#FF4D4D",
  },

  editBtn: {
    backgroundColor: "#007BFF",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
