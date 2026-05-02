import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PublicLayout } from "@/layouts/PublicLayout";
import { ChatLayout } from "@/layouts/ChatLayout";
import { Loader } from "@/components/common/Loader";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));

const pageVariants = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  enter: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -16, filter: "blur(6px)", transition: { duration: 0.35 } },
};

function AnimatedPage({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      {children}
    </motion.div>
  );
}

export function AppRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<Loader fullscreen />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<PublicLayout />}>
            <Route
              index
              element={
                <AnimatedPage>
                  <LandingPage />
                </AnimatedPage>
              }
            />
          </Route>
          <Route element={<ChatLayout />}>
            <Route
              path="/chat"
              element={
                <AnimatedPage>
                  <ChatPage />
                </AnimatedPage>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
