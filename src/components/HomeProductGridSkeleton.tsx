export default function HomeProductGridSkeleton() {
  const skeletonCards = Array.from({ length: 8 });

  return (
    <section className="py-24 bg-neutral-50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-4">Curated Collection</h2>
          <p className="text-neutral-500 max-w-2xl mx-auto">Explore our exclusive featured pieces designed for modern living.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-pulse">
          {skeletonCards.map((_, i) => (
            <div key={i} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm h-full">
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200 block" />
              <div className="p-6 flex flex-col flex-grow">
                <div className="h-3 bg-neutral-200 rounded w-1/4 mb-4" />
                <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2" />
                <div className="mt-auto pt-4">
                  <div className="h-5 bg-neutral-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-block px-10 py-4 border border-neutral-200 text-transparent bg-neutral-200 rounded-full font-medium tracking-widest uppercase animate-pulse">
            Show More
          </div>
        </div>
      </div>
    </section>
  );
}
