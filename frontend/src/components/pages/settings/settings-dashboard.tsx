"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, IdCard, LoaderCircle, LockKeyhole, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changeSettingsPassword,
  getSettingsProfile,
  updateSettingsProfile,
  type ChangeSettingsPasswordPayload,
  type SettingsProfile,
  type UpdateSettingsProfilePayload,
} from "@/lib/settings/settings-api";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentUser } from "@/store/slices/auth-slice";

const queryKey = ["settings-profile"];

const initialPasswordForm: ChangeSettingsPasswordPayload = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

type ProfileForm = UpdateSettingsProfilePayload & {
  email: string;
  role: string;
};

function buildProfileForm(profile: SettingsProfile | null | undefined, fallback: ProfileForm): ProfileForm {
  return {
    firstName: profile?.firstName ?? fallback.firstName,
    lastName: profile?.lastName ?? fallback.lastName,
    pseudoName: profile?.pseudoName ?? fallback.pseudoName,
    email: profile?.email ?? fallback.email,
    role: profile?.role ?? fallback.role,
  };
}

function formatRole(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "-";
}

function FieldIconInput({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  readOnly,
  required,
  placeholder,
  autoComplete,
  trailing,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="font-google-sans text-sm font-semibold text-heading">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative mt-2">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          value={value}
          readOnly={readOnly}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange?.(event.target.value)}
          className={cn(
            "h-11 rounded-sm bg-background pl-10 font-inter text-sm shadow-none focus-visible:ring-2 focus-visible:ring-ring",
            trailing && "pr-12",
            readOnly && "cursor-not-allowed bg-secondary/70 text-muted-foreground",
          )}
        />
        {trailing}
      </div>
    </div>
  );
}

function PasswordVisibilityButton({ isVisible, onToggle, label }: { isVisible: boolean; onToggle: () => void; label: string }) {
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onToggle}
      className="absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:text-heading"
    >
      <Icon className="size-4" />
    </button>
  );
}

function SettingsLoader() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-18 animate-pulse rounded-sm border border-border bg-secondary/70" />
      ))}
    </div>
  );
}

