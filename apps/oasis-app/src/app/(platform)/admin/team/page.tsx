import { PageContainer } from "@/shared/components/layout/PageContainer";
import { TeamManager } from "@/features/organization/components/TeamManager";

export default function TeamPage() {
  return (
    <PageContainer>
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Equipo y Miembros</h1>
        <p className="text-muted-foreground">
          Gestiona los miembros de tu organización, sus roles y accesos.
        </p>
      </div>
      <TeamManager />
    </PageContainer>
  );
}