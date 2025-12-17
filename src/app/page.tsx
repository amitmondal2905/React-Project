'use client'

import Footer from "./homepage/footer/footer"
import Hero from "./homepage/heroSection/hero"
import JobPromotion from "./homepage/jobpromotion/jobpromotion"
import Contact from "./homepage/contact/contact"
import Navbar from "./homepage/navbar/navbar"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#13131a]">
            <Navbar />
            <Hero />
            <JobPromotion />
            <Contact />
            <Footer />
        </div>
    )
}
