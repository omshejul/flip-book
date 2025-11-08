import FlipBook from "@/components/FlipBook";
import books from "@/data/books.json";

export default function Home() {
  const book = books[0];

  if (!book) {
    return null;
  }

  return (
    <FlipBook
      bookSlug={book.slug}
      pageCount={book.pageCount}
      title={book.title}
    />
  );
}
