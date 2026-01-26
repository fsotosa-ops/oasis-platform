"use client";

import { Button } from "@/frontend/components/ui/button";
import { BackgroundWaves } from "@/frontend/components/visuals/BackgroundWaves";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, User, AlertCircle, KeyRound } from "lucide-react";
import Image from "next/image";
import { loginAction, signupAction, recoverPasswordAction } from "@/frontend/actions/auth.actions";
import { createClient } from "@/backend/supabase/client"; // Kept only for Google OAuth if needed client-side

type AuthTab = "login" | "signup" | "recovery";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupEmailConfirm, setSignupEmailConfirm] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  
  // Recovery fields
  const [recoveryEmail, setRecoveryEmail] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Still used for Google Login client-side initiation
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("email", loginEmail);
    formData.append("password", loginPassword);

    try {
        const result = await loginAction(formData);
        if (result?.error) {
            setError(result.error);
        }
        // If success, the action redirects, so we don't need to do anything here
        // or we can handle it if we want custom client routing.
        // The action calls `redirect()` which throws an error NEXT_REDIRECT that Next.js catches.
    } catch {
        // We shouldn't catch the redirect error ideally, or we let it bubble up?
        // Server Actions: `redirect` should be called outside try/catch or rethrown.
        // But here we are calling it inside. 
        // Actually safely calling standard functions implies we handle the return object.
        // My action does `redirect` on success.
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Client-side quick check (optional, but good for UX)
    if (signupEmail.toLowerCase() !== signupEmailConfirm.toLowerCase()) {
      setError("Los correos electrónicos no coinciden.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("email", signupEmail);
    formData.append("password", signupPassword);
    formData.append("confirmEmail", signupEmailConfirm);
    formData.append("name", signupName);

    try {
        const result = await signupAction(formData);
        if (result?.error) {
            setError(result.error);
        } else if (result?.success) {
            setSuccess(result.success as string);
            // Optionally switch tab?
            if (typeof result.success === 'string' && result.success.includes("confirmar")) {
                 // stay here or move to login
            }
        }
    } catch {
        // Validation error
    }
    setLoading(false);
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("email", recoveryEmail);
    
    const origin = window.location.origin;
    const result = await recoverPasswordAction(formData, origin);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success as string);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError("");
    // We keep this client-side for now as it's the standard implementation
    // and migrating it to server-side requires more setup (auth callback route handling etc)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError("Error al conectar con Google: " + error.message);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-6">
      <BackgroundWaves />
      
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="glass w-full max-w-md p-8 rounded-3xl shadow-xl flex flex-col gap-6"
      >
        <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
                <Image src="/favicon.png" alt="OASIS Logo" width={80} height={80} className="h-20 w-auto" priority />
            </div>
            <h1 className="font-heading font-bold text-3xl text-gray-800">OASIS Digital</h1>
            <p className="text-sm text-gray-600">Salud Mental y Resiliencia</p>
        </div>

        {activeTab !== "recovery" ? (
          <>
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeTab === "login" 
                    ? "bg-white shadow-sm text-gray-900" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { setActiveTab("signup"); setError(""); setSuccess(""); }}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                  activeTab === "signup" 
                    ? "bg-white shadow-sm text-gray-900" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "login" ? (
                <motion.form 
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin} 
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input 
                        type="email" 
                        placeholder="Correo electrónico" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 backdrop-blur-sm transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input 
                        type="password" 
                        placeholder="Contraseña" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 backdrop-blur-sm transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <button 
                      type="button"
                      onClick={() => { setActiveTab("recovery"); setError(""); setSuccess(""); }}
                      className="text-sm text-gray-500 hover:text-aurora-cyan transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-6 rounded-xl bg-black hover:bg-gray-800 text-white font-medium shadow-md"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Iniciar Sesión"}
                  </Button>
                </motion.form>
              ) : (
                <motion.form 
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignup} 
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Nombre completo" 
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 backdrop-blur-sm transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input 
                        type="email" 
                        placeholder="Correo electrónico" 
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 backdrop-blur-sm transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input 
                        type="email" 
                        placeholder="Confirmar correo electrónico" 
                        value={signupEmailConfirm}
                        onChange={(e) => setSignupEmailConfirm(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 backdrop-blur-sm transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input 
                        type="password" 
                        placeholder="Contraseña (mínimo 6 caracteres)" 
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 backdrop-blur-sm transition-all"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-6 rounded-xl bg-black hover:bg-gray-800 text-white font-medium shadow-md"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Crear Cuenta"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/80 px-2 text-gray-500 rounded-full backdrop-blur-md">O continúa con</span>
                </div>
            </div>

            <Button 
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-6 rounded-xl border-gray-300 hover:bg-white/60 bg-white/40 flex items-center justify-center gap-3"
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
            </Button>
          </>
        ) : (
          /* Password Recovery Form */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="text-center">
              <KeyRound className="h-12 w-12 mx-auto text-aurora-cyan mb-3" />
              <h2 className="font-heading font-semibold text-xl text-gray-800">Recuperar Contraseña</h2>
              <p className="text-sm text-gray-500 mt-1">Te enviaremos un link para restablecer tu contraseña</p>
            </div>
            
            <form onSubmit={handlePasswordRecovery} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="Correo electrónico" 
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-aurora-cyan/50 backdrop-blur-sm transition-all"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-6 rounded-xl bg-aurora-cyan hover:bg-aurora-cyan/80 text-white font-medium shadow-md"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar Link de Recuperación"}
              </Button>
            </form>
            
            <button 
              type="button"
              onClick={() => { setActiveTab("login"); setError(""); setSuccess(""); }}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              ← Volver al inicio de sesión
            </button>
          </motion.div>
        )}
        
        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-red-100 text-red-700 text-center text-sm font-medium flex items-center justify-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.div>
        )}
        
        {/* Success Message */}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-green-100 text-green-700 text-center text-sm font-medium"
          >
            {success}
          </motion.div>
        )}

        <footer className="text-center text-xs text-gray-400 pt-2">
          © 2025 Fundación Summer - OASIS Digital
        </footer>
      </motion.div>
    </main>
  );
}
