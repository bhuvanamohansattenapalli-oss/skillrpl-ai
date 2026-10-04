import React, { useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ShieldCheck,
  FileCheck,
  Award,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { GlassStatCard } from '../common/GlassStatCard';
import { useApp } from '../../context/AppContext';

export const AssessorDashboard: React.FC = () => {
  const {
    candidatesForAssessor,
    setSelectedCandidateId,
    setCurrentView,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredCandidates = candidatesForAssessor.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.applicationId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.assessmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <GlassBadge variant="success" icon={<CheckCircle2 size={12} />}>Completed</GlassBadge>;
      case 'In Progress':
        return <GlassBadge variant="sky" icon={<Clock size={12} />}>In Progress</GlassBadge>;
      case 'Needs Review':
        return <GlassBadge variant="warning" icon={<AlertCircle size={12} />}>Needs Review</GlassBadge>;
      case 'Pending Review':
      default:
        return <GlassBadge variant="navy" icon={<Clock size={12} />}>Pending Review</GlassBadge>;
    }
  };

  const handleEvaluate = (candidateId: string) => {
    setSelectedCandidateId(candidateId);
    setCurrentView('assessor-candidate');
    showToast(`Loaded candidate evaluation workspace.`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }} className="animate-fade-in">
      {/* Assessor Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
              Assessor Dashboard
            </h1>
            <GlassBadge variant="teal" icon={<ShieldCheck size={13} />}>
              Accredited Sector Assessor
            </GlassBadge>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Review candidate portfolios, evaluate evidence demonstrations, and score competency criteria.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <GlassButton
            variant="secondary"
            icon={<FileCheck size={16} />}
            onClick={() => showToast('Exporting assessment batch summary...', 'info')}
          >
            Export Batch Audit
          </GlassButton>
          <GlassButton
            variant="primary"
            icon={<Award size={16} />}
            onClick={() => handleEvaluate('cand-001')}
          >
            Assess Next Candidate
          </GlassButton>
        </div>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <GlassStatCard
          icon={<Clock size={22} />}
          label="Pending Assessments"
          value="14"
          trendText="Action Required"
          trendPositive={false}
          subtext="New portfolios submitted"
          accentColor="#123B5D"
        />

        <GlassStatCard
          icon={<Users size={22} />}
          label="In Progress"
          value="8"
          trendText="Under Scoring"
          trendPositive
          subtext="Scoring panels active"
          accentColor="#4DA3D9"
        />

        <GlassStatCard
          icon={<CheckCircle2 size={22} />}
          label="Completed"
          value="42"
          trendText="+12 this week"
          trendPositive
          subtext="NSQF certifications certified"
          accentColor="#059669"
        />

        <GlassStatCard
          icon={<AlertCircle size={22} />}
          label="Needs Review"
          value="5"
          trendText="Clarification Sent"
          trendPositive={false}
          subtext="Awaiting candidate reply"
          accentColor="#D97706"
        />
      </div>

      {/* Candidate Table Section */}
      <GlassCard
        variant="elevated"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Table Controls: Search & Filter */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <Search
              size={16}
              color="#7E97AD"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search candidate name, ID, or trade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '36px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Status Filter:
            </span>
            {['All', 'Pending Review', 'In Progress', 'Completed', 'Needs Review'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: statusFilter === st ? 700 : 500,
                  background: statusFilter === st ? 'var(--color-secondary-soft)' : 'rgba(255, 255, 255, 0.7)',
                  color: statusFilter === st ? 'var(--color-primary-navy)' : 'var(--color-text-secondary)',
                  border: statusFilter === st ? '1px solid var(--color-secondary-sky)' : '1px solid rgba(18, 59, 93, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Table with Glass Headers */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0 8px',
              fontSize: '13.5px',
              textAlign: 'left',
              minWidth: '780px'
            }}
          >
            <thead>
              <tr
                style={{
                  background: 'rgba(18, 59, 93, 0.04)',
                  borderRadius: '10px'
                }}
              >
                <th style={{ padding: '12px 16px', color: 'var(--color-primary-navy)', fontWeight: 700, borderRadius: '10px 0 0 10px' }}>
                  Candidate
                </th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary-navy)', fontWeight: 700 }}>
                  Trade & Level
                </th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary-navy)', fontWeight: 700 }}>
                  Experience
                </th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary-navy)', fontWeight: 700 }}>
                  Evidence Count
                </th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary-navy)', fontWeight: 700 }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', color: 'var(--color-primary-navy)', fontWeight: 700, textAlign: 'right', borderRadius: '0 10px 10px 0' }}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredCandidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    boxShadow: '0 1px 3px rgba(11, 41, 66, 0.03)',
                    transition: 'all 0.16s ease'
                  }}
                  className="table-row-hover"
                >
                  {/* Candidate Name & Initials */}
                  <td style={{ padding: '14px 16px', borderRadius: '12px 0 0 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #123B5D 0%, #4DA3D9 100%)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 5px rgba(18, 59, 93, 0.15)',
                          flexShrink: 0
                        }}
                      >
                        {candidate.avatarInitials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                          {candidate.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
                          {candidate.applicationId} · {candidate.location}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Trade */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-primary-navy)' }}>
                      {candidate.trade}
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--color-accent-teal)', fontWeight: 600 }}>
                      NSQF Level {candidate.nsqfLevel}
                    </div>
                  </td>

                  {/* Experience */}
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    {candidate.experience}
                  </td>

                  {/* Evidence Count */}
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        background: 'rgba(223, 242, 255, 0.7)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--color-primary-navy)'
                      }}
                    >
                      {candidate.evidenceCount} Artifacts
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 16px' }}>
                    {getStatusBadge(candidate.assessmentStatus)}
                  </td>

                  {/* Action */}
                  <td style={{ padding: '14px 16px', textAlign: 'right', borderRadius: '0 12px 12px 0' }}>
                    <GlassButton
                      size="sm"
                      variant="primary"
                      onClick={() => handleEvaluate(candidate.id)}
                      icon={<ChevronRight size={14} />}
                      iconPosition="right"
                    >
                      Evaluate
                    </GlassButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
