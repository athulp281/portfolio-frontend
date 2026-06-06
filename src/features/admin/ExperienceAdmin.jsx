import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Save,
  GitCommit,
  Building2,
} from "lucide-react";
import { useExperienceStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { formatPeriod, formatDuration, isCurrent } from "@/utils/duration";
import { ExperienceForm } from "./ExperienceForm";

export function ExperienceAdmin() {
  const {
    items,
    status,
    dirty,
    loaded,
    lastCommit,
    load,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    save,
  } = useExperienceStore();

  const [editing, setEditing] = useState(null); // null | "new" | item
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  const existingIds = items.map((it) => it.id);
  const saving = status === "saving";
  const busy = status === "loading";

  const onFormSubmit = (item) => {
    if (editing === "new") addItem(item);
    else updateItem(editing.id, item);
    setEditing(null);
  };

  return (
    <div className="min-h-[100dvh] bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 py-4 pl-16 pr-4 sm:pr-6 lg:px-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-mute">
              Admin
            </div>
            <h1 className="font-display text-xl font-semibold tracking-tight">
              Experience
            </h1>
          </div>
          <Button
            size="sm"
            onClick={() => save()}
            disabled={!dirty || saving}
            title={dirty ? "Commit changes to GitHub" : "No unsaved changes"}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="size-4" /> {dirty ? "Save & deploy" : "Saved"}
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-ink-dim">
            <span>
              {items.length} {items.length === 1 ? "role" : "roles"}
            </span>
            {dirty && (
              <span className="rounded-full bg-neon-pink/15 px-2 py-0.5 text-[11px] text-neon-pink">
                unsaved changes
              </span>
            )}
            {lastCommit?.commitUrl && (
              <a
                href={lastCommit.commitUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-ink-mute underline-offset-2 hover:text-ink hover:underline"
              >
                <GitCommit className="size-3" /> last deploy
              </a>
            )}
          </p>
          <Button size="sm" variant="ghost" onClick={() => setEditing("new")}>
            <Plus className="size-4" /> Add experience
          </Button>
        </div>

        {busy && !items.length ? (
          <div className="grid place-items-center py-24 text-ink-mute">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item, i) => (
                <ExpRow
                  key={item.id}
                  item={item}
                  index={i}
                  total={items.length}
                  onEdit={() => setEditing(item)}
                  onDelete={() => setConfirmId(item.id)}
                  onMove={(dir) => moveItem(item.id, dir)}
                />
              ))}
            </AnimatePresence>
            {!items.length && (
              <li className="rounded-xl border border-dashed border-white/10 py-16 text-center text-ink-mute">
                No experience yet. Click “Add experience” to create the first one.
              </li>
            )}
          </ul>
        )}
      </main>

      <AnimatePresence>
        {editing && (
          <ExperienceForm
            key="form"
            initial={editing === "new" ? null : editing}
            existingIds={existingIds}
            onSubmit={onFormSubmit}
            onCancel={() => setEditing(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmId && (
          <ConfirmDelete
            name={items.find((it) => it.id === confirmId)?.company || confirmId}
            onConfirm={() => {
              removeItem(confirmId);
              setConfirmId(null);
            }}
            onCancel={() => setConfirmId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpRow({ item, index, total, onEdit, onDelete, onMove }) {
  const current = isCurrent(item.end);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="flex items-center gap-4 rounded-xl border border-white/10 bg-bg-soft p-3"
    >
      <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-bg">
        {item.logo ? (
          <img
            src={item.logo}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.opacity = "0.2")}
          />
        ) : (
          <Building2 className="size-5 text-ink-mute" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-ink">{item.company}</h3>
          {current && (
            <span className="rounded-full bg-neon-lime/15 px-2 py-0.5 text-[10px] text-neon-lime">
              current
            </span>
          )}
        </div>
        {item.role && <p className="truncate text-sm text-ink-dim">{item.role}</p>}
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-mute">
          {formatPeriod(item.start, item.end)} · {formatDuration(item.start, item.end)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <IconBtn title="Move up" disabled={index === 0} onClick={() => onMove(-1)}>
          <ArrowUp className="size-4" />
        </IconBtn>
        <IconBtn title="Move down" disabled={index === total - 1} onClick={() => onMove(1)}>
          <ArrowDown className="size-4" />
        </IconBtn>
        <IconBtn title="Edit" onClick={onEdit}>
          <Pencil className="size-4" />
        </IconBtn>
        <IconBtn title="Delete" danger onClick={onDelete}>
          <Trash2 className="size-4" />
        </IconBtn>
      </div>
    </motion.li>
  );
}

function IconBtn({ children, danger, className, ...props }) {
  return (
    <button
      className={cn(
        "grid size-8 place-items-center rounded-lg border border-white/10 text-ink-dim transition hover:text-ink disabled:opacity-30 disabled:hover:text-ink-dim",
        danger && "hover:border-neon-pink/40 hover:text-neon-pink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function ConfirmDelete({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-bg-panel p-6 shadow-glass"
      >
        <h3 className="font-display text-lg font-semibold text-ink">Delete experience?</h3>
        <p className="mt-2 text-sm text-ink-dim">
          “{name}” will be removed from the list. This is undone only by editing
          again before you save.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-neon-pink text-bg shadow-none hover:brightness-110"
            onClick={onConfirm}
          >
            Delete
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
