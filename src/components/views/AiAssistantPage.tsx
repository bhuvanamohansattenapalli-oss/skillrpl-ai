import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  Paperclip,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { useApp } from '../../context/AppContext';
import type { ChatMessage } from '../../types';

// Initial suggestion cards
const SUGGESTION_CARDS = [
  {
    title: 'What is RPL?',
    desc: 'Learn about Recognition of Prior Learning and NSQF framework standards.'
  },
  {
    title: 'How does the RPL assessment work?',
    desc: 'Understand the 4 key stages from self-declaration to assessor review.'
  },
  {
    title: 'What evidence should I provide?',
    desc: 'Discover practical proof tips: photos, videos, and employer letters.'
  },
  {
    title: 'How should I describe my work experience?',
    desc: 'Techniques to highlight personal tasks, tools, and safety protocols.'
  },
  {
    title: 'What skills can I demonstrate?',
    desc: 'Explore trade-specific competencies for Industrial Electricians.'
  },
  {
    title: 'How can I prepare for my assessment?',
    desc: 'Checklist for practical task execution and safety verification.'
  }
];

// Quick actions below input
const QUICK_ACTIONS = [
  'Understand RPL',
  'Analyze My Experience',
  'Prepare My Evidence',
  'Prepare for Assessment'
];

