import { AnimatePresence } from "framer-motion";
import { AppRoutes } from "@/routes/AppRoutes";
import { Cursor } from "@/components/common/Cursor";
import { ScrollProgress } from "@/components/common/ScrollProgress";
import { IdentityLoader } from "@/components/boot/IdentityLoader";
import { useBootStore } from "@/store";
import { useLenis } from "@/hooks/useLenis";

export default function App() {
  const ready = useBootStore((s) => s.ready);
  const finishBoot = useBootStore((s) => s.finishBoot);

  // Lenis smooth-scroll covers the whole document. Internal scrollers
  // (chat message list) opt out via `data-lenis-prevent`.
  useLenis();

  return (
    <>
      <ScrollProgress />
      <Cursor />
      <AppRoutes />
      <AnimatePresence>
        {!ready && <IdentityLoader key="boot" onDone={finishBoot} />}
      </AnimatePresence>
    </>
  );
}
