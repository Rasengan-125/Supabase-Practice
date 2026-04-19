import useAuthStore from "@/Store/useAuthStore";
import { supabase } from "@/utils/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createBook = async (payload: {
  title: string;
  genre: string;
  author: string;
  rating: number | null;
  review: string;
  uid: string;
  imageUrl: string | null;
}) => {
  const bookData: any = {
    title: payload.title,
    genre: payload.genre,
    author: payload.author,
    review: payload.review,
    rating: payload.rating,
    user_id: payload.uid,
  };

  if (payload.imageUrl) bookData.image_url = payload.imageUrl;

  const { data, error } = await supabase
    .from("books")
    .insert(bookData)
    .select()
    .single();

  if (error) {
    throw new Error(
      error.message.includes("duplicate")
        ? "This book already exists!"
        : error.message,
    );
  }

  return data;
};

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (payload: {
      title: string;
      genre: string;
      author: string;
      rating: number | null;
      review: string;
      imageUrl: string | null;
    }) => createBook({ ...payload, uid: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};
