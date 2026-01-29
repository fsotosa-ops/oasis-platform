import { redirect } from "next/navigation";
import { getServerAuthContext } from "@/core/auth/session";

export default async function Home() {
  const { isAuthenticated } = await getServerAuthContext();

  if (!isAuthenticated) {
    redirect("/login");
  }

  // Redirigir a la página principal de la plataforma
  redirect("/participant");
}
