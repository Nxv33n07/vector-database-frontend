import { useState, useEffect } from 'react';
import { FileText, RefreshCw, AlertCircle, Trash2, X, Check, Loader2, Eye } from 'lucide-react';
import { listDocuments, deleteDocument } from '../api/nexvec';
import { CandidateProfile } from './ResumeModal';

function DocumentCard({ document, onDelete, onView }) {
  const [deleteStage, setDeleteStage] = useState('idle'); // 'idle' | 'confirm' | 'busy'
  const name = document?.name ?? 'Unknown';
  const filename = document?.source_filename ?? 'Unknown';
  const date = document?.created_at ? new Date(document.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }) : '—';

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setDeleteStage('confirm');
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setDeleteStage('idle');
  };

  const handleConfirmDelete = async (e) => {
    e.stopPropagation();
    setDeleteStage('busy');
    try {
      await onDelete(filename);
    } catch (err) {
      setDeleteStage('idle');
    }
  };

  return (
    <div 
      className="collection-card" 
      onClick={() => onView(document.resume_id)}
      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
    >
      <div className="collection-card-header">
        <div className="collection-icon">
          <FileText size={16} color="#3B6EF5" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="collection-name" title={filename}>{filename}</div>
          <div className="collection-model">{name}</div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {deleteStage === 'idle' && (
            <button
              onClick={handleDeleteClick}
              style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: 'none',
                borderRadius: 6,
                padding: '6px',
                cursor: 'pointer',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title="Delete document"
            >
              <Trash2 size={14} />
            </button>
          )}

          {deleteStage === 'confirm' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, animation: 'fadeIn 0.2s' }}>
              <button
                onClick={handleConfirmDelete}
                style={{
                  background: '#EF4444',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Check size={12} /> Confirm
              </button>
              <button
                onClick={handleCancelDelete}
                style={{
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {deleteStage === 'busy' && (
            <div style={{ padding: '4px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Loader2 size={16} className="spin" />
              <span style={{ fontSize: 11, fontWeight: 600 }}>Deleting...</span>
            </div>
          )}
          
          <div style={{ marginLeft: 4, color: '#A89C94', opacity: 0.5 }}>
            <Eye size={14} />
          </div>
        </div>
      </div>
      <div className="collection-stats">
        <div className="cstat">
          <div className="cstat-num">{date}</div>
          <div className="cstat-lbl">Created</div>
        </div>
        <div className="cstat-div" />
        <div className="cstat" style={{ flex: 2 }}>
           <div className="cstat-lbl" style={{ color: '#5C534A' }}>Full Name: {name}</div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage({ onRefresh }) {
  const [docs, setDocs] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [profileId, setProfileId] = useState(null);

  const load = async () => {
    setStatus('loading'); setError('');
    try {
      const data = await listDocuments();
      setDocs(Array.isArray(data.documents) ? data.documents : []);
      setStatus('success');
    } catch (err) {
      setStatus('error'); setError(err.message);
    }
  };

  const remove = async (filename) => {
    try {
      await deleteDocument(filename);
      setDocs(prev => prev.filter(d => d.source_filename !== filename));
      onRefresh?.();
    } catch (err) {
      alert(err.message);
      throw err;
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="page-header">
        <div className="page-eyebrow">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect width="10" height="10" rx="2" fill="#3B6EF5"/>
            <path d="M2.5 3.5h5M2.5 5h5M2.5 6.5h3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          NexVec · Documents
        </div>
        <h1 className="page-title">Uploaded Resumes</h1>
        <p className="page-subtitle">List of all active resumes ingested into the vector engine.</p>
      </div>

      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <button className="btn-sm" onClick={load} disabled={status === 'loading'}>
            <RefreshCw size={12} className={status === 'loading' ? 'spin-slow' : ''} />
            Refresh
          </button>
        </div>

        {status === 'loading' && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div className="spin-blue" style={{ width: 24, height: 24, borderWidth: 3 }} />
          </div>
        )}

        {status === 'error' && (
          <div className="res-box fade-up" style={{ border: '0.5px solid #FECACA' }}>
            <div className="res-box-header" style={{ background: '#FEF2F2', borderBottomColor: '#FECACA' }}>
              <AlertCircle size={16} color="#DC2626" />
              <div style={{ fontSize: 13.5, fontWeight: 600, color: '#991B1B' }}>Failed to load resumes</div>
            </div>
            <div className="res-box-body">
              <pre className="res-pre" style={{ color: '#7F1D1D', background: '#FFF7F7' }}>{error}</pre>
            </div>
          </div>
        )}

        {status === 'success' && docs.length === 0 && (
          <div className="card fade-up" style={{ textAlign: 'center', padding: '48px 32px' }}>
             <FileText size={32} color="#D5CFC9" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 14, fontWeight: 500, color: '#5C534A', marginBottom: 6 }}>No documents found</div>
            <div style={{ fontSize: 13, color: '#A89C94' }}>Ingest a PDF resume to start building your candidate pool.</div>
          </div>
        )}

        {status === 'success' && docs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {docs.map((d, i) => (
              <div key={d?.resume_id ?? i} className="fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <DocumentCard document={d} onDelete={remove} onView={setProfileId} />
              </div>
            ))}
          </div>
        )}
      </div>

      {profileId && (
        <CandidateProfile 
          resumeId={profileId} 
          onClose={() => setProfileId(null)} 
        />
      )}
    </>
  );
}
