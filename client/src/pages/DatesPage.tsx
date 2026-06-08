import { useEffect, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DateStatus = "pending" | "accepted" | "declined" | "cancelled";
type MyRole = "proposer" | "receiver";

interface DateEntry {
  id: number;
  proposer_id: string;
  receiver_id: string;
  scheduled_at: string;
  location: string | null;
  status: DateStatus;
  created_at: string;
  updated_at: string;
  my_role: MyRole;
  other_user_id: string;
  other_username: string;
  other_first_name: string;
  other_last_name: string;
  other_profile_picture_id: number | null;
  other_profile_picture_url: string | null;
}

interface DatesResponse {
  dates: DateEntry[];
  upcoming: number;
  total: number;
}

interface ConnectedUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_id: number | null;
  profile_picture_url: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

const AVATAR_COLORS = [
  "#e94057","#f5a623","#4a90e2","#7ed321",
  "#9013fe","#50e3c2","#d0021b","#bd10e0",
];
function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function isPast(iso: string) {
  return new Date(iso) < new Date();
}

const STATUS_META: Record<DateStatus, { label: string; bg: string; color: string }> = {
  pending:   { label: "Pending",   bg: "#fef9c3", color: "#854d0e" },
  accepted:  { label: "Accepted",  bg: "#dcfce7", color: "#166534" },
  declined:  { label: "Declined",  bg: "#fee2e2", color: "#991b1b" },
  cancelled: { label: "Cancelled", bg: "#f3f4f6", color: "#6b7280" },
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user, size = 40 }: { user: Pick<DateEntry, "other_user_id" | "other_first_name" | "other_last_name" | "other_profile_picture_id" | "other_profile_picture_url">; size?: number }) {
  const color = avatarColor(user.other_user_id);
  const initials = getInitials(user.other_first_name, user.other_last_name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#fff", overflow: "hidden",
    }}>
      {user.other_profile_picture_url && user.other_profile_picture_id && user.other_profile_picture_id > 0
        ? <img src={user.other_profile_picture_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
        : initials
      }
    </div>
  );
}

// ─── Propose Modal ────────────────────────────────────────────────────────────

function ProposeModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [connections, setConnections] = useState<ConnectedUser[]>([]);
  const [loadingConns, setLoadingConns] = useState(true);
  const [receiverId, setReceiverId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch connected users from conversations (connected = mutual like = can chat)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/chat/conversations");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setConnections(data.conversations ?? []);
      } catch {
        setError("Could not load your connections.");
      } finally {
        setLoadingConns(false);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!receiverId || !scheduledAt) {
      setError("Please select a person and date/time.");
      return;
    }
    if (isPast(scheduledAt)) {
      setError("Scheduled time must be in the future.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_id: receiverId,
          scheduled_at: new Date(scheduledAt).toISOString(),
          ...(location.trim() ? { location: location.trim() } : {}),
        }),
      });
      if (res.status === 409) { setError("You already have a pending date with this person."); setSubmitting(false); return; }
      if (res.status === 403) { setError("You can only propose to connected users."); setSubmitting(false); return; }
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? "Failed to propose date"); }
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // min datetime = now + 5 min, formatted for datetime-local input
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", width: "100%", maxWidth: "420px", fontFamily: "var(--font-primary)", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--color-text)" }}>Propose a date</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", color: "var(--color-text-muted)", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        {error && (
          <div style={{ marginBottom: "14px", padding: "8px 12px", borderRadius: "8px", background: "#fce8eb", color: "var(--color-error)", fontSize: "13px" }}>
            {error}
          </div>
        )}

        {/* Person */}
        <label style={{ display: "block", fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "6px" }}>With</label>
        {loadingConns ? (
          <div style={{ height: "38px", background: "#f3f4f6", borderRadius: "8px", marginBottom: "14px" }} />
        ) : connections.length === 0 ? (
          <div style={{ padding: "10px 12px", borderRadius: "8px", background: "#f3f4f6", fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "14px" }}>
            No connections yet — match with someone first.
          </div>
        ) : (
          <select
            value={receiverId}
            onChange={e => setReceiverId(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "13px", color: "var(--color-text)", marginBottom: "14px", fontFamily: "var(--font-primary)", background: "#fff" }}
          >
            <option value="">Select a match…</option>
            {connections.map(c => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name} (@{c.username})
              </option>
            ))}
          </select>
        )}

        {/* Date & time */}
        <label style={{ display: "block", fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "6px" }}>Date & time</label>
        <input
          type="datetime-local"
          min={minDateTime}
          value={scheduledAt}
          onChange={e => setScheduledAt(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "13px", color: "var(--color-text)", marginBottom: "14px", fontFamily: "var(--font-primary)", boxSizing: "border-box" }}
        />

        {/* Location */}
        <label style={{ display: "block", fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "6px" }}>Location <span style={{ color: "#aaa" }}>(optional)</span></label>
        <input
          type="text"
          placeholder="e.g. Café de Flore, Paris"
          value={location}
          onChange={e => setLocation(e.target.value)}
          maxLength={200}
          style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "13px", color: "var(--color-text)", marginBottom: "20px", fontFamily: "var(--font-primary)", boxSizing: "border-box" }}
        />

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid var(--color-border)", background: "transparent", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-primary)", color: "var(--color-text)" }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || connections.length === 0}
            style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", background: "var(--color-primary)", color: "#fff", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-primary)", opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Sending…" : "Send proposal"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Date Card ────────────────────────────────────────────────────────────────

