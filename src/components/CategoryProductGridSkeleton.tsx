import ProductGridSkeleton from "./ProductGridSkeleton";

export default function CategoryProductGridSkeleton() {
  return (
    <>
      <div className="mb-8 text-sm font-medium tracking-wide text-transparent bg-neutral-200 rounded animate-pulse inline-block">
        SHOWING 0 RESULTS
      </div>
      <ProductGridSkeleton />
    </>
  );
}
