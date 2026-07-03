import { siteConfig } from "@/lib/site-config"
import {
  Monitor,
  Download,
  Calendar,
  LifeBuoy,
  LayoutDashboard,
  ExternalLink,
  Heart,
} from "lucide-react"

const serviceLinks = [
  {
    label: "Take Control",
    handle: "Remote Access",
    href: siteConfig.links.takeControl,
    icon: Monitor,
  },
  {
    label: "Remote Controls",
    handle: "Download Tools",
    href: siteConfig.links.downloadRemote,
    icon: Download,
  },
  {
    label: "Book With Alex",
    handle: "Schedule a Call",
    href: siteConfig.links.bookWithAlex,
    icon: Calendar,
  },
  {
    label: "Helpdesk",
    handle: "Get Support",
    href: siteConfig.links.helpdesk,
    icon: LifeBuoy,
  },
  {
    label: "Dashboard",
    handle: "System Status",
    href: siteConfig.links.dashboard,
    icon: LayoutDashboard,
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border/30 px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 sm:gap-16 lg:grid-cols-2">
          {/* Left column */}
          <div className="animate-fade-in-up space-y-6 sm:space-y-8">
            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary sm:tracking-[0.35em]">
                Connect
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {"Need IT "}
                <span className="text-gradient">support?</span>
              </h2>
            </div>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              From remote access to server management — HUOC specializes in what
              you don&apos;t have to. Reach out anytime.
            </p>
            <div className="pt-2">
              <a
                href={siteConfig.links.bookWithAlex}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-primary bg-primary/10 px-8 py-4 font-mono text-sm text-primary transition-all duration-500 hover:text-primary-foreground active:scale-[0.98] sm:w-auto"
              >
                <span className="relative z-10">book a session</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
                <span className="absolute inset-0 -translate-x-full bg-primary transition-transform duration-500 group-hover:translate-x-0" />
              </a>
            </div>
          </div>

          {/* Right column — service links */}
          <div className="animate-fade-in-up stagger-2 space-y-6 lg:text-right">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground sm:tracking-[0.35em]">
              Quick access
            </p>
            <div className="space-y-2">
              {serviceLinks.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="animate-fade-in glass group flex items-center justify-between gap-4 rounded-xl border border-transparent p-4 transition-all duration-300 hover:border-border/50 hover:bg-card/50 active:bg-secondary/30 lg:flex-row-reverse"
                  style={{ animationDelay: `${index * 100 + 400}ms` }}
                >
                  <div className="flex items-center gap-3 lg:flex-row-reverse">
                    <link.icon className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                    <span className="font-mono text-sm font-medium transition-colors group-hover:text-gradient">
                      {link.label}
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground/50 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                  </div>
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    {link.handle}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="animate-fade-in stagger-4 mt-16 flex flex-col items-center justify-between gap-6 border-t border-border/30 pt-8 sm:mt-20 sm:flex-row sm:pt-10">
          <div className="flex items-center gap-2.5 font-mono text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span>Powered with</span>
            <Heart className="h-3.5 w-3.5 animate-pulse text-destructive" />
            <span>by HUOC</span>
          </div>
          <p className="text-center font-mono text-xs text-muted-foreground sm:text-right">
            © {new Date().getFullYear()} HUOC — HomeGuard of Bill
          </p>
        </div>
      </div>
    </footer>
  )
}
