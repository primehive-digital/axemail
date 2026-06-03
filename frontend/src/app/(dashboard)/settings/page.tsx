import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <main className="bg-background p-4 sm:p-6">
      <Card className="gap-0 rounded-xl border border-border bg-card py-0 shadow-sm shadow-black/5 ring-0">
        <CardHeader className="border-b px-5 py-4 pt-6">
          <h2 className="font-google-sans text-xl font-semibold text-heading">Settings</h2>
          <p className="font-inter text-sm text-muted-foreground">Manage account and workspace preferences.</p>
        </CardHeader>
        <CardContent className="px-5 py-5 font-inter text-sm text-muted-foreground">
          Settings controls will be configured during the dedicated settings integration step.
        </CardContent>
      </Card>
    </main>
  );
}