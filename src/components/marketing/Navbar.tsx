import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/kits", label: "Public kits" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          Claros
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-5 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/kit/demo-nextjs-saas-architecture" />}
            nativeButton={false}
          >
            Try the demo
          </Button>
        </nav>
      </div>
    </header>
  );
}
