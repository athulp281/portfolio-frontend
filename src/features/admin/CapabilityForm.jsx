import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  CAP_GRADS,
  CAP_ICON_NAMES,
  resolveCapIcon,
  resolveGrad,
} from "@/data/capabilityMeta";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { ImageField } from "./ImageField";

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

/** Add / edit a single Capability. Returns a normalized item to the parent. */
export function CapabilityForm({ initial, existingIds = [], onSubmit, onCancel }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => ({
    id: initial?.id || "",
    title: initial?.title || "",
    desc: initial?.desc || "",
    tags: Array.isArray(initial?.tags) ? initial.tags.join(", ") : "",
    grad: initial?.grad || CAP_GRADS[0].className,
    icon: initial?.icon || CAP_ICON_NAMES[0],
    img: initial?.img || "",
    _idTouched: !!initial?.id,
  }));
  const [error, setError] = useState("");

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const onTitle = (value) => {
    set({ title: value, ...(form._idTouched ? {} : { id: slugify(value) }) });
  };

  const submit = (e) => {
    e.preventDefault();
    const id = slugify(form.id || form.title);
    if (!id) return setError("An id (or title) is required.");
    if (!form.title.trim()) return setError("Title is required.");
    if (existingIds.includes(id) && id !== initial?.id) {
      return setError(`The id "${id}" is already used.`);
    }
    onSubmit({
      id,
      title: form.title.trim(),
      desc: form.desc.trim(),
      tags: form.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      grad: form.grad,
      icon: form.icon,
      img: form.img.trim(),
    });
  };

  const PreviewIcon = resolveCapIcon(form.icon);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.form
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onSubmit={submit}
        data-lenis-prevent
        className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-bg-panel p-6 shadow-glass"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
            {isEdit ? "Edit capability" : "Add capability"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="grid size-8 place-items-center rounded-lg border border-white/10 text-ink-dim hover:text-ink"
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
              placeholder="Frontend"
            />
          </div>

          <div>
            <label className={LABEL}>ID (slug)</label>
            <input
              className={cn(FIELD, "font-mono")}
              value={form.id}
              onChange={(e) => set({ id: e.target.value, _idTouched: true })}
              placeholder="frontend"
            />
          </div>

          <div>
            <label className={LABEL}>Description</label>
            <textarea
              className={cn(FIELD, "min-h-[72px] resize-y")}
              value={form.desc}
              onChange={(e) => set({ desc: e.target.value })}
              placeholder="One or two sentences about this capability."
            />
          </div>

          <div>
            <label className={LABEL}>Tags / tools (comma-separated)</label>
            <input
              className={FIELD}
              value={form.tags}
              onChange={(e) => set({ tags: e.target.value })}
              placeholder="React, Next.js, Tailwind"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Icon</label>
              <div className="flex items-center gap-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-bg-soft text-neon-cyan">
                  <PreviewIcon className="size-4" />
                </span>
                <select
                  className={FIELD}
                  value={form.icon}
                  onChange={(e) => set({ icon: e.target.value })}
                >
                  {CAP_ICON_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={LABEL}>Gradient</label>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "size-9 shrink-0 rounded-lg bg-gradient-to-br",
                    resolveGrad(form.grad),
                  )}
                />
                <select
                  className={FIELD}
                  value={form.grad}
                  onChange={(e) => set({ grad: e.target.value })}
                >
                  {CAP_GRADS.map((g) => (
                    <option key={g.key} value={g.className}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <ImageField
            label="Image"
            value={form.img}
            onChange={(v) => set({ img: v })}
            placeholder="/uploads/your-image.jpg"
          />

          {error && <p className="text-sm text-neon-pink">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save changes" : "Add capability"}</Button>
        </div>
      </motion.form>
    </div>
  );
}