export const AiAssistantPage: React.FC = () => {
  const { setCurrentView, showToast, candidate } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Click outside to close attachment menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(e.target as Node)) {
        setIsAttachmentMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format current timestamp
  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  // Query server health to verify backend connectivity
  const [isGeminiReady, setIsGeminiReady] = useState(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.status === 'ok') {
          setIsGeminiReady(Boolean(data.geminiConfigured));
        }
      })
      .catch((err) => {
        console.warn('Backend health check error:', err);
      });
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputValue).trim();
    if (!text || isTyping) return;

    // 1. Add User Message immediately
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: getTimestamp()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // 2. Prepare conversation history for multi-turn Gemini reasoning
      const historyPayload = messages.slice(-10).map((msg) => ({
        role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.text
      }));

      // 3. Call server-side API route: POST /api/ai/chat
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          history: historyPayload
        })
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        // In case of non-JSON response from server
      }

      if (response.ok && data && data.success && data.message) {
        // 4. Add AI Response from real Gemini backend
        const aiMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          text: data.message,
          timestamp: getTimestamp()
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const statusCode = data?.status || response.status;
        let errorMessage = data?.error;

        if (statusCode === 429) {
          errorMessage = 'AI request limit reached. Please wait a moment and try again.';
        } else if (statusCode === 401 || statusCode === 403) {
          errorMessage = 'AI service authentication failed. Please check the server configuration.';
        } else if (statusCode === 404) {
          errorMessage = 'Configured AI model is currently unavailable.';
        } else if (!errorMessage) {
          errorMessage = 'AI Assistant is temporarily unavailable. Please try again.';
        }

        const aiMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          text: errorMessage,
          timestamp: getTimestamp()
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error('Chat request failed:', error);
      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      const networkMsg = isOffline
        ? 'Network connection error. Please check your internet connection and try again.'
        : 'AI Assistant is temporarily unavailable. Please try again.';
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: networkMsg,
        timestamp: getTimestamp()
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      // 5. Remove typing indicator
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 130)}px`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Message copied to clipboard.', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    showToast('Conversation cleared.', 'info');
  };

  // Render text with basic markdown styling (bold & bullets)
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Bold rendering
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: 'var(--color-primary-navy)' }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx}>{part.slice(1, -1)}</em>;
        }
        return part;
      });

      if (line.trim().startsWith('•') || line.trim().startsWith('✓')) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', marginTop: '4px', paddingLeft: '4px' }}>
            <span style={{ color: line.trim().startsWith('✓') ? 'var(--color-accent-teal)' : 'var(--color-secondary-sky)', fontWeight: 700 }}>
              {line.trim().charAt(0)}
            </span>
            <span>{formattedParts}</span>
          </div>
        );
      }

      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={idx} style={{ marginTop: '5px', paddingLeft: '4px' }}>
            {formattedParts}
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} style={{ height: '8px' }} />;
      }

      return (
        <p key={idx} style={{ margin: '4px 0', lineHeight: 1.55 }}>
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }} className="animate-fade-in">
      {/* ==================================================
          PAGE HEADER
          ================================================== */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--color-primary-navy)',
                letterSpacing: '-0.02em',
                margin: 0
              }}
            >
              RPL AI Assistant
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(37, 167, 160, 0.15)',
                color: 'var(--color-accent-teal)',
                border: '1px solid rgba(37, 167, 160, 0.3)'
              }}
            >
              {isGeminiReady ? 'GEMINI POWERED' : 'OFFLINE MODE'}
            </span>
          </div>
          <p
            style={{
              fontSize: '14.5px',
              color: 'var(--color-text-secondary)',
              marginTop: '4px',
              margin: 0
            }}
          >
            Your AI-powered guide for Recognition of Prior Learning.
          </p>
        </div>

        {/* Right Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(37, 167, 160, 0.3)',
            boxShadow: '0 2px 8px rgba(11, 41, 66, 0.04)'
          }}
        >
          <span
            style={{
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: 'var(--color-accent-teal)',
              boxShadow: '0 0 8px rgba(37, 167, 160, 0.7)'
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
            AI Assistant
          </span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent-teal)' }}>
            Ready
          </span>
        </div>
      </div>

      {/* ==================================================
          MAIN TWO-COLUMN LAYOUT (Chat on Left, Info on Right)
          ================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '22px',
          alignItems: 'start'
        }}
        className="ai-assistant-grid"
      >
        {/* ==================================================
            LEFT: CENTRAL CHAT CONTAINER
            ================================================== */}
        <GlassCard
          variant="elevated"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '720px',
            padding: 0,
            overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 250, 255, 0.9) 100%)',
            border: '1px solid rgba(77, 163, 217, 0.35)',
            boxShadow: '0 12px 36px rgba(11, 41, 66, 0.07)'
          }}
        >
          {/* Chat Container Header */}
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(18, 59, 93, 0.08)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 248, 255, 0.75) 100%)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Brand AI Avatar */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
                  border: '1px solid rgba(77, 163, 217, 0.45)',
                  boxShadow: '0 3px 8px rgba(18, 59, 93, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8'
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-primary-navy)' }}>
                  RPL AI Assistant
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Trained on RPL Guidelines & NSQF Standards (Demo)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setCurrentView('ai-analysis')}
                title="Open AI Skill Analysis Engine"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0284c7',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '5px 11px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Cpu size={13} />
                <span>AI Skill Analysis</span>
              </button>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  title="Clear conversation"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    background: 'rgba(18, 59, 93, 0.05)',
                    border: '1px solid rgba(18, 59, 93, 0.1)',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Clear</span>
                </button>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-teal)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                  Ready
                </span>
              </div>
            </div>
          </div>

          {/* Messages Viewport */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* ==================================================
                WELCOME / EMPTY STATE
                ================================================== */}
            {messages.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  margin: 'auto 0',
                  padding: '24px 12px'
                }}
              >
                {/* Large Brand Avatar Emblem */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
                    border: '1.5px solid rgba(77, 163, 217, 0.5)',
                    boxShadow: '0 8px 24px rgba(18, 59, 93, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                    marginBottom: '16px'
                  }}
                >
                  <Sparkles size={30} />
                </div>

                <h2 style={{ fontSize: '21px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                  How can I help with your RPL journey?
                </h2>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                    maxWidth: '520px',
                    marginTop: '8px',
                    lineHeight: 1.5
                  }}
                >
                  I can help you understand RPL, prepare your self-declaration, organize evidence, and prepare for assessment.
                </p>

                {/* Suggestion Cards Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                    gap: '10px',
                    width: '100%',
                    maxWidth: '640px',
                    marginTop: '24px'
                  }}
                >
                  {SUGGESTION_CARDS.map((card, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(card.title)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.85)',
                        border: '1px solid rgba(77, 163, 217, 0.28)',
                        boxShadow: '0 2px 8px rgba(11, 41, 66, 0.03)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        transition: 'all 0.16s ease'
                      }}
                      className="suggestion-card-btn"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                          {card.title}
                        </span>
                        <ArrowRight size={13} color="var(--color-secondary-sky)" style={{ flexShrink: 0 }} />
                      </div>
                      <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                        {card.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Active Conversation Messages */
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: isUser ? 'row-reverse' : 'row',
                      gap: '12px',
                      alignItems: 'flex-start',
                      width: '100%'
                    }}
                    className="chat-message-row"
                  >
                    {/* Small Avatar for AI */}
                    {!isUser && (
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
                          border: '1px solid rgba(77, 163, 217, 0.4)',
                          boxShadow: '0 2px 6px rgba(18, 59, 93, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#38bdf8',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}
                      >
                        <Sparkles size={16} />
                      </div>
                    )}

                    {/* Message Card Body */}
                    <div
                      style={{
                        maxWidth: '82%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          padding: '14px 18px',
                          borderRadius: '16px',
                          fontSize: '13.5px',
                          lineHeight: 1.55,
                          background: isUser
                            ? 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)'
                            : 'rgba(255, 255, 255, 0.92)',
                          color: isUser ? '#FFFFFF' : 'var(--color-primary-navy)',
                          border: isUser
                            ? '1px solid rgba(77, 163, 217, 0.3)'
                            : '1px solid rgba(77, 163, 217, 0.28)',
                          boxShadow: isUser
                            ? '0 4px 14px rgba(18, 59, 93, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.18)'
                            : '0 4px 14px rgba(11, 41, 66, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                          wordBreak: 'break-word',
                          position: 'relative'
                        }}
                      >
                        {isUser ? (
                          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                        ) : (
                          <div>{renderFormattedText(msg.text)}</div>
                        )}

                        {/* Optional Attached Quick Link in AI Response */}
                        {!isUser && msg.actionLink && (
                          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(18, 59, 93, 0.08)' }}>
                            <button
                              type="button"
                              onClick={() => setCurrentView(msg.actionLink!.view)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: 'var(--color-secondary-sky)',
                                background: 'rgba(77, 163, 217, 0.12)',
                                border: '1px solid rgba(77, 163, 217, 0.3)',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              <span>{msg.actionLink.label}</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Timestamp & Copy Action */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '4px',
                          padding: '0 4px',
                          fontSize: '11px',
                          color: 'var(--color-text-muted)'
                        }}
                      >
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(msg.text, msg.id)}
                            title="Copy response"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: '2px'
                            }}
                          >
                            {copiedId === msg.id ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing State Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
                    border: '1px solid rgba(77, 163, 217, 0.4)',
                    boxShadow: '0 2px 6px rgba(18, 59, 93, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                    flexShrink: 0
                  }}
                  className="avatar-pulse"
                >
                  <Sparkles size={16} />
                </div>

                <div
                  style={{
                    padding: '12px 18px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(77, 163, 217, 0.28)',
                    boxShadow: '0 2px 8px rgba(11, 41, 66, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', fontWeight: 500, marginRight: '4px' }}>
                    RPL AI Assistant is thinking
                  </span>
                  <span className="typing-dot" style={{ animationDelay: '0ms' }} />
                  <span className="typing-dot" style={{ animationDelay: '200ms' }} />
                  <span className="typing-dot" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ==================================================
              CHAT INPUT AREA
              ================================================== */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid rgba(18, 59, 93, 0.08)',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, #FFFFFF 100%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Input Row */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '14px',
                background: 'rgba(248, 251, 253, 0.95)',
                border: '1px solid rgba(18, 59, 93, 0.16)',
                boxShadow: 'inset 0 2px 5px rgba(11, 41, 66, 0.05)',
                transition: 'border-color 0.15s ease'
              }}
            >
              {/* Attachment '+' Button */}
              <div style={{ position: 'relative' }} ref={attachmentMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                  title="Attach file or evidence"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isAttachmentMenuOpen ? 'var(--color-primary-navy)' : 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(18, 59, 93, 0.15)',
                    color: isAttachmentMenuOpen ? '#FFFFFF' : 'var(--color-primary-navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 5px rgba(11, 41, 66, 0.04)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Plus size={18} />
                </button>

                {/* Popover Options Menu */}
                {isAttachmentMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '46px',
                      left: 0,
                      width: '180px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.98)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(77, 163, 217, 0.35)',
                      boxShadow: '0 8px 24px rgba(11, 41, 66, 0.15)',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      zIndex: 60
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsAttachmentMenuOpen(false);
                        setCurrentView('evidence');
                        showToast('Navigating to Evidence Repository.', 'info');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: 'var(--color-primary-navy)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      className="attachment-menu-item"
                    >
                      <Paperclip size={14} color="var(--color-accent-teal)" />
                      <span>Attach Evidence</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAttachmentMenuOpen(false);
                        showToast('Document selector placeholder simulated.', 'info');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: 'var(--color-primary-navy)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      className="attachment-menu-item"
                    >
                      <FileText size={14} color="var(--color-secondary-sky)" />
                      <span>Upload Document</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAttachmentMenuOpen(false);
                        showToast('Image attachment placeholder simulated.', 'info');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        color: 'var(--color-primary-navy)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      className="attachment-menu-item"
                    >
                      <ImageIcon size={14} color="#D97706" />
                      <span>Add Image</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your RPL journey..."
                rows={1}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13.5px',
                  lineHeight: 1.45,
                  color: 'var(--color-primary-navy)',
                  resize: 'none',
                  padding: '8px 0',
                  maxHeight: '130px',
                  fontFamily: 'inherit'
                }}
              />

              {/* Send Button with raised physical depth & pressed effect */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: (!inputValue.trim() || isTyping)
                    ? 'rgba(18, 59, 93, 0.2)'
                    : 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  boxShadow: (!inputValue.trim() || isTyping)
                    ? 'none'
                    : '0 4px 12px rgba(18, 59, 93, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: (!inputValue.trim() || isTyping) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="ai-send-btn"
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </div>

            {/* Quick Actions Below Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                Quick:
              </span>
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(action)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    border: '1px solid rgba(77, 163, 217, 0.25)',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: 'var(--color-primary-navy)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 1px 3px rgba(11, 41, 66, 0.03)',
                    transition: 'all 0.15s ease'
                  }}
                  className="quick-action-pill"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* ==================================================
            RIGHT: INFORMATION PANEL & AI CONNECTIONS
            ================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Card 1: What I Can Help With & Important Disclaimer */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '22px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.8) 100%)',
              border: '1px solid rgba(77, 163, 217, 0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #123B5D 0%, #1A5280 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8'
                }}
              >
                <Sparkles size={18} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                RPL Assistant
              </h3>
            </div>

            {/* Section: What I can help with */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-secondary-sky)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                What I can help with
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: 'var(--color-primary-navy)' }}>
                {[
                  'Understanding RPL',
                  'Organizing experience',
                  'Identifying potential skills',
                  'Preparing evidence',
                  'Assessment preparation'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--color-accent-teal)', fontWeight: 800 }}>✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Important Disclaimer */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(18, 59, 93, 0.04)',
                border: '1px solid rgba(18, 59, 93, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-navy)' }}>
                <ShieldCheck size={14} color="var(--color-accent-teal)" />
                <span>Important</span>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', lineHeight: 1.45, margin: 0 }}>
                AI guidance is supportive. Final competency and certification decisions are made through the authorized assessment process.
              </p>
            </div>
          </GlassCard>

          {/* Card 2: AI Skill Analysis Connection */}
          <GlassCard
            variant="elevated"
            style={{
              padding: '22px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(223, 242, 255, 0.5) 100%)',
              border: '1px solid rgba(77, 163, 217, 0.35)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Cpu size={18} color="var(--color-accent-teal)" />
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-primary-navy)', margin: 0 }}>
                AI Skill Analysis
              </h4>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              Once your experience and evidence are submitted, AI-assisted analysis can help identify potential skills and relevant assessment areas.
            </p>

            <GlassButton
              variant="secondary"
              size="sm"
              icon={<ArrowRight size={14} />}
              onClick={() => setCurrentView('ai-analysis')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Go to AI Skill Analysis
            </GlassButton>
          </GlassCard>

          {/* Candidate Context Pill */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.75)',
              border: '1px solid rgba(18, 59, 93, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px'
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>Candidate: </span>
              <strong style={{ color: 'var(--color-primary-navy)' }}>{candidate.name}</strong>
            </div>
            <GlassBadge variant="navy">{candidate.trade}</GlassBadge>
          </div>
        </div>
      </div>

      {/* Embedded Styles for smooth interactions & typing animation */}
      <style>{`
        .suggestion-card-btn:hover {
          background: #FFFFFF !important;
          border-color: var(--color-secondary-sky) !important;
          box-shadow: 0 4px 12px rgba(77, 163, 217, 0.15) !important;
          transform: translateY(-1px);
        }
        .attachment-menu-item:hover {
          background: rgba(223, 242, 255, 0.6) !important;
        }
        .quick-action-pill:hover {
          background: var(--color-primary-navy) !important;
          color: #FFFFFF !important;
          border-color: var(--color-primary-navy) !important;
        }
        .ai-send-btn:active:not(:disabled) {
          transform: scale(0.97);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.25) !important;
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-accent-teal);
          display: inline-block;
          animation: typingPulse 1.2s infinite ease-in-out;
        }
        @keyframes typingPulse {
          0%, 80%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        .avatar-pulse {
          animation: subtlePulse 2s infinite ease-in-out;
        }
        @keyframes subtlePulse {
          0%, 100% {
            box-shadow: 0 2px 6px rgba(18, 59, 93, 0.2);
          }
          50% {
            box-shadow: 0 0 14px rgba(56, 189, 248, 0.45);
          }
        }
        @media (max-width: 960px) {
          .ai-assistant-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
