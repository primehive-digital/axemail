import { prisma } from "@/config/prisma";
import { decryptJson } from "@/utils/crypto";

type MailerCredentials = { password?: string; appPassword?: string };

function getFilterArg() {
  const arg = process.argv.find((value) => value.startsWith("--email=") || value.startsWith("--id="));
  if (!arg) return null;

  const [key, value] = arg.split("=");
  return { key: key.replace("--", "") as "email" | "id", value };
}

async function main() {
  const filter = getFilterArg();

  const accounts = await prisma.smtpMailerAccount.findMany({
    where: filter ? { [filter.key]: filter.value } : undefined,
    orderBy: [{ type: "asc" }, { email: "asc" }],
  });

  if (!accounts.length) {
    console.log("No matching mailer accounts found.");
    return;
  }

  const rows = accounts.map((account) => {
    const credentials = decryptJson<MailerCredentials>(account.credentialsEncrypted);

    return {
      id: account.id,
      type: account.type,
      label: account.label,
      email: account.email,
      status: account.status,
      password: credentials?.password ?? credentials?.appPassword ?? null,
    };
  });

  console.table(rows);
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
