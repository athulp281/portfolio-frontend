import { createContentStore } from "./createContentStore";
import seed from "@/data/experience.json";

export const useExperienceStore = createContentStore({
  resource: "experience",
  seed,
  label: "Experience",
});
