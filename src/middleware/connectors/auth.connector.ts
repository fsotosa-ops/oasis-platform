import { AuthOrchestrator } from "@/backend/auth/auth.orchestrator";

export class AuthConnector {
  static async login(formData: FormData) {
    // Here we could add logging, metric tracking, or specialized error handling
    return await AuthOrchestrator.login(formData);
  }

  static async signup(formData: FormData) {
    return await AuthOrchestrator.signup(formData);
  }

  static async recoverPassword(formData: FormData, origin: string) {
      return await AuthOrchestrator.recoverPassword(formData, origin);
  }
}
