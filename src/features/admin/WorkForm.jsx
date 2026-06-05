import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  WORK_ACCENTS,
  WORK_ICON_NAMES,
  resolveIcon,
  resolveAccent,
} from "@/data/workMeta";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FIELD =
  "w-full rounded-lg border border-white/10 bg-bg-soft px-3 py-2 text-sm text-ink outline-none transition focus:border-neon-cyan/60";
const LABEL = "block text-xs font-medium uppercase tracking-wide text-ink-mute mb-1.5";

/**
 * Add / edit a single Selected Work item. `existingIds` is used to flag id
 * collisions. On submit, returns a normalized item to the parent.
 */
export function WorkForm({ initial, existingIds = [], onSubmit, onCancel }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => ({
    id: initial?.id || "",
    title: initial?.title || "",
    summary: initial?.summary || "",
    stack: Array.isArray(initial?.stack) ? initial.stack.join(", ") : "",
    accent: initial?.accent || WORK_ACCENTS[0].className,
    icon: initial?.icon || WORK_ICON_NAMES[0],
    image: initial?.image || "",
    link: initial?.link || "",
    // tracks whether the id was hand-edited (so we stop auto-slugging)
    _idTouched: !!initial?.id,
  }));
  const [error, setError] = useState("");

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const onTitle = (value) => {
    set({
      title: value,
      ...(form._idTouched ? {} : { id: slugify(value) }),
    });
  };

  const submit = (e) => {
    e.preventDefault();
    const id = slugify(form.id || form.title);
    if (!id) return setError("An id (or title) is required.");
    if (!form.title.trim()) return setError("Title is required.");
    const clash = existingIds.includes(id) && id !== initial?.id;
    if (clash) return setError(`The id "${id}" is already used.`);

    onSubmit({
      id,
      title: form.title.trim(),
      summary: form.summary.trim(),
      stack: form.stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      accent: form.accent,
      icon: form.icon,
      image: form.image.trim(),
      link: form.link.trim(),
    });
  };

  const PreviewIcon = resolveIcon(form.icon);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onSubmit={submit}
        data-lenis-prevent
        className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-bg-panel p-6 shadow-glass"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">
            {isEdit ? "Edit work" : "Add work"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="grid place-items-center size-8 rounded-lg border border-white/10 text-ink-dim hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={LABEL}>Title</label>
            <input
              className={FIELD}
              value={form.title}
              onChange={(e) => onTitle(e.target.value)}
              placeholder="Student Portal"
            />
          </div>

          <div>
            <label className={LABEL}>ID (slug)</label>
            <input
              className={cn(FIELD, "font-mono")}
              value={form.id}
              onChange={(e) => set({ id: e.target.value, _idTouched: true })}
              placeholder="student-portal"
            />
          </div>

          <div>
            <label className={LABEL}>Summary</label>
            <textarea
              className={cn(FIELD, "min-h-[72px] resize-y")}
              value={form.summary}
              onChange={(e) => set({ summary: e.target.value })}
              placeholder="One or two sentences about the project."
            />
          </div>

          <div>
            <label className={LABEL}>Tech stack (comma-separated)</label>
            <input
              className={FIELD}
              value={form.stack}
              onChange={(e) => set({ stack: e.target.value })}
              placeholder="Next.js, Prisma, MySQL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Icon</label>
              <div className="flex items-center gap-2">
                <span className="grid place-items-center size-9 shrink-0 rounded-lg border border-white/10 bg-bg-soft text-neon-cyan">
                  <PreviewIcon className="size-4" />
                </span>
                <select
                  className={FIELD}
                  value={form.icon}
                  onChange={(e) => set({ icon: e.target.value })}
                >
                  {WORK_ICON_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={LABEL}>Accent</label>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "size-9 shrink-0 rounded-lg bg-gradient-to-tr",
                    resolveAccent(form.accent),
                  )}
                />
                <select
                  className={FIELD}
                  value={form.accent}
                  onChange={(e) => set({ accent: e.target.value })}
                >
                  {WORK_ACCENTS.map((a) => (
                    <option key={a.key} value={a.className}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className={LABEL}>Image (path or URL)</label>
            <input
              className={FIELD}
              value={form.image}
              onChange={(e) => set({ image: e.target.value })}
              placeholder="/projectimages/studentportal.png"
            />
            {form.image && (
              <div className="mt-2 aspect-[16/9] w-32 overflow-hidden rounded-lg border border-white/10">
                <img
                  src={form.image}
                  alt="preview"
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.style.opacity = "0.2")}
                />
              </div>
            )}
          </div>

          <div>
            <label className={LABEL}>Link (project URL)</label>
            <input
              className={FIELD}
              value={form.link}
              onChange={(e) => set({ link: e.target.value })}
              placeholder="https://example.com/"
            />
          </div>

          {error && <p className="text-sm text-neon-pink">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save changes" : "Add work"}</Button>
        </div>
      </motion.form>
    </div>
  );
}
