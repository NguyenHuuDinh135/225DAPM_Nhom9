import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { GalleryVerticalEnd } from "lucide-react";

export function AuthShell({
  children,
  imageAlt,
}: {
  children: ReactNode;
  imageAlt: string;
}) {
  return (
    <div className="grid min-h-screen bg-muted/15 lg:grid-cols-[1.15fr_1fr]">
      <div className="flex flex-col gap-5 p-6 md:p-10 lg:px-14 lg:py-12 xl:px-20">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground/90"
          >
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            V2A Studio
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg px-1 sm:px-2">{children}</div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-muted lg:block">
        <Image
          src="https://res.cloudinary.com/learnnestjs/image/upload/v1774027405/Gemini_Generated_Image_3g1yoz3g1yoz3g1y_cdm6r3.png"
          alt={imageAlt}
          fill
          priority
          className="object-cover object-center"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
      </div>
    </div>
  );
}
