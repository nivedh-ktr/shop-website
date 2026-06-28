import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-6 md:px-12 py-32">
        <div className="mb-12">
          <div className="h-12 w-64 bg-neutral-200 animate-pulse rounded-lg mb-4"></div>
          <div className="h-4 w-96 max-w-full bg-neutral-200 animate-pulse rounded-full"></div>
          <div className="h-4 w-72 max-w-full bg-neutral-200 animate-pulse rounded-full mt-2"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm h-full">
              <div className="aspect-[4/5] bg-neutral-200 animate-pulse"></div>
              <div className="p-6 flex flex-col">
                <div className="h-3 w-20 bg-neutral-200 animate-pulse rounded-full mb-4"></div>
                <div className="h-5 w-48 bg-neutral-200 animate-pulse rounded-lg mb-2"></div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-6 w-24 bg-neutral-200 animate-pulse rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
