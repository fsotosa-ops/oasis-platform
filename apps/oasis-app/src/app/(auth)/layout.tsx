import { BackgroundWaves } from '@/shared/visuals/BackgroundWaves';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <BackgroundWaves />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