export function SettingsDashboard() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const fallbackProfile = useMemo<ProfileForm>(
    () => ({
      firstName: currentUser?.firstName ?? "",
      lastName: currentUser?.lastName ?? "",
      pseudoName: currentUser?.pseudoName ?? "",
      email: currentUser?.email ?? "",
      role: currentUser?.role ?? "",
    }),
    [currentUser],
  );
  const [profileDraft, setProfileDraft] = useState<Partial<ProfileForm>>({});
  const [passwordForm, setPasswordForm] = useState<ChangeSettingsPasswordPayload>(initialPasswordForm);
  const [visiblePasswords, setVisiblePasswords] = useState({ oldPassword: false, newPassword: false, confirmPassword: false });
  const profileQuery = useQuery({
    queryKey,
    queryFn: getSettingsProfile,
  });

  const profileForm = useMemo(
    () => ({ ...buildProfileForm(profileQuery.data, fallbackProfile), ...profileDraft }),
    [fallbackProfile, profileDraft, profileQuery.data],
  );

  const profileMutation = useMutation({
    mutationFn: (input: UpdateSettingsProfilePayload) => updateSettingsProfile(input),
    onSuccess: (user) => {
      dispatch(setCurrentUser(user));
      setProfileDraft({});
      toast.success("Profile updated successfully.");
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update profile."),
  });

  const passwordMutation = useMutation({
    mutationFn: (input: ChangeSettingsPasswordPayload) => changeSettingsPassword(input),
    onSuccess: () => {
      setPasswordForm(initialPasswordForm);
      toast.success("Password updated successfully.");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update password."),
  });

  function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profileForm.firstName.trim() || !profileForm.lastName.trim() || !profileForm.pseudoName.trim()) {
      toast.error("Name and pseudo name are required.");
      return;
    }

    profileMutation.mutate({
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
      pseudoName: profileForm.pseudoName.trim(),
    });
  }

  function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("All password fields are required.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password must match.");
      return;
    }

    passwordMutation.mutate(passwordForm);
  }

  return (
    <main className="flex flex-1 flex-col gap-12 p-4 lg:p-6">
      <section className="flex flex-col gap-2">
        <h1 className="font-google-sans text-2xl font-semibold text-heading">Settings</h1>
        <p className="max-w-2xl font-inter text-sm text-muted-foreground">
          Manage your account identity, profile details, and password security.
        </p>
      </section>

      <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
        <CardHeader className="border-b px-5 py-4 pt-6">
          <h2 className="font-google-sans text-xl font-semibold text-heading">Profile Details</h2>
          <p className="font-inter text-sm text-muted-foreground">Update your display identity used across the dashboard.</p>
        </CardHeader>
        <CardContent className="px-5 py-5">
          {profileQuery.isLoading ? (
            <SettingsLoader />
          ) : (
            <form className="space-y-5" onSubmit={handleProfileSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <FieldIconInput id="first-name" label="First Name" icon={UserRound} value={profileForm.firstName} required placeholder="Enter first name" autoComplete="given-name" onChange={(value) => setProfileDraft((current) => ({ ...current, firstName: value }))} />
                <FieldIconInput id="last-name" label="Last Name" icon={UserRound} value={profileForm.lastName} required placeholder="Enter last name" autoComplete="family-name" onChange={(value) => setProfileDraft((current) => ({ ...current, lastName: value }))} />
                <FieldIconInput id="pseudo-name" label="Pseudo Name" icon={IdCard} value={profileForm.pseudoName} required placeholder="Enter pseudo name" autoComplete="nickname" onChange={(value) => setProfileDraft((current) => ({ ...current, pseudoName: value }))} />
                <FieldIconInput id="email" label="Email" icon={Mail} value={profileForm.email} readOnly />
                <FieldIconInput id="role" label="Role" icon={ShieldCheck} value={formatRole(profileForm.role)} readOnly />
              </div>

              <div className="flex justify-end">
                <Button disabled={profileMutation.isPending} className="h-10 rounded-full border-none bg-black px-4 font-google-sans shadow-sm shadow-black/10 transition-all duration-200 ease-in-out hover:bg-black/80 hover:shadow-md hover:shadow-black/20 disabled:cursor-not-allowed disabled:opacity-70">
                  {profileMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Profile
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
        <CardHeader className="border-b px-5 py-4 pt-6">
          <h2 className="font-google-sans text-xl font-semibold text-heading">Password Security</h2>
          <p className="font-inter text-sm text-muted-foreground">Change your password and keep your workspace access protected.</p>
        </CardHeader>
        <CardContent className="px-5 py-5">
          <form className="space-y-5" onSubmit={handlePasswordSubmit}>
            <div className="grid gap-4 lg:grid-cols-3">
              <FieldIconInput
                id="current-password"
                label="Current Password"
                icon={LockKeyhole}
                type={visiblePasswords.oldPassword ? "text" : "password"}
                value={passwordForm.oldPassword}
                required
                placeholder="Enter current password"
                autoComplete="current-password"
                onChange={(value) => setPasswordForm((current) => ({ ...current, oldPassword: value }))}
                trailing={<PasswordVisibilityButton isVisible={visiblePasswords.oldPassword} label="Toggle current password visibility" onToggle={() => setVisiblePasswords((current) => ({ ...current, oldPassword: !current.oldPassword }))} />}
              />
              <FieldIconInput
                id="new-password"
                label="New Password"
                icon={LockKeyhole}
                type={visiblePasswords.newPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                required
                placeholder="Enter new password"
                autoComplete="new-password"
                onChange={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))}
                trailing={<PasswordVisibilityButton isVisible={visiblePasswords.newPassword} label="Toggle new password visibility" onToggle={() => setVisiblePasswords((current) => ({ ...current, newPassword: !current.newPassword }))} />}
              />
              <FieldIconInput
                id="confirm-password"
                label="Confirm Password"
                icon={LockKeyhole}
                type={visiblePasswords.confirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                required
                placeholder="Confirm new password"
                autoComplete="new-password"
                onChange={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))}
                trailing={<PasswordVisibilityButton isVisible={visiblePasswords.confirmPassword} label="Toggle confirm password visibility" onToggle={() => setVisiblePasswords((current) => ({ ...current, confirmPassword: !current.confirmPassword }))} />}
              />
            </div>

            <div className="flex justify-end">
              <Button disabled={passwordMutation.isPending} className="h-10 rounded-full border-none bg-primary px-4 font-google-sans shadow-sm shadow-[#2e5fa2]/10 transition-all duration-200 ease-in-out hover:bg-primary-hover hover:shadow-md hover:shadow-[#2e5fa2]/20 disabled:cursor-not-allowed disabled:opacity-70">
                {passwordMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}