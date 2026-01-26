"use client";
import { useEffect, useRef, useState } from "react";
import { embedDashboard } from "@superset-ui/embedded-sdk";

export function SupersetChart({ dashboardId }: { dashboardId: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // 1. Validación preventiva: Si no hay ID, no intentamos conectar
    if (!dashboardId) {
      setErrorMsg("No se proporcionó un Dashboard ID válido.");
      return;
    }

    const fetchGuestToken = async () => {
      try {
        const response = await fetch(`/api/superset/token?id=${dashboardId}`);
        
        // 2. Manejo de errores de respuesta HTTP (400, 500, etc.)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error API Superset:", errorData);
          throw new Error(errorData.error || `Error servidor: ${response.status}`);
        }

        const data = await response.json();
        return data.token;
      } catch (err) {
        // 3. Captura de errores de red (Failed to fetch)
        console.error("Fallo al obtener token:", err);
        setErrorMsg("Error de conexión con el servicio de datos.");
        // El SDK necesita un string o promesa que resuelva a string. 
        // Retornamos null para detener el proceso internamente.
        return null; 
      }
    };

    if (divRef.current) {
      embedDashboard({
        id: dashboardId,
        supersetDomain: process.env.NEXT_PUBLIC_SUPERSET_DOMAIN || "",
        mountPoint: divRef.current,
        fetchGuestToken,
        dashboardUiConfig: { 
            hideTitle: true, 
            hideChartControls: true,
            hideTab: false,
            filters: { visible: true, expanded: true }
        },
      });
    }
  }, [dashboardId]);

  // Renderizado condicional en caso de error
  if (errorMsg) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-red-50 rounded-2xl border border-red-100 text-red-600">
        <p>⚠️ {errorMsg}</p>
      </div>
    );
  }

  return (
    <div 
      ref={divRef} 
      className="w-full min-h-[700px] overflow-hidden [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0 [&>iframe]:bg-transparent" 
      style={{ height: 'calc(100vh - 200px)' }} 
    />
  );
}