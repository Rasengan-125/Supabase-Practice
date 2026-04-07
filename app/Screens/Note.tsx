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
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [notes, setNotes] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ← separate flag for pull-to-refresh

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) {
      console.error("Error deleting book:", error.message);
    } else {
      setNotes((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // fetchBooks now just fetches and sets state — it doesn't return anything,
  // so callers can't accidentally double-set state.
  const fetchBooks = useCallback(async () => {
    const cached = getBooksCache();
    if (cached) setNotes(cached);

    const { error, data } = await supabase
      .from("books")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching books:", error.message);
    } else {
      setNotes(data ?? []);
      setBooksCache(data ?? []);
    }
  }, []);

  const getUid = async () => {
    const { data } = await supabase.auth.getUser();
    setUid(data.user?.id ?? null);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchBooks(), getUid()]);
      setLoading(false);
    };
    init();
  }, []);

  // Real-time INSERT subscription
  useEffect(() => {
    const channel = supabase
      .channel("books-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "books" },
        (payload) => {
          const newBook = payload.new as Book;
          // Prevent duplicates if the book was just added locally too
          setNotes((prev) =>
            prev.some((b) => b.id === newBook.id) ? prev : [newBook, ...prev],
          );
        },
      )
      .subscribe((status) => console.log("Subscription:", status));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fixed: no longer tries to use fetchBooks return value
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  }, [fetchBooks]);

  const renderItem = ({ item }: { item: Book }) => (
    <View style={styles.card}>
      <Image
        source={
          item.image_url
            ? { uri: item.image_url }
            : require("@/assets/images/book_image.png")
        }
        style={styles.bookImage}
        contentFit="cover"
      />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>Author: {item.author}</Text>
      <Text style={styles.meta}>Genre: {item.genre}</Text>
      <Text style={styles.meta}>Rating: {item.rating ?? "—"}</Text>
      <Text style={styles.review}>{item.review}</Text>

      <View style={styles.buttonRow}>
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
                    onPress: () => handleDelete(item.id),
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

        <TouchableOpacity
          style={[styles.button, styles.editBtn]}
          onPress={() => {
            if (uid === item.user_id) {
              router.replace({
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
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 10,
        }}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="black"
          onPress={() => router.push("/Screens/Home")}
        />
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
          Books
        </Text>
      </View>

      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          // Fixed: use dedicated `refreshing` state, not `loading`
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  meta: { fontSize: 14, color: "#555", marginBottom: 2 },
  review: { marginTop: 8, fontSize: 14, color: "#333" },
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
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  deleteBtn: { backgroundColor: "#FF4D4D" },
  editBtn: { backgroundColor: "#007BFF" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
