import FlipBook from '@/components/FlipBook';
import books from '@/data/books.json';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return books.map((book) => ({
    slug: book.slug,
  }));
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = books.find((b) => b.slug === slug);

  if (!book) {
    notFound();
  }

  return <FlipBook bookSlug={book.slug} pageCount={book.pageCount} title={book.title} />;
}

