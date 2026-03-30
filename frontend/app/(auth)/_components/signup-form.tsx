import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form
      className={cn("mx-auto flex w-full max-w-lg flex-col gap-7", className)}
      {...props}
    >
      <FieldGroup className="gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-[2.5rem]">
            Create your account
          </h1>
          <p className="text-base text-muted-foreground">
            Fill in your information to start using the app.
          </p>
        </div>

        <div className="space-y-5">
          <Field>
            <FieldLabel
              className="text-[15px] font-semibold"
              htmlFor="fullName"
            >
              Full name
            </FieldLabel>
            <Input
              id="fullName"
              type="text"
              placeholder="Nguyen Van A"
              className="h-11 text-base"
              required
            />
          </Field>

          <Field>
            <FieldLabel className="text-[15px] font-semibold" htmlFor="email">
              Email
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className="h-11 text-base"
              required
            />
          </Field>

          <Field>
            <FieldLabel
              className="text-[15px] font-semibold"
              htmlFor="password"
            >
              Password
            </FieldLabel>
            <Input
              id="password"
              type="password"
              className="h-11 text-base"
              required
            />
          </Field>

          <Field>
            <FieldLabel
              className="text-[15px] font-semibold"
              htmlFor="confirmPassword"
            >
              Confirm password
            </FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              className="h-11 text-base"
              required
            />
          </Field>
        </div>

        <div className="space-y-4 pt-1">
          <FieldDescription className="text-left text-base">
            <label htmlFor="terms" className="inline-flex items-center gap-2">
              <input
                id="terms"
                type="checkbox"
                className="size-4 rounded border-border"
                required
              />
              I agree to the Terms of Service and Privacy Policy.
            </label>
          </FieldDescription>

          <Field>
            <Button
              type="submit"
              className="h-11 w-full text-base font-semibold"
            >
              Sign up
            </Button>
          </Field>

          <FieldDescription className="pt-1 text-center text-base">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline underline-offset-4"
            >
              Login
            </Link>
          </FieldDescription>
        </div>
      </FieldGroup>
    </form>
  );
}
