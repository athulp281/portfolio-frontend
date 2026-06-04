import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/common/Magnetic";
import { Reveal, RevealText } from "@/components/common/Reveal";
import { useProjectStore } from "@/store";

/**
 * Contact — the closing statement. Oversized "Let's talk", a magnetic CTA
 * into the AI chat, and social links pulled from the profile store.
 */
export function LandingContact() {
  const social = useProjectStore((s) => s.social);
  const loadProfile = useProjectStore((s) => s.loadProfile);
  const status = useProjectStore((s) => s.status);

  useEffect(() => {
    if (social.length === 0 && status === "idle") loadProfile();
  }, [social.length, status, loadProfile]);

  return (
    <section id="contact" className="relative w-full py-28 md:py-40">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <Reveal className="font-mono text-[11px] uppercase tracking-[0.4em] text-ink-mute mb-10">
          (04) — Contact
        </Reveal>

        <h2 className="font-display font-semibold tracking-[-0.03em] leading-[0.95] text-[clamp(3rem,13vw,11rem)] text-ink">
          <span className="block">
            <RevealText text="Let's" />
          </span>
          <span className="block">
            <RevealText
              text="talk."
              className="italic font-normal text-ink-mute"
              delay={0.1}
            />
          </span>
        </h2>

        <div className="mt-12 md:mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <Reveal className="max-w-md text-ink-dim text-base md:text-lg leading-relaxed">
            Athion AI knows my stack, projects, and story. Ask it anything —
            even technical questions — and get a real answer. Or reach me
            directly through the links.
          </Reveal>

          <Reveal delay={0.1}>
            <Magnetic>
              <Link
                to="/chat"
                data-cursor="hover"
                className="group inline-flex items-center gap-4 rounded-full bg-ink text-bg pl-8 pr-2 py-3 text-base font-medium"
              >
                Open the chat
                <span className="grid place-items-center size-11 rounded-full bg-bg text-ink transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-5" />
                </span>
              </Link>
            </Magnetic>
          </Reveal>
        </div>

        {/* Social / contact links */}
        <Reveal
          delay={0.15}
          className="mt-16 md:mt-24 pt-8 border-t border-line/10 flex flex-wrap gap-x-8 gap-y-4"
        >
          {social.length > 0 ? (
            social.map((s) => (
              <ContactLink
                key={s.id ?? s.label ?? s.url}
                href={s.url ?? s.link ?? "#"}
                label={s.label ?? s.platform ?? s.name ?? "Link"}
              />
            ))
          ) : (
            <>
              <ContactLink href="https://github.com/athulp281" label="GitHub" />
              <ContactLink href="mailto:tpm@intervaledu.com" label="Email" />
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}

function ContactLink({ href, label }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      data-cursor="hover"
      className="group inline-flex items-center gap-1.5 text-ink-dim hover:text-ink transition-colors font-display text-lg md:text-xl"
    >
      {label}
      <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}
