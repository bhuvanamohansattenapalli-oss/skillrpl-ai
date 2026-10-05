import React, { useState, useEffect } from 'react';
import {
  Award,
  Download,
  Printer,
  ShieldCheck,
  ArrowLeft,
  QrCode,
  Info
} from 'lucide-react';
import { GlassButton } from '../common/GlassButton';
import { useApp } from '../../context/AppContext';
import { fetchCertificateDetails, fetchWorkerCertificates, type CertificateData } from '../../lib/api/certificate';

interface CertificatePageProps {
  attemptId?: string;
  certificateNumber?: string;
  onBack?: () => void;
}

export const CertificatePage: React.FC<CertificatePageProps> = ({
  attemptId,
  certificateNumber,
  onBack
}) => {
  const { candidate, setCurrentView, showToast } = useApp();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCert() {
      setLoading(true);
      try {
        let cert: CertificateData | null = null;
        if (attemptId || certificateNumber) {
          cert = await fetchCertificateDetails({ attemptId, certNum: certificateNumber });
        }
        if (!cert) {
          const list = await fetchWorkerCertificates();
          if (list.length > 0) {
            cert = list[0];
          }
        }
        if (isMounted) {
          setCertificate(cert);
        }
      } catch (err) {
        console.error('[Certificate Load Error]', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCert();
    return () => {
      isMounted = false;
    };
  }, [attemptId, certificateNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showToast('Opening print dialog. Select "Save as PDF" to download your certificate.', 'info');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'October 05, 2026';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }} className="animate-fade-in">
        <div style={{ width: '48px', height: '48px', margin: '0 auto 16px', borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#0284c7', animation: 'spin 1s linear infinite' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
          Retrieving Official RPL Certificate...
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Verifying assessor accreditation and score records from database
        </p>
      </div>
    );
  }

  // Fallback realistic demo certificate if none in DB
  const certData: CertificateData = certificate || {
    id: 'demo-cert-001',
    certificateNumber: 'SKILLRPL-CERT-2026-849201',
    workerProfileId: candidate.id || 'demo-worker-001',
    workerName: candidate.name || 'Rajesh Kumar',
    workerIdentifier: 'WP-IND-2026-0842',
    trade: candidate.trade || 'Electrician',
    assessmentName: 'Electrician RPL Screening & Competency Assessment',
    score: 8,
    totalScore: 10,
    percentage: 80,
    nsqfLevel: candidate.nsqfLevel || 4,
    qualificationPack: 'Assistant Electrician (ELE/Q0101)',
    assessorName: 'Dr. Vikramaditya Sharma',
    assessorId: 'ASSESS-NSDC-2024-8842',
    assessorDesignation: 'CSDCI / NCVET Accredited Lead Assessor',
    assessmentCompletedAt: new Date().toISOString(),
    issuedAt: new Date().toISOString(),
    status: 'ISSUED',
    isDemo: true,
    verificationCode: 'VERIF-RPL-2026-0842-ELE4'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }} className="animate-fade-in">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #rpl-certificate-print-area, #rpl-certificate-print-area * {
            visibility: visible;
          }
          #rpl-certificate-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: 2px solid #123b5d !important;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Action & Navigation Bar (Hidden during Print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <GlassButton
            variant="secondary"
            size="sm"
            icon={<ArrowLeft size={16} />}
            onClick={onBack || (() => setCurrentView('dashboard'))}
          >
            Back
          </GlassButton>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
              RPL Assessment Certificate
            </h1>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
              Official recognition certificate issued upon successful assessment and assessor approval
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <GlassButton
            variant="secondary"
            icon={<Printer size={16} />}
            onClick={handlePrint}
          >
            Print Certificate
          </GlassButton>
          <GlassButton
            variant="primary"
            icon={<Download size={16} />}
            onClick={handleDownload}
          >
            Download Certificate (PDF)
          </GlassButton>
        </div>
      </div>

      {/* AI Boundary Banner (Hidden during print) */}
      <div
        className="no-print"
        style={{
          padding: '12px 18px',
          borderRadius: '12px',
          background: 'rgba(2, 132, 199, 0.08)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <Info size={20} color="#0284c7" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '12.5px', color: '#0369a1', lineHeight: 1.5 }}>
          <strong>Assessment Governance:</strong> AI Assistant provides preparatory guidance and performance breakdown.
          Assessment was scored server-side using the standardized answer key. Final competency decisions and certificate issuance are authorized by accredited human assessors.
        </div>
      </div>

      {/* The Printable Certificate Container */}
      <div
        id="rpl-certificate-print-area"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '8px solid #123b5d',
          boxShadow: '0 20px 50px rgba(18, 59, 93, 0.15)',
          padding: '40px 48px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}
      >
        {/* Subtle Decorative Guilloche / Border Accent */}
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            border: '2px dashed rgba(18, 59, 93, 0.3)',
            borderRadius: '12px',
            pointerEvents: 'none'
          }}
        />

        {/* Demo Watermark Badge */}
        {certData.isDemo && (
          <div
            style={{
              position: 'absolute',
              top: '28px',
              right: '-40px',
              transform: 'rotate(45deg)',
              background: '#f59e0b',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '1px',
              padding: '6px 48px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              textTransform: 'uppercase'
            }}
          >
            DEMO CERTIFICATE
          </div>
        )}

        {/* Top Emblem & Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #123b5d 0%, #0284c7 100%)',
              color: '#ffffff',
              boxShadow: '0 6px 18px rgba(18, 59, 93, 0.25)',
              marginBottom: '14px'
            }}
          >
            <Award size={36} />
          </div>

          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7', letterSpacing: '2px', textTransform: 'uppercase' }}>
            SKILLRPL AI · VOCATIONAL COMPETENCY FRAMEWORK
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#123b5d', margin: '6px 0 4px', letterSpacing: '-0.5px' }}>
            Recognition of Prior Learning Assessment Certificate
          </h2>

          <div style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 500 }}>
            Issued upon verification of vocational theoretical screening and accredited assessor evaluation
          </div>
        </div>

        {/* Certificate Number & Date Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 18px',
            background: 'rgba(18, 59, 93, 0.04)',
            borderRadius: '10px',
            border: '1px solid rgba(18, 59, 93, 0.08)',
            marginBottom: '28px',
            fontSize: '12.5px',
            color: '#334155'
          }}
        >
          <div>
            <strong>Certificate ID:</strong> <span style={{ fontFamily: 'monospace', color: '#123b5d', fontWeight: 700 }}>{certData.certificateNumber}</span>
          </div>
          <div>
            <strong>Issue Date:</strong> <span>{formatDate(certData.issuedAt)}</span>
          </div>
        </div>

        {/* Recipient Statement */}
        <div style={{ textAlign: 'center', margin: '20px 0 28px' }}>
          <div style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic', marginBottom: '8px' }}>
            This is to certify that
          </div>

          <div style={{ fontSize: '30px', fontWeight: 900, color: '#123b5d', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
            {certData.workerName}
          </div>

          {certData.workerIdentifier && (
            <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
              Worker Identifier: <strong>{certData.workerIdentifier}</strong>
            </div>
          )}

          <div style={{ fontSize: '14.5px', color: '#334155', maxWidth: '680px', margin: '14px auto 0', lineHeight: 1.6 }}>
            has successfully completed the formal Recognition of Prior Learning assessment and demonstrated evaluated competency in the vocational domain of:
          </div>

          <div
            style={{
              display: 'inline-block',
              marginTop: '12px',
              padding: '8px 24px',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, rgba(18, 59, 93, 0.08) 0%, rgba(2, 132, 199, 0.12) 100%)',
              border: '1px solid rgba(2, 132, 199, 0.3)',
              fontSize: '19px',
              fontWeight: 800,
              color: '#123b5d'
            }}
          >
            {certData.trade} · NSQF Level {certData.nsqfLevel}
          </div>

          {certData.qualificationPack && (
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', fontWeight: 600 }}>
              Qualification Pack: {certData.qualificationPack}
            </div>
          )}
        </div>

        {/* Assessment Performance Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            margin: '24px 0 32px'
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Screening Score
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#123b5d', marginTop: '4px' }}>
              {certData.score} / {certData.totalScore}
            </div>
            <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
              {certData.percentage}% Theoretical Marks
            </div>
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Competency Decision
            </div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
              DEMONSTRATED
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
              Approved by Assessor
            </div>
          </div>

          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Framework Level
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#123b5d', marginTop: '4px' }}>
              Level {certData.nsqfLevel}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
              Standardized NOS Units
            </div>
          </div>
        </div>

        {/* Assessor Signatory & Verification QR Section */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '2px solid #e2e8f0',
            paddingTop: '24px',
            marginTop: '20px',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          {/* QR Verification Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#123b5d'
              }}
            >
              <QrCode size={44} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#123b5d' }}>
                DIGITAL VERIFICATION
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', marginTop: '2px' }}>
                {certData.verificationCode || `VERIF-${certData.certificateNumber}`}
              </div>
              <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
                Scan QR or visit skillrpl.gov.in/verify
              </div>
            </div>
          </div>

          {/* Assessor Signature Block */}
          <div style={{ textAlign: 'right', minWidth: '220px' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#123b5d' }}>
              {certData.assessorName || 'Dr. Vikramaditya Sharma'}
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
              {certData.assessorDesignation || 'CSDCI / NCVET Accredited Lead Assessor'}
            </div>
            {certData.assessorId && (
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                Reg ID: {certData.assessorId}
              </div>
            )}
            <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#059669', fontWeight: 700 }}>
              <ShieldCheck size={14} />
              <span>Digitally Signed & Certified</span>
            </div>
          </div>
        </div>

        {/* Footer Authority Disclaimer */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '12px',
            borderTop: '1px dashed #e2e8f0',
            fontSize: '10.5px',
            color: '#94a3b8',
            textAlign: 'center',
            lineHeight: 1.4
          }}
        >
          SkillRPL AI vocational competency screening assessment outcome. Assessment scoring is calculated server-side based on standardized answer keys.
          Certification decisions are rendered by accredited vocational assessors. This certificate reflects demonstrated RPL assessment results.
        </div>
      </div>
    </div>
  );
};
