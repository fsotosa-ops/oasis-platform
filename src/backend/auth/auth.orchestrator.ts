import { createClient } from "@/backend/supabase/server";

export class AuthOrchestrator {
  /**
   * Logs in a user with email and password.
   */
  static async login(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email y contraseña son requeridos" };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  }

  /**
   * Signs up a new user.
   */
  static async signup(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("name") as string;
    const confirmEmail = formData.get("confirmEmail") as string;

    // Validation logic here (Backend layer)
    if (email !== confirmEmail) {
      return { error: "Los correos electrónicos no coinciden" };
    }

    if (password.length < 6) {
      return { error: "La contraseña debe tener al menos 6 caracteres" };
    }

    const supabase = await createClient();

    // Check if user exists (logic moved from frontend)
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return { error: "Este correo ya está registrado. Inicia sesión o recupera tu contraseña." };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
       return { error: error.message };
    }

    // Additional logic for existing user without session (unconfirmed)
     if (data.user && !data.session) {
         // Check identity if needed, or just return success with message
         return { success: true, message: "¡Cuenta creada! Revisa tu correo para confirmar." };
    }
    
    return { success: true };
  }
    
    /**
     * Sends a password reset email.
     */
    static async recoverPassword(formData: FormData, origin: string) {
        const email = formData.get("email") as string;
        
        if (!email) {
            return { error: "El email es requerido" };
        }

        const supabase = await createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/callback?next=/reset-password`,
        });

        if (error) {
            return { error: "Error al enviar el correo. Verifica el email e intenta de nuevo." };
        }
        
        return { success: true, message: "¡Correo enviado! Revisa tu bandeja de entrada." };
    }
}
