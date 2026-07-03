import { useEffect, useState } from "react"
import { Link } from "react-router"
import { siteConfig } from "@/lib/site-config"
import {
  Monitor,
  Download,
  Calendar,
  LifeBuoy,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react"

const roles = [
  "IT consultation",
  "remote support",
  "server management",
  "system administration",
  "tech solutions",
]

const quickLinks = [
  {
    title: "Take Control",
    description: "Remote access for instant support",
    href: siteConfig.links.takeControl,
    icon: Monitor,
    status: "active" as const,
  },
  {
    title: "Remote Controls",
    description: "Download remote access tools",
    href: siteConfig.links.downloadRemote,
    icon: Download,
    status: "active" as const,
  },
  {
    title: "Book With Alex",
    description: "Schedule a consultation session",
    href: siteConfig.links.bookWithAlex,
    icon: Calendar,
    status: "active" as const,
  },
  {
    title: "Helpdesk",
    description: "Submit tickets and get support",
    href: siteConfig.links.helpdesk,
    icon: LifeBuoy,
    status: "active" as const,
  },
  {
    title: "Dashboard",
    description: "Monitor systems and status",
    href: siteConfig.links.dashboard,
    icon: LayoutDashboard,
    status: "active" as const,
  },
]

export function LandingPage() {
  const [currentRole, setCurrentRole] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const targetText = roles[currentRole]
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < targetText.length) {
            setDisplayText(targetText.slice(0, displayText.length + 1))
          } else {
            setTimeout(() => setIsDeleting(true), 2000)
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1))
          } else {
            setIsDeleting(false)
            setCurrentRole((prev) => (prev + 1) % roles.length)
          }
        }
      },
      isDeleting ? 50 : 100,
    )
    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, currentRole])

  return (
    <>
      {/* Hero */}
      <section className="relative px-4 pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:min-h-[70vh] lg:grid-cols-2 lg:gap-20">
            {/* Left — text */}
            <div className="space-y-8 sm:space-y-10">
              <div className="animate-fade-in-up space-y-3">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary sm:tracking-[0.35em]">
                  HUOC — HomeGuard of Bill
                </p>
                <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl xl:text-6xl">
                  Experts in
                  <br />
                  <span className="typing-cursor bg-gradient-to-l from-primary/50 to-accent bg-clip-text text-transparent">
                    {displayText}
                  </span>
                </h1>
              </div>

              <p className="animate-fade-in-up stagger-2 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                {siteConfig.description}
              </p>

              <div className="animate-fade-in-up stagger-3 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/inside"
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-lg border border-primary bg-primary/10 px-7 py-4 font-mono text-sm text-primary transition-all duration-500 hover:bg-primary hover:text-primary-foreground active:scale-[0.98] sm:py-3.5"
                >
                  <span className="relative z-10">inside HUOC</span>
                  <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                  <span className="absolute inset-0 -translate-x-full bg-primary transition-transform duration-500 group-hover:translate-x-0" />
                </Link>
                <a
                  href={siteConfig.links.bookWithAlex}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-3 rounded-lg border border-border px-7 py-4 font-mono text-sm text-muted-foreground transition-all duration-300 hover:border-foreground hover:bg-secondary/50 hover:text-foreground active:scale-[0.98] sm:py-3.5"
                >
                  <span>book a session</span>
                  <span className="translate-x-(-2) opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    →
                  </span>
                </a>
              </div>
            </div>

            {/* Right — terminal card */}
            <div className="animate-scale-in stagger-4 relative">
              <div className="glass hover-lift relative rounded-xl border border-border bg-card/60 p-5 sm:p-8">
                {/* Terminal dots */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive/60 transition-colors hover:bg-destructive" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60 transition-colors hover:bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-primary/60 transition-colors hover:bg-primary" />
                </div>
                <div className="absolute top-3.5 left-1/2 -translate-x-1/2 rounded-md bg-background/50 px-3 py-1 font-mono text-xs text-muted-foreground">
                  terminal://huoc
                </div>

                <pre className="mt-6 overflow-hidden font-mono text-[10px] leading-relaxed text-primary/80 sm:text-xs md:text-sm">
                  <span className="sm:hidden">{`┌───────────────────────┐
│ ██╗  ██╗██╗   ██╗    │
│ ██║  ██║██║   ██║    │
│ ███████║██║   ██║    │
│ ██╔══██║██║   ██║    │
│ ██║  ██║╚██████╔╝    │
│ ╚═╝  ╚═╝ ╚═════╝    │
│       O C            │
│                      │
│ > status: online     │
│ > uptime: 24/7       │
└───────────────────────┘`}</span>
                  <span className="hidden sm:block">{`┌──────────────────────────────────────┐
│                                      │
│  ██╗  ██╗██╗   ██╗ ██████╗  ██████╗  │
│  ██║  ██║██║   ██║██╔═══██╗██╔════╝  │
│  ███████║██║   ██║██║   ██║██║       │
│  ██╔══██║██║   ██║██║   ██║██║       │
│  ██║  ██║╚██████╔╝╚██████╔╝╚██████╗ │
│  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝  ╚═════╝ │
│                                      │
│   > services: IT, Remote, Support    │
│   > status: operational              │
│   > uptime: 24/7                     │
│                                      │
└──────────────────────────────────────┘`}</span>
                </pre>
              </div>

              {/* Floating badges */}
              <div className="animate-float absolute -top-2 -right-2 rounded-lg border border-primary/40 bg-primary/15 px-3 py-1.5 font-mono text-[11px] text-primary sm:-top-6 sm:-right-6 sm:px-4 sm:text-xs">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                  online
                </span>
              </div>
              <div
                className="animate-float glass absolute -bottom-3 -left-2 rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-[11px] text-muted-foreground sm:-bottom-6 sm:-left-6 sm:px-4 sm:text-xs"
                style={{ animationDelay: "1s" }}
              >
                24/7 support
              </div>

              <div className="absolute top-1/2 left-1/2 -z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="animate-fade-in stagger-6 absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
          <span className="font-mono text-xs text-muted-foreground">
            scroll
          </span>
          <div className="h-12 w-px animate-pulse bg-gradient-to-b from-primary/50 to-transparent" />
        </div>
      </section>

      {/* Services grid */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 space-y-3 sm:mb-14">
            <p className="animate-fade-in-up font-mono text-xs uppercase tracking-[0.25em] text-primary sm:tracking-[0.35em]">
              Services
            </p>
            <h2 className="animate-fade-in-up stagger-1 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Quick Access
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link, index) => (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="animate-fade-in-up glass hover-lift group relative overflow-hidden rounded-xl border border-border/60 bg-card/40 p-6 transition-all duration-400 hover:border-primary/40 hover:bg-card/70 active:scale-[0.99] sm:p-7"
                style={{ animationDelay: `${index * 100 + 200}ms` }}
              >
                {/* Status dot */}
                <div className="absolute top-5 right-5 flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-sm shadow-primary/50" />
                  <span className="font-mono text-xs text-muted-foreground">
                    {link.status}
                  </span>
                </div>

                <link.icon className="mb-4 h-6 w-6 text-primary/70 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />

                <h3 className="mb-2 text-lg font-bold tracking-tight transition-all duration-300 group-hover:text-gradient sm:text-xl">
                  {link.title}
                </h3>

                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  {link.description}
                </p>

                <div className="flex items-center gap-2 font-mono text-xs text-primary transition-all duration-300 group-hover:text-foreground">
                  <ExternalLink className="h-4 w-4 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                  <span className="underline-animate">open</span>
                </div>

                {/* Bottom border gradient */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary via-primary/80 to-transparent transition-all duration-500 group-hover:w-full" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
