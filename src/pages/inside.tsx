import { siteConfig } from "@/lib/site-config"
import { Button } from "@/components/ui/button"
import { ExternalLink, CreditCard, FileText, Users } from "lucide-react"

export function InsidePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative px-4 pt-28 pb-16 text-center sm:px-6 sm:pt-36 sm:pb-20">
        <div className="animate-fade-in-up space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary sm:tracking-[0.35em]">
            Inside HUOC
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your gateway to
            <br />
            <span className="text-gradient">everything HUOC</span>
          </h1>
        </div>
        <p className="animate-fade-in-up stagger-2 mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          {siteConfig.tagline}
        </p>

        {/* Section nav pills */}
        <div className="animate-fade-in-up stagger-3 mt-10 flex justify-center gap-2">
          {[
            { label: "Who", href: "#who" },
            { label: "Docs", href: "#docs" },
            { label: "Payment", href: "#payment" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg border border-border px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-all duration-300 hover:border-foreground/50 hover:bg-secondary/50 hover:text-foreground active:scale-[0.98]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </section>

      {/* Who We Are */}
      <section id="who" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 space-y-3 sm:mb-14">
            <p className="animate-fade-in-up font-mono text-xs uppercase tracking-[0.25em] text-primary sm:tracking-[0.35em]">
              About
            </p>
            <h2 className="animate-fade-in-up stagger-1 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Who Are We
            </h2>
          </div>

          <p className="animate-fade-in-up stagger-2 mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {siteConfig.description}
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {siteConfig.services.map((service, index) => (
              <div
                key={service}
                className="animate-fade-in-up glass hover-lift group relative overflow-hidden rounded-xl border border-border/60 bg-card/40 p-6 transition-all duration-400 hover:border-primary/40 hover:bg-card/70 sm:p-8"
                style={{ animationDelay: `${index * 100 + 200}ms` }}
              >
                <Users className="mb-4 h-6 w-6 text-primary/70 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                <h3 className="text-lg font-bold tracking-tight transition-all duration-300 group-hover:text-gradient sm:text-xl">
                  {service}
                </h3>
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary via-primary/80 to-transparent transition-all duration-500 group-hover:w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section id="docs" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 space-y-3 sm:mb-14">
            <p className="animate-fade-in-up font-mono text-xs uppercase tracking-[0.25em] text-primary sm:tracking-[0.35em]">
              Resources
            </p>
            <h2 className="animate-fade-in-up stagger-1 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Documents
            </h2>
          </div>

          <a
            href={siteConfig.links.nextcloudDocs}
            target="_blank"
            rel="noopener noreferrer"
            className="animate-fade-in-up stagger-2 glass hover-lift group flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/40 p-6 transition-all duration-400 hover:border-primary/40 hover:bg-card/70 sm:p-7"
          >
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6 text-primary/70 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
              <div>
                <h3 className="font-bold tracking-tight transition-all duration-300 group-hover:text-gradient">
                  NextCloud Doc Share
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Access shared documents and files
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-primary transition-all duration-300 group-hover:text-foreground">
              <span className="underline-animate hidden sm:inline">
                open
              </span>
              <ExternalLink className="h-4 w-4 transition-transform group-hover:rotate-12 group-hover:scale-110" />
            </div>
          </a>
        </div>
      </section>

      {/* Payment */}
      <section id="payment" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 space-y-3 sm:mb-14">
            <p className="animate-fade-in-up font-mono text-xs uppercase tracking-[0.25em] text-primary sm:tracking-[0.35em]">
              Billing
            </p>
            <h2 className="animate-fade-in-up stagger-1 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Payment Portal
            </h2>
          </div>

          <div className="animate-scale-in stagger-2 glass mx-auto max-w-lg rounded-xl border border-border/60 bg-card/40 p-8 text-center transition-all duration-400 hover:border-primary/40 hover:shadow-[0_0_40px_-8px_var(--glow-color-strong)] sm:p-10">
            <CreditCard className="mx-auto mb-5 h-10 w-10 text-primary/70" />
            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
              Secure Payment
            </h3>
            <p className="mt-3 text-muted-foreground">
              Pay your invoice securely through our payment portal.
            </p>
            <Button
              size="lg"
              className="group mt-8 gap-2 font-mono text-sm"
              onClick={() => {
                window.location.href = siteConfig.links.stripePayment
              }}
            >
              Go to Payment Portal
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
