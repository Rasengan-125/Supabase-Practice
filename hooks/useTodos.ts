import { useInfiniteQuery } from "@tanstack/react-query";

const LIMIT = 15;
const fetchTodos = async ({ pageParam = 1 }: any) => {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/todos?_limit=${LIMIT}&_page=${pageParam}`,
  );
  if (!res.ok) {
    throw new Error("Something went wrong");
  }
  return res.json();
};

export const useTodos = () => {
  return useInfiniteQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,

    initialPageParam: 1,

    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < LIMIT) return undefined;
      return allPages.length + 1;
    },
  });
};
