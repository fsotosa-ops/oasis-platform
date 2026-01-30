import { PageContainer } from "@/shared/components/layout/PageContainer";
import { OrganizationSettings } from "@/features/organization/components/OrganizationSettings";

export default function OrganizationPage() {
  return (
    <PageContainer>
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Organización</h1>
        <p className="text-muted-foreground">
          Configura los detalles públicos y preferencias de tu organización.
        </p>
      </div>
      <div className="max-w-4xl">
        <OrganizationSettings />
      </div>
    </PageContainer>
  );
}