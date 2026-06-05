import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAdminStore } from "@/store";
import { cn } from "@/utils/cn";

/**
 * Admin login — a split "hero" inspired by an agency-theme intro:
 *  • left/visual: a slanted collage of cards scrolling vertically, a portrait in
 *    front, and a giant ghost word sliding horizontally behind a 3-line heading
 *  • right/form: email + password sign-in (logic unchanged)
 *
 * All imagery is from /public. The page forces a dark palette regardless of the
 * site theme. Responsive: stacked (visual band + form) on mobile, two columns on lg.
 */

const PORTRAIT = "/10B81637-4C91-4A69-9E57-DC2682E8C723.png";

const COL_A = [
  "/projectimages/studentportal.png",
  "/profile4.png",
  "/projectimages/wyntriosolutions.png",
  "/profile1.png",
  "/projectimages/spanora.png",
];
const COL_B = [
  "/1958DB8C-1629-4B89-AF5A-FE0803F722DE.png",
  "/projectimages/backgroundverification.png",
  "/profile5.png",
  "/projectimages/employeemanagement.png",
  "/profile2.jpeg",
];
const COL_C = [
  "/projectimages/cabinbooking.png",
  "/profile6.png",
  "/projectimages/assessmentreport.png",
  "/C1E0AC65-0655-4204-9DF6-BE916A4A9DBB.png",
  "/profile3.png",
];

function ScrollColumn({ images, duration, reverse }) {
  const loop = [...images, ...images];
  return (
    <div className="flex w-[clamp(150px,16vw,240px)] flex-col overflow-hidden">
      <motion.div
        className="flex flex-col"
        animate={{ y: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {loop.map((src, i) => (
          <div
            key={i}
            className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl"
          >
            <img
              src={src}
              alt=""
              draggable={false}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function Collage() {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden">
      <div
        className="flex gap-4 opacity-60 [transform:perspective(1500px)_rotateY(-24deg)_rotateX(8deg)_rotate(7deg)_scale(1.4)]"
        style={{ transformOrigin: "center" }}
      >
        <ScrollColumn images={COL_A} duration={42} />
        <ScrollColumn images={COL_B} duration={55} reverse />
        <ScrollColumn images={COL_C} duration={48} />
      </div>
    </div>
  );
}

function GhostMarquee({ text }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none overflow-hidden">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        {[0, 1].map((k) => (
          <span
            key={k}
            className="pr-[0.25em] font-display text-[18vh] font-extrabold uppercase leading-none tracking-tighter text-white/[0.045]"
          >
            {text}&nbsp;{text}&nbsp;
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function AdminGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const login = useAdminStore((s) => s.login);
  const status = useAdminStore((s) => s.status);
  const error = useAdminStore((s) => s.error);
  const loading = status === "loading";

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || loading) return;
    await login(email, password);
  };

  return (
    <main className="grid min-h-[100dvh] grid-rows-[44vh_1fr] overflow-hidden bg-[#0a0a0c] text-white lg:grid-cols-[1fr_clamp(380px,34%,480px)] lg:grid-rows-1">
      {/* ===================== VISUAL ===================== */}
      <section className="relative overflow-hidden border-white/10 lg:border-r">
        <Collage />

        {/* portrait, anchored bottom-right */}
        <img
          src={PORTRAIT}
          alt=""
          draggable={false}
          className="pointer-events-none absolute bottom-0 right-0 h-full w-auto max-w-[70%] object-cover object-top opacity-90 [mask-image:linear-gradient(to_left,black_55%,transparent)] lg:h-[92%]"
        />

        {/* scrims for legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-[#0a0a0c]/30" />

        <GhostMarquee text="Portfolio" />

        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-6 left-5 right-5 sm:left-9 lg:bottom-14 lg:left-12 lg:right-auto lg:max-w-[34rem]"
        >
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.4em] text-orange-400/90 sm:text-[11px]">
            Admin Access
          </div>
          <h1 className="font-display font-semibold leading-[0.95] tracking-[-0.03em] text-[clamp(1.9rem,6vw,3.6rem)]">
            <span className="block text-white">Shape your</span>
            <span className="block bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
              Portfolio
            </span>
            <span className="block text-white">showcase.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
            Sign in to curate the selected work the world sees — edits ship to
            production in a click.
          </p>
        </motion.div>
      </section>

      {/* ===================== FORM ===================== */}
      <section className="relative flex items-center justify-center bg-[#0c0c10] px-5 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-white/50">
              Sign in to manage your selected work.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <Field
              icon={Mail}
              type="email"
              autoComplete="username"
              autoFocus
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field
              icon={Lock}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggle={{
                shown: showPassword,
                onToggle: () => setShowPassword((v) => !v),
              }}
            />

            {error && (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "group flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(249,115,22,0.7)] transition",
                "hover:bg-orange-600 active:scale-[0.99] disabled:opacity-60",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-white/30">
            Protected area · authorized access only
          </p>
        </motion.div>
      </section>
    </main>
  );
}

function Field({ icon: Icon, toggle, ...props }) {
  return (
    <div className="group relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/35 transition group-focus-within:text-orange-400" />
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/[0.03] py-3.5 pl-11 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-orange-500/60 focus:bg-white/[0.05]",
          toggle ? "pr-11" : "pr-4",
        )}
      />
      {toggle && (
        <button
          type="button"
          onClick={toggle.onToggle}
          aria-label={toggle.shown ? "Hide password" : "Show password"}
          className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-white/40 transition hover:text-white/80"
        >
          {toggle.shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
    </div>
  );
}
