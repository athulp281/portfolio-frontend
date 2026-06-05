import { create } from "zustand";
import {
  fetchPersonalDetails,
  fetchSocialDetails,
} from "@/services/profile.service";

/**
 * Profile + featured projects.
 * Personal + social are loaded from backend; the project showcase list is
 * curated locally because the backend's RAG corpus is text, not structured rows.
 * Edit `FEATURED_PROJECTS` to update the landing showcase.
 */
const FEATURED_PROJECTS = [
  {
    id: "wyntrio-solutions",
    title: "Wyntrio Solutions",
    summary:
      "Next.js SEO-friendly website for a service-providing company — server-rendered, fast, and optimized for search.",
    stack: ["Next.js", "SSR", "SEO", "Tailwind"],
    accent: "from-neon-cyan to-neon-pink",
    image: "/projectimages/wyntriosolutions.png",
    link: "https://wyntriosolutions.com/",
  },
  {
    id: "student-portal",
    title: "Student Portal",
    summary:
      "Next.js + Prisma student platform with dashboards, scheduling, grievance tracking, and an OpenAI/RAG chatbot.",
    stack: ["Next.js", "Prisma", "MySQL", "OpenAI", "Firebase"],
    accent: "from-neon-cyan to-neon-violet",
    image: "/projectimages/studentportal.png",
    link: "https://student.intervaledu.com/",
  },
  {
    id: "bgv",
    title: "Background Verification",
    summary:
      "Workflow + RBAC heavy app with document verification and email notifications.",
    stack: ["Next.js", "Redux Toolkit", "Sequelize", "MySQL"],
    accent: "from-neon-violet to-neon-pink",
    image: "/projectimages/backgroundverification.png",
    link: "https://verify.teaminterval.net/loginnew",
  },
  {
    id: "employee-mgmt",
    title: "Employee Management",
    summary:
      "Profiles, attendance, RBAC, search & filtering across a 50+ user team.",
    stack: ["React", "Redux", "Node", "MySQL"],
    accent: "from-neon-pink to-neon-cyan",
    image: "/projectimages/employeemanagement.png",
    link: "https://portal.teaminterval.net/",
  },
  {
    id: "assessment",
    title: "Student Assessment Tool",
    summary:
      "Dynamic question handling, evaluation pipeline, and report generation.",
    stack: ["React", "MUI", "Express", "Sequelize"],
    accent: "from-neon-lime to-neon-cyan",
    image: "/projectimages/assessmentreport.png",
    link: "https://portal.teaminterval.net/",
  },
  {
    id: "cabin-booking",
    title: "Cabin Booking",
    summary:
      "Real-time availability, slot booking, and scheduling for an office.",
    stack: ["React", "MUI", "Sequelize", "MySQL"],
    accent: "from-neon-cyan to-neon-lime",
    image: "/projectimages/cabinbooking.png",
    link: "https://portal.teaminterval.net/",
  },
  {
    id: "spanora",
    title: "Spanora SEO Site",
    summary:
      "SSR Next.js marketing site optimized for SEO and Core Web Vitals.",
    stack: ["Next.js", "Bootstrap", "SSR"],
    accent: "from-neon-violet to-neon-cyan",
    image: "/projectimages/spanora.png",
    link: "https://spanora.com.sa/",
  },
];

export const useProjectStore = create((set) => ({
  personal: [],
  social: [],
  projects: FEATURED_PROJECTS,
  status: "idle",
  error: null,

  loadProfile: async () => {
    set({ status: "loading", error: null });
    try {
      const [personal, social] = await Promise.all([
        fetchPersonalDetails(),
        fetchSocialDetails(),
      ]);
      set({
        personal: personal ?? [],
        social: social ?? [],
        status: "idle",
      });
    } catch (err) {
      set({ status: "error", error: err?.message || "Failed to load profile" });
    }
  },
}));
