type Book = any;

let booksCache: Book[] | null = null;

export const getBooksCache = () => booksCache;

export const setBooksCache = (books: Book[] | null) => {
  booksCache = books;
};
