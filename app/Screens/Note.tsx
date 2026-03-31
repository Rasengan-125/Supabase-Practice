import { getBooksCache, setBooksCache } from "@/utils/cache";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
};

const Notes = () => {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [notes, setNotes] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) {
      console.error("Error deleting book:", error.message);
    } else {
      // Update local state to remove deleted book
      setNotes((prev) => prev.filter((b) => b.id !== id));
    }
  };
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      const cached = getBooksCache();
      if (cached) {
        setNotes(cached);
        setLoading(false);
        return;
      } else {
      }
      const { error, data } = await supabase
        .from("books")
        .select("*")
        .order("id", { ascending: false });
      if (error) {
        console.error("Error Here:", error.message);
      } else {
        setNotes(data ?? []);
        setBooksCache(data ?? []);
      }
      setLoading(false);
    };
    const getUid = async () => {
      const { data } = await supabase.auth.getUser();
      setUid(data.user?.id ?? null);
    };

    fetchBooks();
    getUid();
  }, []);
  const renderItem = ({ item }: { item: Book }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.meta}>Author: {item.author}</Text>
        <Text style={styles.meta}>Genre: {item.genre}</Text>
        <Text style={styles.meta}>Rating: {item.rating ?? null}</Text>

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
                      onPress: () => handleDelete(item.id), // use item.id here
                    },
                  ],
                  { cancelable: false },
                );
              } else {
                Alert.alert("You can only edit books that you added.");
              }
            }}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.editBtn]}
            onPress={() => {
              if (uid === item.user_id) {
                router.push({
                  pathname: "/Screens/[edit]",
                  params: { edit: item.id },
                });
              } else {
                Alert.alert("You can only delete books that you added.");
              }
            }}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          margin: 15,
        }}
      >
        Books
      </Text>

      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
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
