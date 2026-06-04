import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Server, Cpu, Boxes, ClipboardList } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";

const easing = [0.16, 1, 0.3, 1];

// Image paths use %20 for the space in the "new images" public folder.
const CAPABILITIES = [
  {
    no: "01",
    title: "Project Management",
    desc: "Scoping, planning and shipping with agile workflows, clear roadmaps and code review.",
    tags: ["Agile", "Scrum", "Jira", "Roadmaps", "Code review", "Mentoring"],
    grad: "from-neon-cyan to-neon-pink",
    icon: ClipboardList,
    img: "/new%20images/1710486640359.jpg",
  },
  {
    no: "02",
    title: "Frontend",
    desc: "Design-led React & Next.js interfaces with motion as a first-class citizen.",
    tags: ["React", "Next.js", "TypeScript", "Tailwind", "Framer Motion", "Three.js"],
    grad: "from-neon-cyan to-neon-violet",
    icon: Layers,
    img: "/new%20images/canva-software-developer-working.jpg",
  },
  {
    no: "03",
    title: "Backend",
    desc: "Typed APIs, auth, RBAC and real-time services that hold up in production.",
    tags: ["Node.js", "Express", "Prisma", "Sequelize", "Socket.IO", "Firebase"],
    grad: "from-neon-violet to-neon-pink",
    icon: Server,
    img: "/new%20images/comprehensive-guide-czmq-mv1njzs8.jpg",
  },
  {
    no: "04",
    title: "AI & Data",
    desc: "RAG pipelines, embeddings and vector search wired into real product flows.",
    tags: ["OpenAI", "RAG", "Embeddings", "Vector search", "MySQL", "MongoDB"],
    grad: "from-neon-pink to-neon-cyan",
    icon: Cpu,
    img: "/new%20images/young-contemporary-software-developer-working-by-computer_274679-30538.avif",
  },
  {
    no: "05",
    title: "DevOps",
    desc: "Build tooling and deploys across Vercel, Render and bare-metal hosts.",
    tags: ["Vite", "Webpack", "Vercel", "Netlify", "Render", "DigitalOcean"],
    grad: "from-neon-lime to-neon-cyan",
    icon: Boxes,
    img: "/new%20images/software-developer-working-stockcake.webp",
  },
];

/**
 * Capabilities — a "now-showing" split. The left column is pinned (sticky) and
 * shows the active capability as a big number + title + accent panel; the
 * right column is the scrollable list, and whichever entry is in view drives
 * the left display. Deliberately a different shape from the Work index.
 */
export function LandingServices() {
  const [active, setActive] = useState(0);
  const cap = CAPABILITIES[active];

  return (
    <section id="skills" className="relative w-full py-28 md:py-40">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
        {/* LEFT — pinned display */}
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <Reveal className="font-mono text-[11px] uppercase tracking-[0.4em] text-ink-mute mb-8">
              (02) — Capabilities
            </Reveal>

            <AnimatePresence mode="wait">
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: easing }}
              >
                <div className="font-display font-semibold leading-none text-ink/12 text-[clamp(5rem,12vw,11rem)]">
                  {cap.no}
                </div>
                <h2 className="-mt-3 font-display font-semibold tracking-[-0.03em] text-ink text-[clamp(2.25rem,5vw,4rem)]">
                  {cap.title}
                </h2>
                <p className="mt-4 max-w-sm text-ink-dim text-sm md:text-base leading-relaxed">
                  {cap.desc}
                </p>

                {/* accent panel — photo with the capability's gradient tint */}
                <div className="mt-8 hidden md:block relative aspect-[5/3] w-full overflow-hidden rounded-2xl bg-bg-soft">
                  <img
                    src={cap.img}
                    alt={cap.title}
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* accent gradient tint + a dark wash for label/icon contrast */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${cap.grad} opacity-55 mix-blend-multiply`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <cap.icon className="absolute right-6 bottom-6 size-12 text-white drop-shadow" />
                  <span className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.25em] text-white/90">
                    {cap.tags.length} tools
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT — scrollable list drives the active index */}
        <div className="md:col-span-7 md:pt-16">
          <div className="border-t border-line/12">
            {CAPABILITIES.map((c, i) => (
              <motion.div
                key={c.title}
                onViewportEnter={() => setActive(i)}
                viewport={{ amount: 0.6, margin: "-20% 0px -20% 0px" }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: easing }}
                className="border-b border-line/12 py-10 md:py-14"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <motion.h3
                    className="font-display font-semibold tracking-[-0.02em] text-[clamp(1.6rem,4vw,2.75rem)] transition-colors duration-300"
                    animate={{ color: active === i ? "#e6e9f2" : "#5b647a" }}
                  >
                    {c.title}
                  </motion.h3>
                  <span className="font-mono text-xs text-ink-mute shrink-0">
                    {c.no}
                  </span>
                </div>
                <p className="mt-3 max-w-lg text-ink-dim text-sm md:text-base leading-relaxed">
                  {c.desc}
                </p>
                <p className="mt-4 font-mono text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-ink-mute">
                  {c.tags.join("  ·  ")}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
