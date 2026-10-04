import React, { useState, useMemo, useRef } from 'react';
import {
  UploadCloud,
  Video,
  Image as ImageIcon,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Search,
  HelpCircle,
  Camera,
  Play,
  Calendar,
  MapPin,
  ShieldCheck,
  FolderOpen,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { GlassTabs } from '../common/GlassTabs';
import { useApp } from '../../context/AppContext';
import type { EvidenceItem, EvidenceType, EvidenceStatus, AppView } from '../../types';

export const EvidencePage: React.FC = () => {
  const {
    evidenceList,
    deleteEvidence,
    setSelectedEvidence,
    setEditingEvidence,
    setIsEvidenceDetailsModalOpen,
    setIsUploadEvidenceModalOpen,
    addEvidence,
    setCurrentView,
    showToast
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Count metrics for summary
  const summaryMetrics = useMemo(() => {
    const total = evidenceList.length;
    const photos = evidenceList.filter((e) => e.type.toLowerCase().includes('photo')).length;
    const videos = evidenceList.filter((e) => e.type.toLowerCase().includes('video')).length;
    const documents = evidenceList.filter((e) => {
      const t = e.type.toLowerCase();
      return t.includes('doc') || t.includes('cert') || t.includes('record') || t.includes('portfolio') || t.includes('other');
    }).length;

    // Unique skills supported
    const uniqueSkills = new Set(evidenceList.flatMap((e) => e.linkedSkills || []));
    const pendingCount = evidenceList.filter((e) => e.status === 'Pending Review' || e.status === 'Uploaded').length;

    // Evidence completeness progress (demo metric)
    const completeness = total >= 8 ? 75 : Math.min(100, Math.round((total / 10) * 100));

    return {
      total,
      photos,
      videos,
      documents,
      skillsCount: uniqueSkills.size,
      pendingCount,
      completeness
    };
  }, [evidenceList]);

  // Filtered evidence items
  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((item) => {
      // Tab filter
      const typeLower = item.type.toLowerCase();
      if (activeFilter === 'photos' && !typeLower.includes('photo')) return false;
      if (activeFilter === 'videos' && !typeLower.includes('video')) return false;
      if (activeFilter === 'documents' && (!typeLower.includes('doc') && !typeLower.includes('record'))) return false;
      if (activeFilter === 'certificates' && (!typeLower.includes('cert') && !typeLower.includes('portfolio'))) return false;
      if (activeFilter === 'pending' && item.status !== 'Pending Review') return false;
      if (activeFilter === 'reviewed' && item.status !== 'Reviewed') return false;

      // Text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(q);
        const descMatch = item.description.toLowerCase().includes(q);
        const fileMatch = item.fileName.toLowerCase().includes(q);
        const locMatch = item.location?.toLowerCase().includes(q) ?? false;
        const skillMatch = (item.linkedSkills || []).some((s) => s.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !fileMatch && !locMatch && !skillMatch) {
          return false;
        }
      }

      return true;
    });
  }, [evidenceList, activeFilter, searchQuery]);

  const getEvidenceIcon = (type: EvidenceType) => {
    const t = type.toLowerCase();
    if (t.includes('video')) return <Video size={20} color="#123B5D" />;
    if (t.includes('photo')) return <ImageIcon size={20} color="#25A7A0" />;
    if (t.includes('cert')) return <Award size={20} color="#D97706" />;
    return <FileText size={20} color="#4DA3D9" />;
  };

  const getStatusBadge = (status: EvidenceStatus) => {
    switch (status) {
      case 'Reviewed':
        return (
          <GlassBadge variant="success" icon={<CheckCircle2 size={12} />}>
            Reviewed
          </GlassBadge>
        );
      case 'Pending Review':
        return (
          <GlassBadge variant="warning" icon={<Clock size={12} />}>
            Pending Review
          </GlassBadge>
        );
      case 'Uploaded':
      default:
        return (
          <GlassBadge variant="navy" icon={<Clock size={12} />}>
            Uploaded
          </GlassBadge>
        );
    }
  };

  const handleOpenView = (item: EvidenceItem) => {
    setSelectedEvidence(item);
    setIsEvidenceDetailsModalOpen(true);
  };

  const handleOpenEdit = (item: EvidenceItem) => {
    setEditingEvidence(item);
    setIsUploadEvidenceModalOpen(true);
  };

  const handleQuickUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video/');
      const isImg = file.type.startsWith('image/');
      const generatedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const cleanTitle = generatedTitle.charAt(0).toUpperCase() + generatedTitle.slice(1);

      addEvidence({
        title: cleanTitle,
        type: isVid ? 'Work Video' : isImg ? 'Work Photo' : 'Work Document',
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        duration: isVid ? '2:30' : undefined,
        description: `Uploaded practical evidence file: ${file.name}. Submitted for authorized assessor review.`,
        dateOfWork: new Date().toISOString().split('T')[0],
        location: 'On-site Workshop',
        roleInWork: 'I personally performed the demonstrated work.',
        status: 'Uploaded',
        linkedSkills: ['Electrical Installation', 'Safety Procedures & LOTO'],
        isDemo: true
      });
      showToast(`"${file.name}" uploaded to RPL portfolio.`, 'success');
    }
  };

  // RPL Workflow Steps array
  const workflowSteps = [
    { label: 'Profile', view: 'profile' as AppView, stepNum: 1 },
    { label: 'Experience', view: 'experience' as AppView, stepNum: 2 },
    { label: 'Self Declaration', view: 'declaration' as AppView, stepNum: 3 },
    { label: 'Evidence', view: 'evidence' as AppView, isCurrent: true, stepNum: 4 },
    { label: 'Assessment', view: 'assessment' as AppView, stepNum: 5 },
    { label: 'Assessor Review', view: 'assessor-dashboard' as AppView, stepNum: 6 },
    { label: 'Outcome', view: 'results' as AppView, stepNum: 7 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }} className="animate-fade-in">
      {/* Hidden File Input for Direct Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={handleQuickUpload}
        style={{ display: 'none' }}
      />

      {/* ==================================================
          1. TOP RPL WORKFLOW PIPELINE
          ================================================== */}
      <GlassCard
        variant="default"
        style={{
          padding: '14px 20px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 248, 255, 0.7) 100%)',
          border: '1px solid rgba(77, 163, 217, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
            {workflowSteps.map((step, idx) => (
              <React.Fragment key={step.label}>
                <button
                  type="button"
                  onClick={() => setCurrentView(step.view)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: step.isCurrent ? 800 : 500,
                    background: step.isCurrent
                      ? 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)'
                      : 'rgba(255, 255, 255, 0.65)',
                    color: step.isCurrent ? '#FFFFFF' : 'var(--color-primary-navy)',
                    border: step.isCurrent ? '1px solid #123B5D' : '1px solid rgba(18, 59, 93, 0.12)',
                    boxShadow: step.isCurrent ? '0 2px 8px rgba(18, 59, 93, 0.25)' : 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: step.isCurrent ? '#FFFFFF' : 'rgba(18, 59, 93, 0.1)',
                      color: step.isCurrent ? '#123B5D' : 'var(--color-primary-navy)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 800
                    }}
                  >
                    {step.stepNum}
                  </span>
                  <span>{step.label}</span>
                </button>
                {idx < workflowSteps.length - 1 && (
                  <ChevronRight size={14} color="#8FA5C5" style={{ flexShrink: 0 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--color-accent-teal)',
              background: 'var(--color-accent-teal-soft)',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(37, 167, 160, 0.25)'
            }}
          >
            ACTIVE RPL WORKFLOW
          </div>
        </div>
      </GlassCard>

      {/* ==================================================
          2. PAGE HEADER
          ================================================== */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                padding: '3px 10px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, rgba(77, 163, 217, 0.2) 0%, rgba(37, 167, 160, 0.2) 100%)',
                color: 'var(--color-primary-navy)',
                border: '1px solid rgba(77, 163, 217, 0.35)'
              }}
            >
              STEP 4 — EVIDENCE
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(217, 119, 6, 0.12)',
                color: '#B45309',
                border: '1px solid rgba(217, 119, 6, 0.25)'
              }}
            >
              DEMO DATASET
            </span>
          </div>

          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--color-primary-navy)',
              marginTop: '6px',
              letterSpacing: '-0.02em'
            }}
          >
            Evidence
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              marginTop: '4px',
              maxWidth: '680px',
              lineHeight: 1.45
            }}
          >
            Show examples of your experience and practical skills.
          </p>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={15} color="var(--color-accent-teal)" />
            <span>Your evidence helps the assessor understand and verify your practical experience.</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <GlassButton
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => {
              setEditingEvidence(null);
              setIsUploadEvidenceModalOpen(true);
            }}
          >
            Add Evidence
          </GlassButton>
        </div>
      </div>

      {/* ==================================================
          3. EVIDENCE SUMMARY SECTION (CARDS)
          ================================================== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-navy)', letterSpacing: '0.02em' }}>
            PORTFOLIO SUMMARY
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            * All figures are interactive DEMO values
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}
        >
          {/* Card 1: Evidence Items */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.7) 100%)',
              border: '1px solid rgba(77, 163, 217, 0.3)'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Evidence Items
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
                {summaryMetrics.total}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {summaryMetrics.total} Evidence Items (DEMO)
              </div>
            </div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(18, 59, 93, 0.2)'
              }}
            >
              <FolderOpen size={22} />
            </div>
          </GlassCard>

          {/* Card 2: Photos */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.7) 100%)',
              border: '1px solid rgba(37, 167, 160, 0.3)'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Photos
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
                {summaryMetrics.photos}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {summaryMetrics.photos} Photos (DEMO)
              </div>
            </div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #25A7A0 0%, #1E8781 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(37, 167, 160, 0.2)'
              }}
            >
              <ImageIcon size={22} />
            </div>
          </GlassCard>

          {/* Card 3: Videos */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.7) 100%)',
              border: '1px solid rgba(77, 163, 217, 0.3)'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Videos
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
                {summaryMetrics.videos}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {summaryMetrics.videos} Videos (DEMO)
              </div>
            </div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #123B5D 0%, #4DA3D9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(77, 163, 217, 0.25)'
              }}
            >
              <Video size={22} />
            </div>
          </GlassCard>

          {/* Card 4: Documents */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.7) 100%)',
              border: '1px solid rgba(217, 119, 6, 0.3)'
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Documents
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-navy)', marginTop: '2px' }}>
                {summaryMetrics.documents}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {summaryMetrics.documents} Documents (DEMO)
              </div>
            </div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(217, 119, 6, 0.2)'
              }}
            >
              <FileText size={22} />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ==================================================
          4. LARGE PROFESSIONAL GLASS UPLOAD AREA
          ================================================== */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '38px 24px',
          textAlign: 'center',
          border: '2px dashed rgba(77, 163, 217, 0.5)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.65) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(11, 41, 66, 0.05)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #DFF2FF 100%)',
            border: '1.5px solid rgba(77, 163, 217, 0.4)',
            boxShadow: '0 6px 18px rgba(77, 163, 217, 0.25), inset 0 1px 0 #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <UploadCloud size={32} color="#123B5D" />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
          Add Evidence
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '580px', marginTop: '6px', lineHeight: 1.5 }}>
          Upload photos, videos, documents or certificates that demonstrate your experience.
        </p>

        {/* Buttons Row */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <GlassButton
            variant="primary"
            icon={<UploadCloud size={16} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload File
          </GlassButton>

          <GlassButton
            variant="secondary"
            icon={<Camera size={16} />}
            onClick={() => {
              setEditingEvidence(null);
              setIsUploadEvidenceModalOpen(true);
            }}
          >
            Take Photo
          </GlassButton>

          <GlassButton
            variant="secondary"
            icon={<Video size={16} />}
            onClick={() => {
              setEditingEvidence(null);
              setIsUploadEvidenceModalOpen(true);
            }}
          >
            Record Video
          </GlassButton>
        </div>

        {/* Supported Types & Size Info */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Images', 'Videos', 'PDF', 'Documents'].map((t) => (
            <span
              key={t}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '4px 12px',
                background: 'rgba(255, 255, 255, 0.85)',
                borderRadius: '8px',
                border: '1px solid rgba(18, 59, 93, 0.1)',
                color: 'var(--color-primary-navy)'
              }}
            >
              {t}
            </span>
          ))}
        </div>

        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '10px' }}>
          Maximum file size: Demo limit
        </div>
      </GlassCard>

      {/* ==================================================
          5. SEARCH & FILTER CONTROLS
          ================================================== */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              minWidth: '260px',
              flex: '1 1 300px',
              maxWidth: '460px'
            }}
          >
            <Search
              size={16}
              color="#8FA5C5"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search evidence..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '12px',
                border: '1px solid rgba(18, 59, 93, 0.18)',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
                fontSize: '13.5px',
                color: 'var(--color-primary-navy)',
                outline: 'none',
                boxShadow: '0 2px 6px rgba(11, 41, 66, 0.03)'
              }}
            />
          </div>

          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Showing {filteredEvidence.length} of {evidenceList.length} evidence items
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
          <GlassTabs
            tabs={[
              { id: 'all', label: 'All', count: evidenceList.length },
              { id: 'photos', label: 'Photos', count: summaryMetrics.photos },
              { id: 'videos', label: 'Videos', count: summaryMetrics.videos },
              { id: 'documents', label: 'Documents', count: summaryMetrics.documents },
              { id: 'certificates', label: 'Certificates', count: evidenceList.filter((e) => e.type.toLowerCase().includes('cert')).length },
              { id: 'pending', label: 'Pending Review', count: evidenceList.filter((e) => e.status === 'Pending Review').length },
              { id: 'reviewed', label: 'Reviewed', count: evidenceList.filter((e) => e.status === 'Reviewed').length }
            ]}
            activeTab={activeFilter}
            onChange={setActiveFilter}
          />
        </div>
      </div>

      {/* ==================================================
          6. EVIDENCE CARDS GRID OR EMPTY STATE
          ================================================== */}
      {filteredEvidence.length === 0 ? (
        /* Empty State */
        <GlassCard
          variant="elevated"
          style={{
            padding: '50px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 248, 255, 0.7) 100%)'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(77, 163, 217, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-navy)'
            }}
          >
            <FolderOpen size={30} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
            No evidence added yet
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', maxWidth: '440px', margin: 0 }}>
            Upload photos, videos, certificates or documents that demonstrate your practical experience.
          </p>
          <GlassButton
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => {
              setEditingEvidence(null);
              setIsUploadEvidenceModalOpen(true);
            }}
          >
            Add Evidence
          </GlassButton>
        </GlassCard>
      ) : (
        /* Evidence Cards Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}
        >
          {filteredEvidence.map((item) => {
            const isVid = item.type.toLowerCase().includes('video');
            const isDoc = item.type.toLowerCase().includes('doc') || item.type.toLowerCase().includes('cert');

            return (
              <GlassCard
                key={item.id}
                variant="interactive"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 251, 253, 0.85) 100%)',
                  border: '1px solid rgba(77, 163, 217, 0.25)',
                  boxShadow: '0 4px 14px rgba(11, 41, 66, 0.04)',
                  position: 'relative'
                }}
              >
                {/* Top Row: Thumbnail/Icon + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #DFF2FF 100%)',
                        border: '1px solid rgba(77, 163, 217, 0.3)',
                        boxShadow: '0 2px 6px rgba(11, 41, 66, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {getEvidenceIcon(item.type)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: 'var(--color-accent-teal)'
                        }}
                      >
                        {item.type}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                        {item.fileSize} {item.duration ? `• ⏱ ${item.duration}` : ''}
                      </div>
                    </div>
                  </div>

                  {getStatusBadge(item.status)}
                </div>

                {/* Video / Photo Visual Preview Box */}
                {isVid && (
                  <div
                    onClick={() => handleOpenView(item)}
                    style={{
                      position: 'relative',
                      height: '110px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #091D30 0%, #123B5D 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#123B5D',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                      }}
                    >
                      <Play size={18} fill="#123B5D" style={{ marginLeft: '2px' }} />
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                    >
                      {item.duration || '2:30'}
                    </div>
                  </div>
                )}

                {/* Document Information Badge */}
                {isDoc && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(240, 248, 255, 0.6)',
                      border: '1px solid rgba(77, 163, 217, 0.2)',
                      fontSize: '11.5px',
                      color: 'var(--color-primary-navy)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                      📄 {item.fileName}
                    </span>
                    <span style={{ fontSize: '10px', background: 'rgba(77, 163, 217, 0.2)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      DEMO DATA
                    </span>
                  </div>
                )}

                {/* Evidence Title & Metadata */}
                <div>
                  <h3
                    style={{
                      fontSize: '15.5px',
                      fontWeight: 800,
                      color: 'var(--color-primary-navy)',
                      lineHeight: 1.35,
                      margin: 0
                    }}
                  >
                    {item.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                    {item.dateOfWork && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={12} /> {item.dateOfWork}
                      </span>
                    )}
                    {item.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MapPin size={12} /> {item.location}
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--color-text-secondary)',
                      marginTop: '8px',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Linked Skills Chips */}
                <div>
                  {(() => {
                    const skills = item.linkedSkills || [];
                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                            Linked Skills:
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-sky)' }}>
                            Linked to {skills.length} skill{skills.length === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: 'rgba(223, 242, 255, 0.7)',
                                color: 'var(--color-primary-navy)',
                                border: '1px solid rgba(77, 163, 217, 0.3)'
                              }}
                            >
                              {skill}
                            </span>
                          ))}
                          {skills.length > 3 && (
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: 'rgba(18, 59, 93, 0.06)',
                                color: 'var(--color-text-muted)'
                              }}
                            >
                              +{skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Card Actions: View, Edit, Delete */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(18, 59, 93, 0.08)'
                  }}
                >
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    icon={<Eye size={14} />}
                    onClick={() => handleOpenView(item)}
                  >
                    View
                  </GlassButton>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      title="Edit evidence details"
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: 'rgba(18, 59, 93, 0.05)',
                        border: '1px solid rgba(18, 59, 93, 0.1)',
                        color: 'var(--color-primary-navy)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteEvidence(item.id)}
                      title="Delete evidence artifact"
                      style={{
                        padding: '6px 8px',
                        borderRadius: '8px',
                        background: 'rgba(220, 38, 38, 0.08)',
                        border: '1px solid rgba(220, 38, 38, 0.2)',
                        color: '#DC2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* ==================================================
          7. BOTTOM GUIDANCE & STATUS PANELS
          ================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '20px',
          marginTop: '10px'
        }}
      >
        {/* Panel A: Evidence Quality Check */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '22px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.8) 100%)',
            border: '1px solid rgba(37, 167, 160, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--color-accent-teal-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent-teal)'
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                Tips for useful evidence
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                High-quality evidence speeds up assessor evaluation
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              'Show your own work clearly',
              'Explain what you personally did',
              'Use clear photos or videos',
              'Link evidence to the relevant skill',
              'Avoid uploading unnecessary personal information'
            ].map((tip, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-primary-navy)' }}>
                <span style={{ color: 'var(--color-accent-teal)', fontWeight: 800 }}>✓</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Panel B: Evidence Status & Completeness */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '22px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.8) 100%)',
            border: '1px solid rgba(77, 163, 217, 0.3)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-secondary-sky)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                COLLECTION PROGRESS
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: '2px 0 0 0' }}>
                Evidence Collection
              </h4>
            </div>
            <GlassBadge variant="navy">{summaryMetrics.completeness}% Complete</GlassBadge>
          </div>

          {/* Progress Bar */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: 'var(--color-primary-navy)', marginBottom: '6px' }}>
              <span>Evidence completeness</span>
              <span>{summaryMetrics.completeness}%</span>
            </div>
            <div
              style={{
                height: '8px',
                borderRadius: '4px',
                background: 'rgba(18, 59, 93, 0.1)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${summaryMetrics.completeness}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #123B5D 0%, #25A7A0 100%)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Metrics summary list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total items added:</span>
              <strong style={{ color: 'var(--color-primary-navy)' }}>{summaryMetrics.total} items added</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Skills supported:</span>
              <strong style={{ color: 'var(--color-accent-teal)' }}>{summaryMetrics.skillsCount} skills supported</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items awaiting review:</span>
              <strong style={{ color: '#D97706' }}>{summaryMetrics.pendingCount} items awaiting review</strong>
            </div>
          </div>

          {/* Important Notice on Progress Meaning */}
          <div
            style={{
              marginTop: '14px',
              padding: '8px 10px',
              borderRadius: '8px',
              background: 'rgba(18, 59, 93, 0.04)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              lineHeight: 1.4
            }}
          >
            <strong>Note:</strong> This indicates evidence collection progress and does not determine competency.
          </div>
        </GlassCard>

        {/* Panel C: RPL Context Panel */}
        <GlassCard
          variant="elevated"
          style={{
            padding: '22px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.8) 100%)',
            border: '1px solid rgba(18, 59, 93, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(18, 59, 93, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-navy)'
              }}
            >
              <HelpCircle size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                Why provide evidence?
              </h4>
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', margin: 0 }}>
                RPL Assessment Context & Purpose
              </p>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Evidence gives assessors additional information about the experience and skills you have declared. It supports the assessment process but does not by itself determine your competency.
          </p>

          <div
            style={{
              marginTop: '16px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.7) 0%, rgba(223, 242, 255, 0.4) 100%)',
              border: '1px solid rgba(77, 163, 217, 0.25)',
              fontSize: '12px',
              color: 'var(--color-primary-navy)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldCheck size={16} color="var(--color-accent-teal)" style={{ flexShrink: 0 }} />
            <span>Final competency decisions are made through the authorized assessment process.</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
