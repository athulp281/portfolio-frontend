import { Hero } from "@/features/portfolio/Hero";
import { Intro } from "@/features/portfolio/Intro";
import { Skills } from "@/features/portfolio/Skills";
import { Projects } from "@/features/portfolio/Projects";
import { CTA } from "@/features/portfolio/CTA";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Intro />
      <Skills />
      <Projects />
      <CTA />
    </>
  );
}
