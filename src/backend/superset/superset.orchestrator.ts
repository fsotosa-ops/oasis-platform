// src/backend/superset/superset.orchestrator.ts

export class SupersetOrchestrator {
    static async getGuestToken(dashboardId: string) {
      // Limpiamos la URL para asegurar que no termine en /
      const rawDomain = process.env.SUPERSET_DOMAIN || "";
      const domain = rawDomain.endsWith('/') ? rawDomain.slice(0, -1) : rawDomain;
      
      const username = process.env.SUPERSET_ADMIN_USERNAME;
      const password = process.env.SUPERSET_ADMIN_PASSWORD;

      console.log(`[Superset] Intentando conexión a: ${domain}/api/v1/security/login`);
  
      try {
        // Configuramos un timeout de 10 segundos para no colgar la app
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // 1. Obtener Access Token
        const loginRes = await fetch(`${domain}/api/v1/security/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, provider: 'db' }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!loginRes.ok) {
            const errorText = await loginRes.text();
            console.error(`[Superset] Error Login (${loginRes.status}):`, errorText);
            return { token: null, error: `Superset Login falló: ${loginRes.status}` };
        }

        const loginData = await loginRes.json();
        const accessToken = loginData.access_token;
  
        // 2. Solicitar Guest Token
        const guestRes = await fetch(`${domain}/api/v1/security/guest_token/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user: { username: "guest_user", first_name: "Guest", last_name: "User" },
            resources: [{ type: "dashboard", id: dashboardId }],
            rls: [], 
          }),
        });
  
        if (!guestRes.ok) {
             const errorText = await guestRes.text();
             console.error(`[Superset] Error Guest Token (${guestRes.status}):`, errorText);
             return { token: null, error: "No se pudo generar el Guest Token" };
        }

        const guestData = await guestRes.json();
        return { token: guestData.token, error: null };

      } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error("Superset Error: Tiempo de espera agotado (Timeout)");
            return { token: null, error: "Superset no responde (Timeout)" };
        }
        console.error("Superset Auth Error Detalle:", error);
        return { token: null, error: `Error de conexión: ${error.message}` };
      }
    }
  }