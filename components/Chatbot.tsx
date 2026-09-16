'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  ShoppingBag,
  Truck,
  RotateCcw,
  Ruler,
  CreditCard,
  Headphones,
  Package,
  Mail,
  ChevronRight,
  Heart,
} from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1] as const;

const PALETTE = {
  cream: '#FDF6E3',
  creamDeep: '#F5E6C8',
  teal: '#0F766E',
  tealSoft: '#E6F4F1',
  coral: '#F4713A',
  ink: '#1c130d',
  muted: '#6f6248',
  mutedLight: '#948362',
};

interface QuickReply {
  label: string;
  action: string;
  icon?: string;
}

interface Message {
  id: string;
  role: 'bot' | 'user';
  text: string;
  quickReplies?: QuickReply[];
  timestamp: number;
}

const ICON_MAP: Record<string, any> = {
  shipping: Truck,
  returns: RotateCcw,
  size: Ruler,
  browse: ShoppingBag,
  payment: CreditCard,
  contact: Headphones,
  tracking: Package,
  email: Mail,
  whatsapp: MessageCircle,
  new: Sparkles,
  sale: Heart,
  thanks: Sparkles,
  arrow: ChevronRight,
};

type Intent = {
  id: string;
  keywords: string[];
  response: string;
  quickReplies?: QuickReply[];
};

const INTENTS: Intent[] = [
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'salam', 'assalam', 'asalam', 'aoa'],
    response:
      "Hello! Welcome to Tiny Soul. I'm here to help you with anything you need. What would you like to know?",
    quickReplies: [
      { label: 'Shipping info', action: 'shipping', icon: 'shipping' },
      { label: 'Returns', action: 'returns', icon: 'returns' },
      { label: 'Size guide', action: 'size', icon: 'size' },
      { label: 'Browse products', action: 'browse', icon: 'browse' },
    ],
  },
  {
    id: 'shipping',
    keywords: [
      'shipping',
      'delivery',
      'deliver',
      'ship',
      'courier',
      'how long',
      'when will',
      'kitna time',
      'kitne din',
    ],
    response:
      "Shipping Info\n\n• Free shipping on orders over Rs 5,000\n• Standard delivery: 2-4 working days across Pakistan\n• Orders placed before 2 PM ship the same day\n• You'll receive tracking details once dispatched",
    quickReplies: [
      { label: 'Returns policy', action: 'returns', icon: 'returns' },
      { label: 'Payment methods', action: 'payment', icon: 'payment' },
      { label: 'Contact us', action: 'contact', icon: 'contact' },
    ],
  },
  {
    id: 'returns',
    keywords: [
      'return',
      'refund',
      'exchange',
      'money back',
      'wapas',
      'replace',
    ],
    response:
      "Returns & Exchanges\n\n• 7-day easy returns from delivery date\n• Items must be unworn, unwashed, with original tags\n• Free exchanges for size issues (subject to availability)\n• Refunds processed within 5-7 working days\n\nTo start a return, WhatsApp us at +92 302 4380139.",
    quickReplies: [
      { label: 'Contact for return', action: 'contact', icon: 'contact' },
      { label: 'Shipping info', action: 'shipping', icon: 'shipping' },
    ],
  },
  {
    id: 'size',
    keywords: [
      'size',
      'sizing',
      'fit',
      'measure',
      'chart',
      'age',
      'years',
      'saiz',
    ],
    response:
      "Size Guide\n\nWe stock sizes from 2-3 years up to 15-16 years.\n\n• 2-3 years: chest 12.5\"\n• 3-4 years: chest 13\"\n• 5-6 years: chest 14\"\n• 7-8 years: chest 14.5\"\n• 9-10 years: chest 15\"\n\nEvery product page has a full size chart button — tap it to see exact measurements.",
    quickReplies: [
      { label: 'Shop by size', action: 'browse', icon: 'browse' },
      { label: 'Ask about product', action: 'contact', icon: 'contact' },
    ],
  },
  {
    id: 'payment',
    keywords: [
      'payment',
      'pay',
      'card',
      'cash',
      'cod',
      'cod on delivery',
      'easypaisa',
      'jazzcash',
      'bank',
      'transfer',
    ],
    response:
      "Payment Methods\n\n• Cash on Delivery (COD) — available across Pakistan\n• Bank Transfer / IBAN\n• EasyPaisa / JazzCash\n\nYou'll confirm your payment preference when we contact you after you place the order.",
    quickReplies: [
      { label: 'Shipping info', action: 'shipping', icon: 'shipping' },
      { label: 'Browse products', action: 'browse', icon: 'browse' },
    ],
  },
  {
    id: 'tracking',
    keywords: [
      'track',
      'tracking',
      'order status',
      'where is',
      'kahan',
      'order number',
    ],
    response:
      "Order Tracking\n\nOnce your order ships, we send tracking details via SMS and WhatsApp. If you haven't received them yet, please share your order number and we'll look it up.\n\nYou can also WhatsApp us at +92 302 4380139.",
    quickReplies: [
      { label: 'Contact support', action: 'contact', icon: 'contact' },
    ],
  },
  {
    id: 'browse',
    keywords: [
      'product',
      'products',
      'shop',
      'browse',
      'catalog',
      'collection',
      'buy',
      'clothes',
      'dress',
      'suit',
    ],
    response:
      "Explore Our Collection\n\nWe have premium kids wear for every occasion:\n\n• Festive & Eid collections\n• Everyday printed suits\n• Boys winter tracksuits\n• Girls embroidered frocks\n\nTap below to browse.",
    quickReplies: [
      { label: 'New arrivals', action: 'new-arrivals', icon: 'new' },
      { label: 'Sale items', action: 'sale', icon: 'sale' },
      { label: 'Summer', action: 'summer', icon: 'browse' },
      { label: 'Winter', action: 'winter', icon: 'browse' },
    ],
  },
  {
    id: 'contact',
    keywords: [
      'contact',
      'whatsapp',
      'phone',
      'call',
      'email',
      'reach',
      'number',
      'help',
      'support',
    ],
    response:
      "Get in Touch\n\n• WhatsApp: +92 302 4380139\n• Phone: +92 302 4380139\n• Email: info@tinysoul.pk\n• Hours: Mon-Sat, 10 AM - 8 PM\n\nWe usually reply within minutes during business hours.",
    quickReplies: [
      { label: 'Open WhatsApp', action: 'whatsapp', icon: 'whatsapp' },
      { label: 'Send email', action: 'email', icon: 'email' },
    ],
  },
  {
    id: 'thanks',
    keywords: ['thank', 'thanks', 'shukriya', 'jazak', 'great', 'awesome'],
    response: "You're welcome! Anything else I can help with?",
    quickReplies: [
      { label: 'Browse products', action: 'browse', icon: 'browse' },
      { label: 'Shipping info', action: 'shipping', icon: 'shipping' },
    ],
  },
  {
    id: 'bye',
    keywords: ['bye', 'goodbye', 'khuda hafiz', 'see you'],
    response:
      'Thanks for visiting Tiny Soul! Come back anytime. Happy shopping!',
  },
];

