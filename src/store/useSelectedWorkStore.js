import { createContentStore } from "./createContentStore";
import seed from "@/data/selectedWork.json";

export const useSelectedWorkStore = createContentStore({
  resource: "selected-work",
  seed,
  label: "Selected work",
});
