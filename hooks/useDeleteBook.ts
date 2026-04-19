import { supabase } from "@/utils/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const handleDelete = async (id: number) => {
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) {
    console.error("Error deleting book:", error.message);
  }
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: handleDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};
