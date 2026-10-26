import { cn } from "@/lib/utils";

const STORE_LOGO_URL =
  "https://rp0sd4q07g.ufs.sh/f/8t6otpGzNZFgDSMnN8wxKuQ21aPHWr6GkivJT4gBflyV9X8w";

export function StoreLogo({ className }: { className?: string }) {
  return (
    <div className={cn("h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={STORE_LOGO_URL} alt="Donwise logo" className="h-full w-full object-contain" />
    </div>
  );
}
