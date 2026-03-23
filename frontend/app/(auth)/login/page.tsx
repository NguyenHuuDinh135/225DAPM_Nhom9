import { AuthShell } from "../_components/auth-shell";
import { LoginForm } from "../_components/login-form";

export default function LoginPage() {
  return (
    <AuthShell imageAlt="Secure sign-in area">
      <LoginForm />
    </AuthShell>
  );
}