function matchIntent(input: string): Intent | null {
  const text = input.toLowerCase().trim();
  if (!text) return null;

  let best: { intent: Intent; score: number } | null = null;

  for (const intent of INTENTS) {
    let score = 0;
    for (const keyword of intent.keywords) {
      if (text.includes(keyword)) {
        score += keyword.length;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { intent, score };
    }
  }

  return best ? best.intent : null;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Greeting on first open
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(
            "Hi there! I'm Tiny, your shopping assistant. How can I help you today?",
            [
              { label: 'Shipping info', action: 'shipping', icon: 'shipping' },
              { label: 'Returns', action: 'returns', icon: 'returns' },
              { label: 'Size guide', action: 'size', icon: 'size' },
              { label: 'Browse products', action: 'browse', icon: 'browse' },
            ]
          );
        }, 700);
      }, 300);
    }
  }, [isOpen, hasOpened]);

  // Focus input when window opens
  useEffect(() => {
    if (isOpen && hasOpened) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen, hasOpened]);

  // ═══ CLOSE ON OUTSIDE CLICK ═══
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Ignore clicks inside the chat window
      if (chatWindowRef.current && chatWindowRef.current.contains(target)) {
        return;
      }
      // Ignore clicks on the bubble button (it toggles open/close itself)
      if (bubbleRef.current && bubbleRef.current.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    // Add listener on next tick so the opening click doesn't instantly close it
    const id = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ═══ ESC KEY CLOSES CHAT ═══
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const addBotMessage = (text: string, quickReplies?: QuickReply[]) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}-${Math.random()}`,
        role: 'bot',
        text,
        quickReplies,
        timestamp: Date.now(),
      },
    ]);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}-${Math.random()}`,
        role: 'user',
        text,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleQuickReply = (action: string) => {
    if (action === 'whatsapp') {
      window.open('https://wa.me/923024380139', '_blank');
      addUserMessage('Open WhatsApp');
      setTimeout(() => {
        addBotMessage(
          "Opening WhatsApp for you! If it doesn't open, tap this link: wa.me/923024380139"
        );
      }, 300);
      return;
    }

    if (action === 'email') {
      window.location.href = 'mailto:info@tinysoul.pk';
      addUserMessage('Send email');
      setTimeout(() => {
        addBotMessage('Opening your email app now.');
      }, 300);
      return;
    }

    if (['new-arrivals', 'sale', 'summer', 'winter'].includes(action)) {
      addUserMessage('Show me');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(
          `Great choice! Let me take you to our ${action.replace(
            '-',
            ' '
          )} collection.`,
          [{ label: 'Open page', action: `navigate:${action}`, icon: 'arrow' }]
        );
      }, 600);
      return;
    }

    const intent = INTENTS.find((i) => i.id === action);
    if (intent) {
      addUserMessage(intent.id.charAt(0).toUpperCase() + intent.id.slice(1));
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(intent.response, intent.quickReplies);
      }, 600);
    }
  };

  const handleNavigate = (path: string) => {
    const routes: Record<string, string> = {
      'new-arrivals': '/products/new-arrivals',
      sale: '/products/sale',
      summer: '/products/summer',
      winter: '/products/winter',
    };
    const url = routes[path];
    if (url) {
      window.location.href = url;
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    addUserMessage(text);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const intent = matchIntent(text);

      if (intent) {
        addBotMessage(intent.response, intent.quickReplies);
      } else {
        addBotMessage(
          "I'm not sure I understood that. I can help with shipping, returns, sizing, payment, and browsing products. Or you can reach us on WhatsApp at +92 302 4380139.",
          [
            { label: 'Shipping', action: 'shipping', icon: 'shipping' },
            { label: 'Returns', action: 'returns', icon: 'returns' },
            { label: 'Sizes', action: 'size', icon: 'size' },
            { label: 'WhatsApp us', action: 'whatsapp', icon: 'whatsapp' },
          ]
        );
      }
    }, 700);
  };

  return (
    <>
      {/* ═══ CHAT WINDOW ═══ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] h-[560px] max-h-[80vh] rounded-3xl overflow-hidden shadow-[0_24px_60px_-15px_rgba(28,19,13,0.35)] flex flex-col"
            style={{
              backgroundColor: PALETTE.cream,
              border: `1px solid ${PALETTE.creamDeep}`,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3.5 shrink-0"
              style={{ backgroundColor: PALETTE.teal }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                  style={{ backgroundColor: PALETTE.cream }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: PALETTE.teal }} />
                </div>
                <div>
                  <div
                    className="text-sm font-black uppercase tracking-widest"
                    style={{ color: PALETTE.cream }}
                  >
                    Tiny Soul
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-300" />
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: PALETTE.tealSoft }}
                    >
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="p-2 rounded-full transition-colors hover:bg-white/15 active:scale-95"
              >
                <X className="w-5 h-5" style={{ color: PALETTE.cream }} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                    }`}
                    style={{
                      backgroundColor:
                        msg.role === 'user' ? PALETTE.teal : '#FFFFFF',
                      color:
                        msg.role === 'user' ? PALETTE.cream : PALETTE.ink,
                      border:
                        msg.role === 'bot'
                          ? `1px solid ${PALETTE.creamDeep}`
                          : 'none',
                    }}
                  >
                    {msg.text}

                    {msg.role === 'bot' &&
                      msg.quickReplies &&
                      msg.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5 -mb-0.5">
                          {msg.quickReplies.map((qr, i) => {
                            const Icon = qr.icon ? ICON_MAP[qr.icon] : null;
                            const isNavigate = qr.action.startsWith('navigate:');
                            return (
                              <button
                                key={i}
                                onClick={() =>
                                  isNavigate
                                    ? handleNavigate(
                                        qr.action.replace('navigate:', '')
                                      )
                                    : handleQuickReply(qr.action)
                                }
                                className="text-[11px] font-bold px-2.5 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                                style={{
                                  backgroundColor: PALETTE.tealSoft,
                                  color: PALETTE.teal,
                                  border: `1px solid ${PALETTE.teal}30`,
                                }}
                              >
                                {Icon && <Icon className="w-3.5 h-3.5" />}
                                {qr.label}
                                {isNavigate && (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${PALETTE.creamDeep}`,
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: PALETTE.mutedLight }}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 px-3 py-3 shrink-0 border-t"
              style={{
                backgroundColor: PALETTE.cream,
                borderColor: PALETTE.creamDeep,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: `1px solid ${PALETTE.creamDeep}`,
                  color: PALETTE.ink,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = PALETTE.teal;
                  e.target.style.boxShadow = `0 0 0 3px ${PALETTE.teal}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = PALETTE.creamDeep;
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shadow-md"
                style={{ backgroundColor: PALETTE.teal }}
              >
                <Send className="w-4 h-4" style={{ color: PALETTE.cream }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ FLOATING BUBBLE ═══ */}
      <motion.button
        ref={bubbleRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-4 sm:right-6 z-[60] flex items-center justify-center w-14 h-14 rounded-full shadow-[0_16px_40px_-10px_rgba(15,118,110,0.6)]"
        style={{ backgroundColor: PALETTE.teal }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" style={{ color: PALETTE.cream }} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle
                className="w-6 h-6"
                style={{ color: PALETTE.cream }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!isOpen && (
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: PALETTE.teal }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.button>
    </>
  );
}