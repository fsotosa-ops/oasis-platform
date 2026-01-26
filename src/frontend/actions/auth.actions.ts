"use server";

import { AuthConnector } from "@/middleware/connectors/auth.connector";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const result = await AuthConnector.login(formData);
  
  if (result.error) {
    return { error: result.error };
  }
  
  redirect("/participant");
}

export async function signupAction(formData: FormData) {
  const result = await AuthConnector.signup(formData);
  
  if (result.error) {
     return { error: result.error };
  }

  // If there is a message (e.g. need to confirm email), return it
  if (result.message) {
      return { success: result.message };
  }
  
  redirect("/participant");
}

export async function recoverPasswordAction(formData: FormData, origin: string) {
    const result = await AuthConnector.recoverPassword(formData, origin);
    
    if (result.error) {
        return { error: result.error };
    }
    
    return { success: result.message };
}

export async function loginWithGoogleAction() {
    // Implementing OAuth with server actions usually requires a redirect chain
    // created by the server client. However, typically OAuth is initiated client-side
    // or via a server redirect URL.
    // For now, we will leave OAuth as a client-side initiation to be pragmatic,
    // or we can generate the URL on the server and redirect.
    // Let's stick to the Orchestrator/Backend pattern:
    // The client SDK provides the easiest way to do `signInWithOAuth` because it handles the window location.
    // Moving this to the backend requires `signInWithOAuth` to return a URL, and then we redirect to it.
    
    // For this refactor, I will focus on Email/Password as per the plan, 
    // but the original file had Google Login. 
    // I will try to support it if the Orchestrator can generate the URL.
    
    // NOTE: Supabase `signInWithOAuth` on the server (GoTrueClient) returns a `url`.
    // So we can redirect to that URL.
    
    /* 
       Implementation note: Passing headers or request info might be needed for Redirect URLs.
       But for now let's implement the basic structure.
    */
}
