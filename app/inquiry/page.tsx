import { MainLayout } from "@/components/layout/main-layout";
import { InquiryForm } from "@/components/inquiry/inquiry-form";

export default async function InquiryPage() {
  return (
    <MainLayout>
      <div
        className="min-h-screen bg-gray-50 py-8 md:py-12 container mx-auto px-4 max-w-3xl"
      >
        <InquiryForm />
      </div>
    </MainLayout>
  );
}
