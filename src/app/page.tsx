import { SiteNav } from "@/components/super/SiteNav";
import { DeliverablesSection, ComparisonSection, HowItWorks, PricingCTA, SuperFooter } from "@/components/super/SuperSections";
import { RotatingHero } from "@/components/super/RotatingHero";
import { MediaShowcase, AdGallery, TestimonialsSection, StatsTicker, StickyCTA, UrgencyBanner } from "@/components/super/PremiumMedia";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white pb-16 md:pb-0">
      <UrgencyBanner />
      <SiteNav />
      <main>
        <RotatingHero />
        <StatsTicker />
        <MediaShowcase />
        <DeliverablesSection />
        <AdGallery />
        <ComparisonSection />
        <TestimonialsSection />
        <HowItWorks />
        <PricingCTA />
      </main>
      <SuperFooter />
      <StickyCTA />
    </div>
  );
}
