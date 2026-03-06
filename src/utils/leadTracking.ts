const STORAGE_KEY = "gforce_lead_tracking"
const LAST_TRACKED_KEY = "gforce_last_tracked_lead"

const LEAD_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const LEAD_ATTRIBUTION_TTL_MS = 30 * 24 * 60 * 60 * 1000

interface StoredLead {
  slug: string
  savedAt: number
}

export function normalizeLeadSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80)
}

export function saveLeadSlug(slug: string) {
  const normalized = normalizeLeadSlug(slug)
  if (!normalized || !LEAD_SLUG_REGEX.test(normalized)) {
    return
  }

  const payload: StoredLead = {
    slug: normalized,
    savedAt: Date.now(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function getStoredLeadSlug(now = Date.now()): string | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as StoredLead

    if (!parsed.slug || !parsed.savedAt) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    if (now - parsed.savedAt > LEAD_ATTRIBUTION_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    const normalized = normalizeLeadSlug(parsed.slug)
    if (!LEAD_SLUG_REGEX.test(normalized)) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return normalized
  } catch (_error) {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function shouldTrackLeadOnThisLoad(slug: string): boolean {
  const normalized = normalizeLeadSlug(slug)
  if (!normalized) {
    return false
  }

  const signature = `${normalized}:${window.location.pathname}:${window.location.search}`
  const lastSignature = sessionStorage.getItem(LAST_TRACKED_KEY)

  if (lastSignature === signature) {
    return false
  }

  sessionStorage.setItem(LAST_TRACKED_KEY, signature)
  return true
}
