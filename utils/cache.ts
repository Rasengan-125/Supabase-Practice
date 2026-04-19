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

let booksCache: Book[] | null = null;

export const getBooksCache = () => booksCache;

export const setBooksCache = (books: Book[] | null) => {
  booksCache = books;
};
