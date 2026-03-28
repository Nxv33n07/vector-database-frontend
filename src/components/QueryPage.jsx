import { useState, useEffect } from "react";
import {
  Search,
  AlertCircle,
  User,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Database,
  Cpu,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Award,
  BookOpen,
  Code,
  Target,
  Terminal,
} from "lucide-react";
import { retrieve, getCandidateDetail } from "../api/nexvec";
import { CandidateProfile } from "./ResumeModal";

// ─── Query Logs Panel ─────────────────────────────────────────────────────────
function QueryLogsPanel({ logs }) {
  const [open, setOpen] = useState(true);
  if (!logs) return null;

  const isVector = logs.routing_decision === "rds_and_vector";

  return (
    <div style={{ width: "100%", maxWidth: 560, marginTop: 16 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "#F7F5F2",
          border: "0.5px solid #E8E4DF",
          borderRadius: open ? "12px 12px 0 0" : 12,
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          color: "#5C534A",
          fontFamily: "DM Sans, sans-serif",
          transition: "all 0.15s",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Terminal size={13} color="#3B6EF5" />
          Query Intelligence Logs
        </span>
        {open ? (
          <ChevronUp size={14} color="#A89C94" />
        ) : (
          <ChevronDown size={14} color="#A89C94" />
        )}
      </button>

      {open && (
        <div
          style={{
            background: "#0F1117",
            borderRadius: "0 0 12px 12px",
            border: "0.5px solid #E8E4DF",
            borderTop: "none",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {/* Recruiter Query */}
          <LogBlock
            icon={<Search size={12} color="#A89C94" />}
            label="RECRUITER QUERY"
            value={logs.user_query}
            valueStyle={{ color: "#E2E8F0", fontStyle: "italic" }}
          />

          {/* Routing Decision */}
          <div>
            <LogLabel
              icon={<Cpu size={12} color="#A89C94" />}
              label="ROUTING DECISION"
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 10px",
                  borderRadius: 20,
                  background: isVector ? "#312E81" : "#14532D",
                  color: isVector ? "#A5B4FC" : "#86EFAC",
                  border: `0.5px solid ${isVector ? "#4F46E5" : "#22C55E"}`,
                }}
              >
                {isVector ? "RDS + VectorDB" : "RDS Only"}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "#6B7280",
                  fontFamily: "monospace",
                }}
              >
                {logs.sql_matched_count} SQL matches
              </span>
            </div>
            <p
              style={{
                fontSize: 11,
                color: "#9CA3AF",
                marginTop: 5,
                lineHeight: 1.5,
              }}
            >
              {logs.routing_reason}
            </p>
          </div>

          {/* SQL Query */}
          <div>
            <LogLabel
              icon={<Database size={12} color="#A89C94" />}
              label="SQL QUERY → RDS (PostgreSQL)"
            />
            <pre
              style={{
                marginTop: 6,
                fontSize: 11,
                lineHeight: 1.7,
                color: "#93C5FD",
                background: "#1E2130",
                borderRadius: 8,
                padding: "10px 14px",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                border: "0.5px solid #2D3748",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {logs.sql_query}
            </pre>
          </div>

          {/* Vector Search */}
          {logs.vector_search_used && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <LogLabel
                  icon={<Cpu size={12} color="#A89C94" />}
                  label="VECTOR QUERY → VectorDB (Gemini Embeddings)"
                />
                <pre
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    lineHeight: 1.7,
                    color: "#C4B5FD",
                    background: "#1E2130",
                    borderRadius: 8,
                    padding: "10px 14px",
                    overflowX: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    border: "0.5px solid #2D3748",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {logs.vector_query || logs.user_query}
                </pre>
              </div>
              {logs.vector_section_used && (
                <div>
                  <LogLabel
                    icon={<Cpu size={12} color="#A89C94" />}
                    label="SECTION SCORED"
                  />
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 5,
                      marginTop: 5,
                    }}
                  >
                    {[logs.vector_section_used].map((sec) => (
                      <span
                        key={sec}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 20,
                          background: "#1E1B4B",
                          color: "#A5B4FC",
                          border: "0.5px solid #3730A3",
                          textTransform: "capitalize",
                        }}
                      >
                        {sec.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!logs.vector_search_used && (
            <div
              style={{
                fontSize: 11,
                color: "#4B5563",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Cpu size={11} />
              VectorDB skipped — structured SQL filter is sufficient
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LogLabel({ icon, label }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}
    >
      {icon}
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "#6B7280",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function LogBlock({ icon, label, value, valueStyle = {} }) {
  return (
    <div>
      <LogLabel icon={icon} label={label} />
      <p
        style={{
          fontSize: 12,
          color: "#D1D5DB",
          marginTop: 4,
          lineHeight: 1.5,
          ...valueStyle,
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ candidate, rank, onClick }) {
  const score =
    candidate.similarity_score !== null &&
    candidate.similarity_score !== undefined
      ? `${(candidate.similarity_score * 100).toFixed(1)}% match`
      : null;

  return (
    <div
      className="result-card fade-up"
      onClick={() => onClick(candidate)}
      style={{
        cursor: "pointer",
        transition: "all 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#3B6EF5";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,110,245,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E8E4DF";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)";
      }}
    >
      <div
        className="result-header"
        style={{ justifyContent: "space-between" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "#E0E7FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4F46E5" }}>
              #{rank}
            </span>
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1A1814" }}>
              {candidate.name || candidate.source_filename}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#A89C94",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <MapPin size={10} /> {candidate.location || "Unknown Location"}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 4,
          }}
        >
          {score && <span className="result-score">{score}</span>}
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 600,
              padding: "1px 7px",
              borderRadius: 20,
              background:
                candidate.match_type === "vector" ? "#EDE9FE" : "#DCFCE7",
              color: candidate.match_type === "vector" ? "#7C3AED" : "#15803D",
              border: `0.5px solid ${candidate.match_type === "vector" ? "#C4B5FD" : "#86EFAC"}`,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {candidate.match_type === "vector" ? "Vector" : "SQL"}
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          fontSize: 12,
          color: "#5C534A",
        }}
      >
        {candidate.work_experience_years != null && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Briefcase size={12} /> {candidate.work_experience_years} yrs exp
          </span>
        )}
        {candidate.email && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Mail size={12} /> {candidate.email}
          </span>
        )}
      </div>

      {candidate.skills && candidate.skills.length > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}
        >
          {candidate.skills.slice(0, 7).map((s) => (
            <span
              key={s}
              style={{
                fontSize: 10.5,
                fontWeight: 500,
                color: "#4F46E5",
                background: "#EEF2FF",
                padding: "2px 8px",
                borderRadius: 99,
              }}
            >
              {s}
            </span>
          ))}
          {candidate.skills.length > 7 && (
            <span
              style={{ fontSize: 10, color: "#A89C94", alignSelf: "center" }}
            >
              +{candidate.skills.length - 7} more
            </span>
          )}
        </div>
      )}

      {candidate.matched_sections && candidate.matched_sections.length > 0 && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 8,
            borderTop: "0.5px solid #F0EDE9",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "#A89C94",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Matched:
          </span>
          {candidate.matched_sections.map((sec) => (
            <span
              key={sec}
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#059669",
                background: "#D1FAE5",
                padding: "1px 6px",
                borderRadius: 4,
                textTransform: "capitalize",
              }}
            >
              {sec.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 10,
          fontSize: 11,
          color: "#C7BAB0",
          textAlign: "right",
        }}
      >
        Click to view full profile →
      </div>
    </div>
  );
}

// Shared CandidateProfile component is now imported from ResolveModal

// ─── Main QueryPage ───────────────────────────────────────────────────────────
export default function QueryPage() {
  const [query, setQuery] = useState("");
  const [k, setK] = useState(5);
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState("");
  const [profileId, setProfileId] = useState(null);

  const busy = status === "loading";

  const search = async () => {
    if (!query.trim()) return;
    setStatus("loading");
    setError("");
    setResults([]);
    setLogs(null);
    try {
      const res = await retrieve({ query: query.trim(), k });
      setResults(res.candidates || []);
      setLogs(res.logs || null);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect width="10" height="10" rx="2" fill="#3B6EF5" />
            <circle cx="4.5" cy="4.5" r="2" stroke="white" strokeWidth="1.2" />
            <path
              d="M6 6l1.5 1.5"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          NexVec · Semantic Match
        </div>
        <h1 className="page-title">Candidate Search</h1>
        <p className="page-subtitle">
          Describe the role or skills you're looking for to find the
          best-matched resumes.
        </p>
      </div>

      <div className="card fade-up">
        <div className="field-group">
          <label className="field-label">Natural Language Query</label>
          <textarea
            className="field"
            style={{ resize: "vertical", minHeight: 80, lineHeight: 1.6 }}
            placeholder="e.g. Senior ML Engineer with 4+ years of Python and LLM experience"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) search();
            }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="field-label">Top Results Count</label>
          <input
            className="field"
            type="number"
            min={1}
            max={50}
            value={k}
            onChange={(e) => setK(+e.target.value)}
            disabled={busy}
            style={{ maxWidth: 100 }}
          />
        </div>

        <button
          className={`btn-submit${busy ? " loading" : ""}`}
          onClick={search}
          disabled={busy || !query.trim()}
        >
          {busy ? (
            <>
              <div className="spin" />
              Searching…
            </>
          ) : (
            <>
              <Search size={15} />
              Run Semantic Match
            </>
          )}
        </button>
      </div>

      {status === "error" && (
        <div
          className="res-box fade-up"
          style={{ marginTop: 16, border: "0.5px solid #FECACA" }}
        >
          <div
            className="res-box-header"
            style={{ background: "#FEF2F2", borderBottomColor: "#FECACA" }}
          >
            <AlertCircle size={16} color="#DC2626" />
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#991B1B" }}>
              Search Failed
            </div>
          </div>
          <div className="res-box-body">
            <pre
              className="res-pre"
              style={{ color: "#7F1D1D", background: "#FFF7F7" }}
            >
              {error}
            </pre>
          </div>
        </div>
      )}

      {/* Query Intelligence Logs */}
      {status === "success" && logs && <QueryLogsPanel logs={logs} />}

      {/* Results */}
      {status === "success" && (
        <div style={{ width: "100%", maxWidth: 560, marginTop: 16 }}>
          <div
            style={{
              fontSize: 12,
              color: "#A89C94",
              marginBottom: 10,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              {results.length} candidate{results.length !== 1 ? "s" : ""} found
            </span>
            {logs && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background:
                    logs.routing_decision === "rds_and_vector"
                      ? "#EDE9FE"
                      : "#DCFCE7",
                  color:
                    logs.routing_decision === "rds_and_vector"
                      ? "#7C3AED"
                      : "#15803D",
                }}
              >
                {logs.routing_decision === "rds_and_vector"
                  ? "RDS + VectorDB"
                  : "RDS Only"}
              </span>
            )}
          </div>

          {results.length === 0 ? (
            <div
              className="card fade-up"
              style={{
                textAlign: "center",
                padding: "32px",
                color: "#A89C94",
                fontSize: 13.5,
              }}
            >
              No candidates found matching your query.
            </div>
          ) : (
            results.map((c, i) => (
              <ResultCard
                key={c.resume_id || i}
                candidate={c}
                rank={i + 1}
                onClick={(cand) => setProfileId(cand.resume_id)}
              />
            ))
          )}
        </div>
      )}

      {/* Profile Modal */}
      {profileId && (
        <CandidateProfile
          resumeId={profileId}
          onClose={() => setProfileId(null)}
        />
      )}
    </>
  );
}
