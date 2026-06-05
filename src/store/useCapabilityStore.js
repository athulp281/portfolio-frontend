import { createContentStore } from "./createContentStore";
import seed from "@/data/capabilities.json";

export const useCapabilityStore = createContentStore({
  resource: "capabilities",
  seed,
  label: "Capabilities",
});
