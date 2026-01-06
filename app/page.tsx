import { HeroSection } from "@/components/home/hero-section";
import { HomeContentSection } from "@/components/home/home-content-section";
import { MainLayout } from "@/components/layout/main-layout";

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <HomeContentSection />
    </MainLayout>
  );
}
