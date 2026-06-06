import { LandingHero } from "@/features/landing/LandingHero";
import { LandingExperience } from "@/features/landing/LandingExperience";
import { LandingAbout } from "@/features/landing/LandingAbout";
import { LandingServices } from "@/features/landing/LandingServices";
import { LandingWork } from "@/features/landing/LandingWork";
import { LandingContact } from "@/features/landing/LandingContact";

export default function LandingPage() {
  return (
    <>
      <LandingHero />
      <LandingExperience />
      <LandingAbout />
      <LandingServices />
      <LandingWork />
      <LandingContact />
    </>
  );
}
