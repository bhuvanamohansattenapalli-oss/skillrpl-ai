import React from 'react';
import { X, MapPin, IndianRupee, CheckCircle, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface JobOpportunitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobOpportunitiesModal: React.FC<JobOpportunitiesModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();

  if (!isOpen) return null;

  const jobs = [
    {
      id: 'j1',
      title: 'Senior Industrial Electrician',
      company: 'Tata Projects Infrastructure',
      location: 'Hyderabad, Telangana',
      salary: '₹28,000 - ₹36,000 / month',
      nsqfLevel: 'NSQF Level 4 Required',
      matchScore: '96% Match',
      type: 'Full-time'
    },
    {
      id: 'j2',
      title: 'Solar PV Maintenance Specialist',
      company: 'Adani Green Energy Ltd',
      location: 'Ahmedabad / Khavda Site',
      salary: '₹32,000 - ₹40,000 / month',
      nsqfLevel: 'NSQF Level 4 Required',
      matchScore: '92% Match',
      type: 'Site Operations'
    },
    {
      id: 'j3',
      title: 'Commercial HVAC Technician',
      company: 'Blue Star Climate Services',
      location: 'Bengaluru, Karnataka',
      salary: '₹25,000 - ₹34,000 / month',
      nsqfLevel: 'NSQF Level 3-4',
      matchScore: '88% Match',
      type: 'Full-time'
    },
    {
      id: 'j4',
      title: 'Automotive Electrical Systems Inspector',
      company: 'Mahindra Auto Works',
      location: 'Pune, Maharashtra',
      salary: '₹30,000 - ₹38,000 / month',
      nsqfLevel: 'NSQF Level 4',
      matchScore: '85% Match',
      type: 'Manufacturing'
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(8, 20, 40, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 24px 60px rgba(7, 25, 55, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(18, 59, 93, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F9FD 100%)'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Employer Network • 2,980 Verified Roles
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f2744', marginTop: '2px' }}>
              Job Matches Based on Your RPL Qualifications
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(18, 59, 93, 0.06)',
              color: '#486581',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content list */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                padding: '16px 20px',
                borderRadius: '16px',
                background: '#FFFFFF',
                border: '1px solid rgba(18, 59, 93, 0.08)',
                boxShadow: '0 2px 8px rgba(11, 41, 66, 0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f2744' }}>{job.title}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#059669'
                    }}
                  >
                    {job.matchScore}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px', fontWeight: 500 }}>
                  {job.company}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#94a3b8" /> {job.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IndianRupee size={13} color="#94a3b8" /> {job.salary}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={13} color="#2563eb" /> {job.nsqfLevel}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  showToast(`Applied for ${job.title} with your RPL credentials!`, 'success');
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: '999px',
                  background: 'linear-gradient(180deg, #1e64db 0%, #0d4ab8 100%)',
                  boxShadow: '0 3px 10px rgba(18, 90, 215, 0.3)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <span>Apply with RPL</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
