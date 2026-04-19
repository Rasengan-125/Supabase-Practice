import { useMutation, useQueryClient } from "@tanstack/react-query";

const createTodo = async (title: string) => {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos", {
    method: "POST",
    body: JSON.stringify({ title, completed: false }),
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};
