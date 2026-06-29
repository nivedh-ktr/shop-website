export default function ProductGridSkeleton() {
  // Generate an array of 8 placeholder cards for the grid
  const skeletonCards = Array.from({ length: 8 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse">
      {skeletonCards.map((_, i) => (
        <div key={i} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm">
          {/* Image Skeleton */}
          <div className="relative aspect-[4/5] overflow-hidden bg-neutral-200 block" />
          
          {/* Text Skeletons */}
          <div className="p-6 flex flex-col flex-grow">
            <div className="h-3 bg-neutral-200 rounded w-1/4 mb-4" /> {/* Category */}
            <div className="h-5 bg-neutral-200 rounded w-3/4 mb-2" /> {/* Title */}
            <div className="mt-auto pt-4">
              <div className="h-5 bg-neutral-200 rounded w-1/3" /> {/* Price */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
