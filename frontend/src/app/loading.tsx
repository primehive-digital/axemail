import Image from "next/image";

import Logo from "../../public/favicons/logo.svg";

export default function Loading() {
  return (
    <main className="relative flex h-svh w-full items-center justify-center overflow-hidden bg-background">
      <div className="w-64 overflow-hidden">
        <Image src={Logo} alt="Axemail" priority className="h-auto w-full" />
      </div>
    </main>
  );
}
