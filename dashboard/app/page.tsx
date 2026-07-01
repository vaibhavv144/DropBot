import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { StatsStrip } from "@/components/landing/stats-strip";
import { AboutSection } from "@/components/landing/about-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { FaqSection } from "@/components/landing/faq-section";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "DropBot — Add an AI chatbot to your website in 60 seconds",
  description:
    "DropBot reads your site, answers customer questions 24/7 with cited sources, and installs with one line of code. No coding required.",
};

export default function LandingPage() {
  return (
    <main className="bg-white">
      <Hero />
      <StatsStrip />
      <AboutSection />
      <HowItWorks />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
