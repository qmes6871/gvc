import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/home/hero-section";
import { PartnerCategorySection } from "@/components/home/partner-category-section";

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <PartnerCategorySection />
    </MainLayout>
  );
}
