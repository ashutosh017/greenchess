import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="absolute top-0 left-0 h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-500">
      {/* ================= BACKGROUND LAYERS ================= */}

      {/* Layer 1: The Robust CSS Chessboard Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          // We use rgba(128, 128, 128, 0.2) which is a transparent grey.
          // This works perfectly on both white backgrounds (looks light grey)
          // and black backgrounds (looks dark grey).
          backgroundImage: `
            conic-gradient(
              from 0deg at 50% 50%,
              rgba(128, 128, 128, 0.2) 0deg 90deg,
              transparent 90deg 180deg,
              rgba(128, 128, 128, 0.2) 180deg 270deg,
              transparent 270deg 360deg
            )
          `,
          backgroundSize: "100px 100px", // Size of a 2x2 square block
          backgroundPosition: "center",
        }}
      />

      {/* Layer 2: Vignette Overlay */}
      {/* This fades the edges to the solid background color */}
      {/* We use standard generic classes 'from-transparent' to 'to-background' via a mask or gradient */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-transparent to-background opacity-80"></div>
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-background via-transparent to-background opacity-80"></div>

      {/* ================= MAIN CONTENT ================= */}
      <section className="relative z-10 flex items-center h-full w-full">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 drop-shadow-xl">
            Master the Game
          </h1>

          <p className="text-xl text-zinc-600 dark:text-gray-200 max-w-2xl mx-auto mb-8 font-medium relative z-20">
            Join the community. Play, learn, and compete in real-time.
          </p>

          <div className="flex gap-4 justify-center relative z-20">
            <Link
              href={"/play"}
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 px-8 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5",
              )}
            >
              Start Playing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
