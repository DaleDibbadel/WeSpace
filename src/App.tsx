import { BrowserRouter, Routes, Route } from "react-router"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CursorGlow } from "@/components/cursor-glow"
import { LandingPage } from "@/pages/landing"
import { InsidePage } from "@/pages/inside"

export function App() {
  return (
    <BrowserRouter>
      <main className="scanlines relative min-h-screen overflow-hidden">
        <CursorGlow />
        <div className="relative z-10">
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/inside" element={<InsidePage />} />
          </Routes>
          <Footer />
        </div>
      </main>
    </BrowserRouter>
  )
}

export default App
