"use client";

import { PartnerCard } from "./partner-card";
import type { CompanyDto } from "@/domain/company/company.model";

interface PartnersGridProps {
  companies: CompanyDto[];
}

export function PartnersGrid({ companies }: PartnersGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {companies.map((company) => (
        <PartnerCard
          key={company.id}
          id={company.id}
          name={company.name || "병원명 없음"}
          imageUrl={company.thumbnailImageUrl || null}
          tags={company.tags || []}
          introText={company.introText}
          price={company.price}
        />
      ))}
    </div>
  );
}

