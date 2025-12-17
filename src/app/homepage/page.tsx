'use client'

import Contact from "./contact/contact";
import Footer from "./footer/footer";
import Hero from "./heroSection/hero";
import JobPromotion from "./jobpromotion/jobpromotion";
import Navbar from "./navbar/navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#13131a]">
      <Navbar />
      <Hero />
      <JobPromotion />
      <Contact />
      <Footer />

      {/* 
        Design your landing page here!
        
        Tips:
        - Use Tailwind CSS classes for styling
        - Dark theme colors: bg-[#13131a] (background), bg-[#1e1e24] (cards)
        - Text colors: text-white, text-gray-400, text-indigo-400
        - You can import components from 'lucide-react' for icons
        - Add sections like Hero, Features, About, Contact, etc.
      */}
    </div>
  )
}
