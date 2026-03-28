import { useState, useEffect } from "react";
import { Database, Search, FileText, Hash, Clock, Cpu, Layout, Tag } from "lucide-react";
import { listDocuments, getCandidateDetail } from "../api/nexvec";

export default function MetadataPage() {
  const [docs, setDocs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setInitLoading(true);
    listDocuments()
      .then((data) => {
        setDocs(Array.isArray(data.documents) ? data.documents : []);
        setInitLoading(false);
      })
      .catch((err) => {
        setError("Failed to load documents: " + err.message);
        setInitLoading(false);
      });
  }, []);

  const handleSelect = async (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (!id) {
      setDetails(null);
      return;
    }

    setLoading(true);
    setDetails(null);
    try {
      const data = await getCandidateDetail(id);
      setDetails(data);
    } catch (err) {
      setError("Failed to load metadata: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const vectorIds = details
    ? [
        { section: "Objectives", id: details.objectives_chunk_id },
        { section: "Work Experience", id: details.work_experience_text_chunk_id },
        { section: "Projects", id: details.projects_chunk_id },
        { section: "Education", id: details.education_chunk_id },
        { section: "Skills", id: details.skills_chunk_id },
        { section: "Achievements", id: details.achievements_chunk_id },
      ].filter((v) => v.id)
    : [];

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect width="10" height="10" rx="2" fill="#3B6EF5" />
            <path
              d="M3 3h4M3 5h4M3 7h2"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          NexVec · Metadata Explorer
        </div>
        <h1 className="page-title">Vector Metadata</h1>
        <p className="page-subtitle">
          Inspect the underlying vector IDs and metadata assigned to each resume
          section during ingestion.
        </p>
      </div>

      <div className="card fade-up">
        <div className="field-group">
          <label className="field-label">
            <Search size={14} color="#3B6EF5" style={{ marginRight: 6 }} />
            Select Resume
          </label>
          <select
            className="field"
            value={selectedId}
            onChange={handleSelect}
            disabled={initLoading || loading}
          >
            <option value="">Choose a resume...</option>
            {docs.map((d) => (
              <option key={d.resume_id} value={d.resume_id}>
                {d.source_filename} ({d.name || "Unknown"})
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div className="spin-blue" style={{ width: 28, height: 28 }} />
            <div style={{ fontSize: 13, color: "#A89C94" }}>
              Retrieving vector mappings...
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: 16,
              background: "#FEF2F2",
              border: "0.5px solid #FECACA",
              borderRadius: 12,
              color: "#DC2626",
              fontSize: 13,
              marginTop: 10,
            }}
          >
            {error}
          </div>
        )}

        {details && (
          <div className="fade-in" style={{ marginTop: 24 }}>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                marginBottom: 20,
                padding: '12px 16px',
                background: '#F0F4FF',
                borderRadius: 12,
                border: '0.5px solid #D1E0FF'
              }}
            >
              <FileText size={20} color="#3B6EF5" />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1814' }}>{details.source_filename}</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>ID: {details.resume_id}</div>
              </div>
            </div>

            <div className="section-label" style={{ marginBottom: 12 }}>SECTION VECTOR MAPPINGS</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {vectorIds.length > 0 ? (
                vectorIds.map((v) => (
                  <div 
                    key={v.section}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      background: '#FAFAF8',
                      border: '0.5px solid #E8E4DF',
                      borderRadius: 12,
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3B6EF5'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E8E4DF'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Tag size={14} color="#A89C94" />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#5C534A' }}>{v.section}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Hash size={12} color="#3B6EF5" />
                      <code style={{ 
                        fontSize: 11, 
                        background: '#fff', 
                        padding: '4px 10px', 
                        borderRadius: 6,
                        border: '0.5px solid #E8E4DF',
                        color: '#1A1814',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 600
                      }}>
                        {v.id}
                      </code>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: '#A89C94', fontSize: 13 }}>
                  No vector embeddings found for this document.
                </div>
              )}
            </div>

            <div 
              style={{ 
                marginTop: 24, 
                padding: '12px 16px', 
                background: '#F9FAFB', 
                borderRadius: 12, 
                border: '0.5px solid #E8E4DF',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <Cpu size={14} color="#6B7280" />
              <div style={{ fontSize: 11, color: '#6B7280' }}>
                <span style={{ fontWeight: 600 }}>Embedding Model:</span> {details.embedding_model || 'text-embedding-004'}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
