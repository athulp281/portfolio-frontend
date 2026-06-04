import { VelocityMarquee } from "@/components/common/Marquee";
import { Reveal, RevealText } from "@/components/common/Reveal";
import { SectionBackdrop } from "@/components/common/SectionBackdrop";

const KEYWORDS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "OpenAI",
  "RAG",
  "Framer Motion",
  "Tailwind",
  "Prisma",
  "Three.js",
];

const STATS = [
  { value: "4+", label: "Years building" },
  { value: "12+", label: "Projects shipped" },
  { value: "RAG", label: "AI systems" },
  { value: "FE · BE", label: "Full stack" },
];

/**
 * About — a velocity marquee, then an oversized statement that reveals word
 * by word, a supporting bio, and stats laid out as a hairline-divided list
 * (no boxes).
 */
export function LandingAbout() {
  return (
    <section id="intro" className="relative w-full py-24 md:py-36">
      <SectionBackdrop src="/profile6.png" position="right" opacity={0.16} />
      <VelocityMarquee
        items={KEYWORDS}
        baseVelocity={2.5}
        className="border-y border-line/10 py-5 md:py-7 mb-24 md:mb-36"
        itemClassName="font-display text-2xl md:text-4xl font-medium text-ink/80"
      />

      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <Reveal className="font-mono text-[11px] uppercase tracking-[0.4em] text-ink-mute mb-10">
          (01) — About
        </Reveal>

        <h2 className="font-display font-semibold tracking-[-0.03em] leading-[1.02] text-[clamp(2rem,6vw,5rem)] max-w-5xl">
          <RevealText text="I build AI-native products end to end —" className="text-ink" />{" "}
          <RevealText
            text="from the pixel to the pipeline."
            className="text-ink-mute"
            delay={0.15}
          />
        </h2>

        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-12 gap-12">
          <Reveal className="md:col-span-6 text-ink-dim text-base md:text-lg leading-relaxed">
            I'm a full-stack developer based in Kerala, India. For the last four
            years I've shipped scalable React / Next.js apps and Node services —
            and lately, AI-augmented products powered by OpenAI and custom RAG
            pipelines. Athion AI, the assistant on this site, is one of them:
            ask it anything about my work and it answers in real time.
          </Reveal>

          {/* stats — hairline-divided list, no boxes */}
          <div className="md:col-span-6 md:pl-10">
            <div className="border-t border-line/12">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.07}>
                  <div className="flex items-baseline justify-between gap-6 py-5 border-b border-line/12">
                    <span className="font-display text-3xl md:text-5xl font-semibold text-ink tracking-[-0.02em]">
                      {s.value}
                    </span>
                    <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-ink-mute">
                      {s.label}
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
