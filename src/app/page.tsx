
import { Suspense } from "react";
import Header from "~/components/reusables/header";

import HeroSection from "~/components/reusables/hero";
import { FeaturedCurios, FeaturedCuriosFallback } from "~/components/server/featured-curios";

export const experimental_ppr = true
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Curios Section */}
      <Suspense fallback={<FeaturedCuriosFallback />}>
        <FeaturedCurios />
      </Suspense>
    </div>
  );
}



