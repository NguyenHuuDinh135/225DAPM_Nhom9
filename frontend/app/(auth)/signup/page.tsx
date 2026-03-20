import { AuthShell } from "../_components/auth-shell";
import { SignupForm } from "../_components/signup-form";

export default function SignupPage() {
  return (
    <AuthShell imageAlt="Create your account">
      <SignupForm />
    </AuthShell>
  );
}
