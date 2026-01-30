import { PageContainer } from "@/shared/components/layout/PageContainer";
import { ProfileForm } from "@/features/settings/components/ProfileForm";

export default function SettingsPage() {
  return (
    <PageContainer>
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Tu Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tu información personal y preferencias de cuenta.
        </p>
      </div>
      <div className="max-w-2xl">
        <ProfileForm />
      </div>
    </PageContainer>
  );
}