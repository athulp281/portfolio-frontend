import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { formatDuration, formatPeriod } from "@/utils/duration";
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

/** Add / edit a single Experience entry. Returns a normalized item. */
export function ExperienceForm({ initial, existingIds = [], onSubmit, onCancel }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => ({
    id: initial?.id || "",
    company: initial?.company || "",
    role: initial?.role || "",
    logo: initial?.logo || "",
    start: initial?.start || "",
    end: initial?.end || "",
    current: initial ? !initial.end : true,
    _idTouched: !!initial?.id,
  }));
  const [error, setError] = useState("");

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const onCompany = (value) => {
    set({ company: value, ...(form._idTouched ? {} : { id: slugify(value) }) });
  };

  const submit = (e) => {
    e.preventDefault();
    const id = slugify(form.id || form.company);
    if (!id) return setError("An id (or company) is required.");
    if (!form.company.trim()) return setError("Company is required.");
    if (!form.start) return setError("Joining date is required (used for duration).");
    if (existingIds.includes(id) && id !== initial?.id) {
      return setError(`The id "${id}" is already used.`);
    }
    onSubmit({
      id,
      company: form.company.trim(),
      role: form.role.trim(),
      logo: form.logo.trim(),
      start: form.start,
      end: form.current ? "" : form.end,
    });
  };

  const previewEnd = form.current ? "" : form.end;

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
            {isEdit ? "Edit experience" : "Add experience"}
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
            <label className={LABEL}>Company</label>
            <input
              className={FIELD}
              value={form.company}
              onChange={(e) => onCompany(e.target.value)}
              placeholder="Interval Edu"
            />
          </div>

          <div>
            <label className={LABEL}>ID (slug)</label>
            <input
              className={cn(FIELD, "font-mono")}
              value={form.id}
              onChange={(e) => set({ id: e.target.value, _idTouched: true })}
              placeholder="interval-edu"
            />
          </div>

          <div>
            <label className={LABEL}>Role</label>
            <input
              className={FIELD}
              value={form.role}
              onChange={(e) => set({ role: e.target.value })}
              placeholder="Full-Stack Developer"
            />
          </div>

          <ImageField
            label="Company logo"
            value={form.logo}
            onChange={(v) => set({ logo: v })}
            placeholder="/uploads/logo.png  or paste a URL"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Joining date</label>
              <input
                type="date"
                className={cn(FIELD, "[color-scheme:dark]")}
                value={form.start}
                onChange={(e) => set({ start: e.target.value })}
              />
            </div>
            <div>
              <label className={LABEL}>End date</label>
              <input
                type="date"
                disabled={form.current}
                className={cn(FIELD, "[color-scheme:dark]", form.current && "opacity-40")}
                value={form.end}
                onChange={(e) => set({ end: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-dim">
            <input
              type="checkbox"
              checked={form.current}
              onChange={(e) => set({ current: e.target.checked })}
              className="size-4 accent-neon-cyan"
            />
            Current role (no end date — shows “Present”)
          </label>

          {form.start && (
            <p className="text-xs text-ink-mute">
              Preview: <span className="text-ink-dim">{formatPeriod(form.start, previewEnd)}</span>{" "}
              · <span className="text-neon-cyan">{formatDuration(form.start, previewEnd)}</span>
            </p>
          )}

          {error && <p className="text-sm text-neon-pink">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save changes" : "Add experience"}</Button>
        </div>
      </motion.form>
    </div>
  );
}
