import { supabase } from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";

const fetchBooks = async () => {
  const { error, data } = await supabase
    .from("books")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching books:", error.message);
  }
  return data;
};

export const useBooks = () => {
  return useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
    staleTime: 5 * 60 * 1000,
  });
};
