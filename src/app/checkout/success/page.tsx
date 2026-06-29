"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-neutral-100 max-w-lg w-full text-center mx-6">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h1 className="font-serif text-3xl font-medium mb-4">Request Sent!</h1>
          <p className="text-neutral-500 mb-8 leading-relaxed">
            Your WhatsApp order inquiry has been initiated successfully. Our team will review your requested items and reply shortly with availability and delivery timelines.
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/shop" 
              className="w-full inline-flex items-center justify-center px-8 py-4 bg-neutral-900 text-white rounded-full font-medium tracking-wide hover:bg-neutral-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Continue Shopping
            </Link>
            
            <Link 
              href="/" 
              className="w-full inline-flex items-center justify-center px-8 py-4 bg-white text-neutral-900 rounded-full font-medium tracking-wide hover:bg-neutral-50 transition-colors border border-neutral-200 group"
            >
              Return Home
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
