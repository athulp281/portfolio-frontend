import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Loader2,
  LogOut,
  Save,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useAdminStore } from "@/store";
import { resolveIcon, resolveAccent } from "@/data/workMeta";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { WorkForm } from "./WorkForm";

export function SelectedWorkAdmin() {
  const {
    items,
    status,
    error,
    notice,
    dirty,
    loaded,
    lastCommit,
    load,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    save,
    logout,
  } = useAdminStore();

  // null = closed, "new" = adding, otherwise the item being edited
  const [editing, setEditing] = useState(null);
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
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-mute">
              Admin
            </div>
            <h1 className="font-display text-xl font-semibold tracking-tight">
              Selected work
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/#work"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-ink-dim hover:text-ink"
            >
              View site <ExternalLink className="size-3.5" />
            </a>
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
            <button
              onClick={logout}
              className="grid place-items-center size-9 rounded-lg border border-white/10 text-ink-dim hover:text-ink"
              title="Log out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Status banners */}
        {error && (
          <Banner tone="error" icon={AlertTriangle}>
            {error}
          </Banner>
        )}
        {notice && (
          <Banner tone="info" icon={Info}>
            {notice}
            {lastCommit?.commitUrl && (
              <a
                href={lastCommit.commitUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 underline hover:text-ink"
              >
                view commit
              </a>
            )}
          </Banner>
        )}

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-ink-dim">
            {items.length} {items.length === 1 ? "item" : "items"}
            {dirty && (
              <span className="ml-2 rounded-full bg-neon-pink/15 px-2 py-0.5 text-[11px] text-neon-pink">
                unsaved changes
              </span>
            )}
          </p>
          <Button size="sm" variant="ghost" onClick={() => setEditing("new")}>
            <Plus className="size-4" /> Add work
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
                <WorkRow
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
                No work yet. Click “Add work” to create the first item.
              </li>
            )}
          </ul>
        )}
      </main>

      {/* Add / edit modal */}
      <AnimatePresence>
        {editing && (
          <WorkForm
            key="form"
            initial={editing === "new" ? null : editing}
            existingIds={existingIds}
            onSubmit={onFormSubmit}
            onCancel={() => setEditing(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmId && (
          <ConfirmDelete
            name={items.find((it) => it.id === confirmId)?.title || confirmId}
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

function WorkRow({ item, index, total, onEdit, onDelete, onMove }) {
  const Icon = resolveIcon(item.icon);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      className="flex items-center gap-4 rounded-xl border border-white/10 bg-bg-soft p-3"
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-bg">
        {item.image ? (
          <img
            src={item.image}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => (e.currentTarget.style.opacity = "0")}
          />
        ) : null}
        <span
          className={cn(
            "absolute inset-0 bg-gradient-to-tr opacity-30",
            resolveAccent(item.accent),
          )}
        />
        <span className="absolute inset-0 grid place-items-center text-white">
          <Icon className="size-5" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-ink">{item.title}</h3>
          <span className="font-mono text-[10px] text-ink-mute">{item.id}</span>
        </div>
        <p className="truncate text-sm text-ink-dim">{item.summary}</p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          {(item.stack || []).slice(0, 5).map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] uppercase tracking-wide text-ink-mute"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <IconBtn
          title="Move up"
          disabled={index === 0}
          onClick={() => onMove(-1)}
        >
          <ArrowUp className="size-4" />
        </IconBtn>
        <IconBtn
          title="Move down"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
        >
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
        "grid place-items-center size-8 rounded-lg border border-white/10 text-ink-dim transition hover:text-ink disabled:opacity-30 disabled:hover:text-ink-dim",
        danger && "hover:text-neon-pink hover:border-neon-pink/40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Banner({ tone, icon: Icon, children }) {
  return (
    <div
      className={cn(
        "mb-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-neon-pink/30 bg-neon-pink/10 text-neon-pink"
          : "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
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
        <h3 className="font-display text-lg font-semibold text-ink">Delete work?</h3>
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
