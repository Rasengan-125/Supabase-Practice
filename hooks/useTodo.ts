import { useQuery } from "@tanstack/react-query";

const fetchTodo = async (id: number) => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`);
  return res.json();
};

// Fetch specific book

export const useTodo = (id: number | null) => {
  return useQuery({
    queryKey: ["todo", id],
    queryFn: () => fetchTodo(id!),
    enabled: id !== null,
  });
};
