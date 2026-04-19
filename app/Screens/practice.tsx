import { useCreateTodo } from "@/hooks/useCreateTodo";
import { useTodo } from "@/hooks/useTodo";
import { useTodos } from "@/hooks/useTodos";
import { Skeleton } from "moti/skeleton";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SKELETON_COUNT = 8;
const ITEM_HEIGHT = 90;

export default function Practice() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [text, setText] = useState("");

  const { data: todo, isPending: isPendingTodo } = useTodo(selectedId);
  const { mutate, isPending: isCreating } = useCreateTodo();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
    isLoading,
  } = useTodos();

  const todos = isLoading
    ? Array.from({ length: SKELETON_COUNT }, (_, i) => ({ id: i, title: "" }))
    : (data?.pages.flat() ?? []);

  const handleCreate = () => {
    mutate(text, {
      onSuccess: () => setText(""),
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {selectedId && (
        <View style={{ padding: 16, backgroundColor: "#ad1b1b" }}>
          {isPendingTodo ? (
            <ActivityIndicator />
          ) : (
            <Text>Selected: {todo?.title}</Text>
          )}
        </View>
      )}

      <View style={{ padding: 16, flexDirection: "row", gap: 8 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="New todo..."
          style={{
            flex: 1,
            borderWidth: 0.5,
            borderColor: "#ccc",
            padding: 8,
            borderRadius: 6,
          }}
        />
        <TouchableOpacity
          onPress={handleCreate}
          style={{ padding: 8, backgroundColor: "#000", borderRadius: 6 }}
        >
          <Text style={{ color: "#fff" }}>
            {isCreating ? "Adding..." : "Add"}
          </Text>
        </TouchableOpacity>
      </View>

      <Skeleton.Group show={isLoading}>
        <FlatList
          data={todos}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedId(item.id)}
              style={{
                padding: 16,
                borderBottomWidth: 0.5,
                borderColor: "#ccc",
              }}
            >
              <Skeleton
                width="100%"
                height={ITEM_HEIGHT}
                colors={["#cd1919", "#511be8", "#25c53a"]}
              />
              <Skeleton
                width={30}
                height={30}
                colors={["#cd19c1", "#511be8", "#fbff1b"]}
              >
                <Text style={{ fontSize: 30 }}>{item.id}</Text>
              </Skeleton>
              <Skeleton
                width="80%"
                height={30}
                colors={["#373737", "#511be8", "#c52525"]}
              >
                <Text style={{ fontSize: 30 }}>{item.title}</Text>
              </Skeleton>
            </TouchableOpacity>
          )}
          refreshing={isRefetching}
          onRefresh={refetch}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={{ margin: 20 }} />
            ) : hasNextPage === false ? (
              <Text style={{ textAlign: "center", padding: 10 }}>
                No more data
              </Text>
            ) : null
          }
        />
      </Skeleton.Group>
    </View>
  );
}
