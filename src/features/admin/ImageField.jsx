import { useRef, useState } from "react";
import { Upload, Loader2, Link as LinkIcon } from "lucide-react";
import { uploadImage } from "@/services/admin.service";
import { useUIStore } from "@/store";
import { cn } from "@/utils/cn";

const FIELD =
  "w-full rounded-lg border border-white/10 bg-bg-soft px-3 py-2 text-sm text-ink outline-none transition focus:border-neon-cyan/60";
const LABEL = "block text-xs font-medium uppercase tracking-wide text-ink-mute mb-1.5";

const MAX_MB = 5;

/**
 * Image input with two ways to set a value: paste a path/URL, or upload a file
 * from your system. Uploading commits the image into the repo's public uploads
 * dir (via the backend) and fills the field with the served path. A local
 * object-URL preview shows immediately; the path goes live after the deploy.
 */
export function ImageField({ label = "Image", value, onChange, placeholder }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState("");
  const toast = useUIStore((s) => s.pushToast);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ kind: "error", title: "Not an image", message: "Pick an image file." });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast({ kind: "error", title: "Too large", message: `Max ${MAX_MB}MB.` });
      return;
    }

    setLocalPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      onChange(url);
      toast({
        kind: "success",
        title: "Image uploaded",
        message: "Committed — visible on the site after the next deploy.",
      });
    } catch {
      // axios interceptor already shows the error toast
      setLocalPreview("");
    } finally {
      setUploading(false);
    }
  };

  const preview = localPreview || value;

  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-mute" />
          <input
            className={cn(FIELD, "pl-8")}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "/uploads/your-image.png  or paste a URL"}
          />
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-ink transition hover:bg-white/10 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Upload className="size-3.5" /> Upload
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
          className="hidden"
          onChange={onPick}
        />
      </div>

      {preview && (
        <div className="mt-2 flex items-center gap-3">
          <div className="relative aspect-[16/9] w-32 overflow-hidden rounded-lg border border-white/10">
            <img
              src={preview}
              alt="preview"
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.opacity = "0.2")}
            />
            {uploading && (
              <div className="absolute inset-0 grid place-items-center bg-black/50">
                <Loader2 className="size-4 animate-spin text-white" />
              </div>
            )}
          </div>
          {localPreview && (
            <p className="text-[11px] leading-snug text-ink-mute">
              Uploaded — goes live on the site after the next deploy.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
