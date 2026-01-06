import { MainLayout } from "@/components/layout/main-layout";
import { InquiryForm } from "@/components/inquiry/inquiry-form";

export default async function InquiryPage() {
  return (
    <MainLayout>
      <InquiryForm />
    </MainLayout>
  );
}
