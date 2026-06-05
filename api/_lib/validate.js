/**
 * Normalize + validate the items array coming from the admin UI before it is
 * committed. Returns { ok, items, error }. Keeps only known fields and coerces
 * shapes so a malformed payload can never write a broken data file.
 */
const ALLOWED_KEYS = ["id", "title", "summary", "stack", "accent", "icon", "image", "link"];

export function validateItems(input) {
  if (!Array.isArray(input)) {
    return { ok: false, error: "Payload must be an array of work items" };
  }
  const seen = new Set();
  const items = [];

  for (let i = 0; i < input.length; i++) {
    const raw = input[i] || {};
    const id = String(raw.id || "").trim();
    const title = String(raw.title || "").trim();

    if (!id) return { ok: false, error: `Item ${i + 1} is missing an id` };
    if (!title) return { ok: false, error: `Item "${id}" is missing a title` };
    if (seen.has(id)) return { ok: false, error: `Duplicate id "${id}"` };
    seen.add(id);

    const stack = Array.isArray(raw.stack)
      ? raw.stack.map((s) => String(s).trim()).filter(Boolean)
      : String(raw.stack || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const clean = {
      id,
      title,
      summary: String(raw.summary || "").trim(),
      stack,
      accent: String(raw.accent || "").trim(),
      icon: String(raw.icon || "").trim(),
      image: String(raw.image || "").trim(),
      link: String(raw.link || "").trim(),
    };

    // Drop empty optional keys to keep the committed JSON tidy.
    for (const k of ALLOWED_KEYS) {
      if (k !== "stack" && clean[k] === "") delete clean[k];
    }
    items.push(clean);
  }
  return { ok: true, items };
}
