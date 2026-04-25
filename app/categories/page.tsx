import Link from 'next/link';
import { getCategories } from '@/lib/db';

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold text-[#071133]">
          Game Categories
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-[#53627c]">
          Explore curated categories including action, indie, horror, browser-based,
          and low-spec games. Discover high-quality games with trusted official links.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="rounded-[20px] bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-[#071133]">
                {category.name}
              </h2>
              <p className="mt-2 text-sm text-[#53627c]">
                Browse games in {category.name}.
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}