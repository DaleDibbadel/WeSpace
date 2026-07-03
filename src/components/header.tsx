import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router"
import { cn } from "@/lib/utils"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

const navItems = [
  { label: "Home", href: "/" },
  { label: "Inside", href: "/inside" },
]

export function Header() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { pathname } = useLocation()
  const { theme, setTheme } = useTheme()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "border-b border-border/50 bg-background/80 shadow-sm backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-primary/50 bg-primary/10 font-mono text-sm text-primary transition-all duration-400 group-hover:scale-105 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25">
              <span className="glitch">{"⚡"}</span>
            </div>
            <span className="font-mono text-sm tracking-tight">
              <span className="bg-gradient-to-l from-primary/50 to-accent bg-clip-text font-semibold text-transparent">
                HUOC
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item, index) => (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "relative rounded-lg px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-all duration-300",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  hoveredIndex === index &&
                    !isActive(item.href) &&
                    "text-foreground",
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span
                  className={cn(
                    "absolute left-1.5 text-primary transition-all duration-200",
                    isActive(item.href)
                      ? "translate-x-0 opacity-100"
                      : hoveredIndex === index
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-2 opacity-0",
                  )}
                >
                  {">"}
                </span>
                <span
                  className={cn(
                    "transition-transform duration-200",
                    (hoveredIndex === index || isActive(item.href)) &&
                      "translate-x-2",
                  )}
                >
                  {item.label}
                </span>
                <span
                  className={cn(
                    "absolute bottom-1 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-primary transition-all duration-300",
                    isActive(item.href)
                      ? "w-6"
                      : hoveredIndex === index
                        ? "w-6"
                        : "w-0",
                  )}
                />
              </Link>
            ))}
            <button
              onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Status + mobile toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2.5 rounded-full border border-border/50 bg-secondary/50 px-3 py-1.5 font-mono text-xs text-muted-foreground sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span>status: operational</span>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/50 transition-colors hover:bg-secondary md:hidden"
              aria-label="Toggle menu"
            >
              <div className="flex w-5 flex-col gap-1.5">
                <span
                  className={cn(
                    "h-0.5 origin-center bg-foreground transition-all duration-300",
                    isMobileMenuOpen
                      ? "w-5 translate-y-2 rotate-45"
                      : "w-5",
                  )}
                />
                <span
                  className={cn(
                    "h-0.5 w-3.5 bg-foreground transition-all duration-300",
                    isMobileMenuOpen && "translate-x-2 opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "h-0.5 origin-center bg-foreground transition-all duration-300",
                    isMobileMenuOpen
                      ? "w-5 -translate-y-2 -rotate-45"
                      : "w-5",
                  )}
                />
              </div>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          className={cn(
            "bg-background transition-all duration-400 md:hidden",
            isMobileMenuOpen
              ? "max-h-96 pt-4 opacity-100"
              : "max-h-0 opacity-0",
          )}
        >
          <div className="flex flex-col gap-1 border-t border-border/50 pt-4">
            {navItems.map((item, index) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-4 py-3.5 font-mono text-sm uppercase tracking-widest text-muted-foreground transition-all duration-200 hover:bg-secondary/50 hover:text-foreground active:bg-secondary"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-primary">{">"}</span>
                {item.label}
              </Link>
            ))}
            <div className="mx-4 mt-3 mb-2 flex items-center gap-2.5 rounded-lg bg-secondary/30 px-4 py-3 font-mono text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              <span>status: operational</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