function DateCard({ date, onUpdate }: { date: DateEntry; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const meta = STATUS_META[date.status];
  const past = isPast(date.scheduled_at);

  const respond = async (status: "accepted" | "declined") => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/dates/${date.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? "Failed"); }
      onUpdate();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  };

  const cancel = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/dates/${date.id}`, { method: "DELETE" });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? "Failed"); }
      onUpdate();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      background: "#fff",
      border: "1px solid var(--color-border)",
      borderRadius: "14px",
      padding: "16px",
      fontFamily: "var(--font-primary)",
      opacity: (date.status === "cancelled" || date.status === "declined") ? 0.6 : 1,
      transition: "opacity 0.2s",
    }}>
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        {/* Avatar */}
        <a href={`/profile/${date.other_user_id}`}>
          <Avatar user={date} size={46} />
        </a>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
            <div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-text)" }}>
                {date.other_first_name} {date.other_last_name}
              </span>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)", marginLeft: "6px" }}>
                @{date.other_username}
              </span>
            </div>
            <span style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "999px", background: meta.bg, color: meta.color, fontWeight: 600, flexShrink: 0 }}>
              {meta.label}
            </span>
          </div>

          {/* When */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span style={{ fontSize: "13px", color: "var(--color-text)" }}>
              {formatDate(date.scheduled_at)}
            </span>
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>at {formatTime(date.scheduled_at)}</span>
            {past && date.status === "accepted" && (
              <span style={{ fontSize: "11px", padding: "1px 7px", borderRadius: "999px", background: "#f3f4f6", color: "#6b7280" }}>Past</span>
            )}
          </div>

          {/* Where */}
          {date.location && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "5px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--color-text-muted)", flexShrink: 0 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ fontSize: "13px", color: "var(--color-text)" }}>{date.location}</span>
            </div>
          )}

          {/* Role badge */}
          <div style={{ marginTop: "6px" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
              {date.my_role === "proposer" ? "You proposed this" : "They proposed this"}
            </span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: "10px", padding: "6px 10px", borderRadius: "6px", background: "#fce8eb", color: "var(--color-error)", fontSize: "12px" }}>
          {error}
        </div>
      )}

      {/* Actions */}
      {date.status === "pending" && (
        <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
          {date.my_role === "receiver" && (
            <>
              <button
                onClick={() => respond("accepted")}
                disabled={loading}
                style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", background: "#166534", color: "#fff", fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-primary)", opacity: loading ? 0.7 : 1 }}
              >
                ✓ Accept
              </button>
              <button
                onClick={() => respond("declined")}
                disabled={loading}
                style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #fca5a5", background: "transparent", color: "#991b1b", fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-primary)", opacity: loading ? 0.7 : 1 }}
              >
                ✕ Decline
              </button>
            </>
          )}
          {date.my_role === "proposer" && (
            <button
              onClick={cancel}
              disabled={loading}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-muted)", fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-primary)", opacity: loading ? 0.7 : 1 }}
            >
              Cancel proposal
            </button>
          )}
        </div>
      )}

      {date.status === "accepted" && !past && date.my_role === "proposer" && (
        <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
          <button
            onClick={cancel}
            disabled={loading}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-muted)", fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-primary)", opacity: loading ? 0.7 : 1 }}
          >
            Cancel date
          </button>
          <a
            href={`/chat/${date.other_user_id}`}
            style={{ padding: "8px 16px", borderRadius: "8px", background: "var(--color-primary)", color: "#fff", fontSize: "12px", textDecoration: "none", fontFamily: "var(--font-primary)" }}
          >
            💬 Chat
          </a>
        </div>
      )}

      {date.status === "accepted" && !past && date.my_role === "receiver" && (
        <div style={{ marginTop: "12px" }}>
          <a
            href={`/chat/${date.other_user_id}`}
            style={{ display: "inline-block", padding: "8px 16px", borderRadius: "8px", background: "var(--color-primary)", color: "#fff", fontSize: "12px", textDecoration: "none", fontFamily: "var(--font-primary)" }}
          >
            💬 Chat
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabFilter = "upcoming" | "pending" | "past" | "all";

export default function DatesPage() {
  const [dates, setDates] = useState<DateEntry[]>([]);
  const [upcoming, setUpcoming] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<TabFilter>("upcoming");

  const fetchDates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dates");
      if (!res.ok) throw new Error("Failed to load dates");
      const data: DatesResponse = await res.json();
      setDates(data.dates);
      setUpcoming(data.upcoming);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDates(); }, [fetchDates]);

  // Tab filtering
  const filtered = dates.filter(d => {
    if (tab === "upcoming") return d.status === "accepted" && !isPast(d.scheduled_at);
    if (tab === "pending")  return d.status === "pending";
    if (tab === "past")     return isPast(d.scheduled_at) || d.status === "declined" || d.status === "cancelled";
    return true;
  });

  const pendingCount = dates.filter(d => d.status === "pending").length;
  const inboundPending = dates.filter(d => d.status === "pending" && d.my_role === "receiver").length;

  const TABS: { key: TabFilter; label: string; count?: number }[] = [
    { key: "upcoming", label: "Upcoming", count: upcoming },
    { key: "pending",  label: "Pending",  count: pendingCount },
    { key: "past",     label: "Past" },
    { key: "all",      label: "All",      count: dates.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)", fontFamily: "var(--font-primary)" }}>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid var(--color-border)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>📅</span>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "var(--color-text)" }}>Dates</h1>
          {upcoming > 0 && (
            <span style={{ padding: "2px 10px", borderRadius: "999px", background: "#fce8eb", color: "var(--color-primary)", fontSize: "12px", fontWeight: 600 }}>
              {upcoming} upcoming
            </span>
          )}
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", borderRadius: "10px", border: "none", background: "var(--color-primary)", color: "#fff", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-primary)", fontWeight: 600 }}
        >
          <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
          Propose a date
        </button>
      </header>

      {/* Inbound pending banner */}
      {inboundPending > 0 && (
        <div
          onClick={() => setTab("pending")}
          style={{ margin: "16px 24px 0", padding: "12px 16px", borderRadius: "12px", background: "#fce8eb", border: "1px solid #f5c0c8", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
        >
          <span style={{ fontSize: "18px" }}>💌</span>
          <span style={{ fontSize: "13px", color: "var(--color-primary)", fontWeight: 600 }}>
            You have {inboundPending} date proposal{inboundPending > 1 ? "s" : ""} waiting for your response
          </span>
          <span style={{ marginLeft: "auto", fontSize: "13px", color: "var(--color-primary)" }}>→</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ padding: "16px 24px 0", display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", background: "#fff", marginTop: inboundPending > 0 ? "12px" : "0" }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 16px", borderRadius: "8px 8px 0 0", border: "none",
              background: tab === t.key ? "var(--color-background)" : "transparent",
              borderBottom: tab === t.key ? `2px solid var(--color-primary)` : "2px solid transparent",
              color: tab === t.key ? "var(--color-primary)" : "var(--color-text-muted)",
              fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-primary)",
              fontWeight: tab === t.key ? 600 : 400,
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "999px", background: tab === t.key ? "var(--color-primary)" : "#e5e7eb", color: tab === t.key ? "#fff" : "#6b7280" }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <main style={{ padding: "20px 24px", maxWidth: "680px", margin: "0 auto" }}>
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#fce8eb", color: "var(--color-error)", fontSize: "13px", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid var(--color-primary)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>
              {tab === "upcoming" ? "📆" : tab === "pending" ? "💌" : "🗓️"}
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px", margin: 0 }}>
              {tab === "upcoming" && "No upcoming dates — propose one!"}
              {tab === "pending" && "No pending proposals"}
              {tab === "past" && "No past dates yet"}
              {tab === "all" && "No dates yet — propose one!"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map(d => (
              <DateCard key={d.id} date={d} onUpdate={fetchDates} />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <ProposeModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchDates(); }}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
