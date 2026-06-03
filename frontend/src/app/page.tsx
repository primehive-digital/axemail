"use client";

import Image from "next/image";
import { useState, type SyntheticEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { loginUser } from "@/lib/auth/auth-api";
import { useAppDispatch } from "@/store/hooks";
import { setCurrentUser } from "@/store/slices/auth-slice";

import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import Logo from "../../public/favicons/logo.svg";

function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (session) => {
      dispatch(setCurrentUser(session.data.user));
      toast.success("Logged in successfully.");
      router.replace("/overview");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to login.");
    },
  });

  function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dark-background px-4 py-10">
      <Card className="w-full max-w-97.5 rounded-xl border-dark-border border-5 bg-dark-card">
        <CardHeader className="flex items-center justify-center">
          <div className="w-32 overflow-hidden">
            <Image
              src={Logo}
              alt="Axemail"
              className="h-auto w-full"
              priority
            />
          </div>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label
                htmlFor="email"
                className="font-google-sans text-sm font-normal! text-dark-heading"
              >
                Email Address
              </Label>

              <div className="relative mt-2">
                <Mail
                  strokeWidth={3}
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dark-muted-foreground"
                />

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  className="h-11 text-dark-foreground placeholder:text-dark-muted-foreground rounded-sm border-dark-border border bg-dark-input pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="password"
                className="font-google-sans text-sm font-normal! text-dark-heading"
              >
                Password
              </Label>

              <div className="relative mt-2">
                <LockKeyhole
                  strokeWidth={3}
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dark-muted-foreground"
                />

                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-11 text-dark-foreground placeholder:text-dark-muted-foreground rounded-sm border-dark-border border bg-dark-input pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center text-dark-muted-foreground transition hover:text-dark-heading"
                >
                  {showPassword ? (
                    <EyeOff strokeWidth={3} className="size-4" />
                  ) : (
                    <Eye strokeWidth={3} className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-2 h-12 w-full rounded-sm bg-primary font-google-sans text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover border-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loginMutation.isPending ? (
                <span className="inline-flex items-center gap-2 text-primary-foreground">
                  Logging In
                  <LoaderCircle strokeWidth={3} className="size-4 animate-spin" />
                </span>
              ) : (
                "Login"
              )}
            </Button>

            <p className="pt-3 text-center font-inter text-xs leading-auto text-dark-muted-foreground">
              Authorized access only. All campaign activity may be monitored for
              security and compliance.
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default LoginPage;
