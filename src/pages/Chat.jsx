import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, RefreshCw } from 'lucide-react';

/* ─────────────────────────────────────────
   FAQ data for each bot
───────────────────────────────────────── */
const BOT_DATA = {
  ops: {
    name: 'Operations Bot',
    emoji: '⚙️',
    color: '#6366f1',
    intro: "Hi! I'm your Operations assistant. Ask me about schedules, maintenance, SOPs, or cleaning procedures.",
    faqs: [
      { q: 'How do I add a schedule event?',     a: 'Go to Operations → Schedule, click "Add Event", fill in the title, date, type, and optional times, then save.' },
      { q: 'What is an SOP?',                    a: 'SOP stands for Standard Operating Procedure — a documented step-by-step guide for a repeatable task. You can manage them under Operations → SOPs.' },
      { q: 'How do I mark an event complete?',   a: 'In the Schedule view, click the checkbox button on the left side of any event row to toggle it done.' },
      { q: 'How do I filter by event type?',     a: 'Use the Upcoming / Past / All filter buttons at the top of the Schedule view to narrow down events.' },
    ],
    keywords: {
      schedule: 'To manage your schedule, navigate to Operations → Schedule. You can add, filter, and mark events done from there.',
      sop:      'SOPs (Standard Operating Procedures) are in Operations → SOPs. You can create, expand, edit, and filter them by category.',
      maintenance: 'Maintenance events can be tracked in the Operations → Schedule view using the "maintenance" event type.',
      cleaning: 'Cleaning procedures can be documented as SOPs under Operations → SOPs with the "cleaning" category.',
    },
  },
  hr: {
    name: 'HR Bot',
    emoji: '👥',
    color: '#0ea5e9',
    intro: "Hi! I'm your HR assistant. Ask me about leave requests, time tracking, tasks, or team announcements.",
    faqs: [
      { q: 'How do I submit a leave request?',   a: 'Navigate to HR → Leave Requests and click "New Request". Fill in the type, start date, end date, and reason, then submit.' },
      { q: 'How do I log my hours?',             a: 'Go to HR → Time Tracking, click "Log Time", enter the date, hours, and description, then save.' },
      { q: 'Where can I see team tasks?',        a: 'Team tasks are under HR → Tasks. You can filter by status (all / pending / done) and create new tasks from there.' },
      { q: 'How do I send a message to a team member?', a: 'Use HR → Messages. Select the recipient, type your message, and hit Send.' },
    ],
    keywords: {
      leave:    'Leave requests are managed under HR → Leave Requests. Submit new requests and track approval status there.',
      time:     'Time entries are logged under HR → Time Tracking. You can log hours and view your activity history.',
      task:     'Team tasks are in HR → Tasks. You can create, assign, filter, and mark tasks as done.',
      message:  'Direct messages to teammates are in HR → Messages. Select a recipient and send your message.',
      announce: 'Company announcements are pinned at the top of HR → Announcements.',
    },
  },
};

/* ─────────────────────────────────────────
   Rule-based response engine
───────────────────────────────────────── */
function getBotResponse(botId, text) {
  const bot = BOT_DATA[botId];
  const lower = text.toLowerCase();

  if (/\b(hi|hello|hey|sup)\b/.test(lower)) return `${bot.emoji} Hey there! ${bot.intro}`;
  if (/\b(thanks|thank you|thx|ty)\b/.test(lower)) return "You're welcome! Let me know if you need anything else.";
  if (/\b(bye|goodbye|cya|see ya)\b/.test(lower)) return 'Take care! Come back any time.';
  if (/\bhelp\b/.test(lower)) return `I can answer questions about ${botId === 'ops' ? 'operations, schedules, and SOPs' : 'HR, leave, time tracking, and tasks'}. Try asking a specific question or click one of the FAQ buttons above.`;

  for (const [kw, reply] of Object.entries(bot.keywords)) {
    if (lower.includes(kw)) return reply;
  }

  const fallbacks = [
    "I don't have a specific answer for that, but you can explore the relevant section in the sidebar.",
    "Good question! That might be in the docs or a feature we're expanding soon.",
    "I'm not sure about that one. Try rephrasing or click a FAQ button for common questions.",
    `This is the ${bot.name}. For best results, ask about ${botId === 'ops' ? 'schedules, SOPs, maintenance, or cleaning' : 'leave requests, time logs, tasks, or messages'}.`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/* ─────────────────────────────────────────
   Chat window component
───────────────────────────────────────── */
function ChatWindow({ botId }) {
  const bot = BOT_DATA[botId];
  const [messages, setMessages] = useState([{ from: 'bot', text: bot.intro }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = (text) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { from: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = getBotResponse(botId, text);
      setTyping(false);
      setMessages(m => [...m, { from: 'bot', text: reply }]);
    }, 700 + Math.random() * 500);
  };

  const reset = () => {
    setMessages([{ from: 'bot', text: bot.intro }]);
    setInput('');
    setTyping(false);
  };

  return (
    <div className="chat-window">
      <div className="chat-header" style={{ borderBottom: `2px solid ${bot.color}` }}>
        <span className="chat-header__emoji">{bot.emoji}</span>
        <span className="chat-header__name" style={{ color: bot.color }}>{bot.name}</span>
        <button className="chat-reset-btn" onClick={reset} title="Reset conversation"><RefreshCw size={15} /></button>
      </div>

      <div className="chat-faqs">
        <span className="chat-faqs__label">Quick questions:</span>
        {bot.faqs.map((faq, i) => (
          <button key={i} className="chat-faq-btn" onClick={() => send(faq.q)}>{faq.q}</button>
        ))}
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg chat-msg--${msg.from}`}>
            <div className="chat-msg__avatar">{msg.from === 'bot' ? bot.emoji : '🧑'}</div>
            <div className="chat-msg__bubble">{msg.text}</div>
          </div>
        ))}
        {typing && (
          <div className="chat-msg chat-msg--bot">
            <div className="chat-msg__avatar">{bot.emoji}</div>
            <div className="chat-msg__bubble chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form className="chat-input-row" onSubmit={e => { e.preventDefault(); send(input); }}>
        <input
          className="chat-input"
          placeholder={`Ask ${bot.name}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="chat-send-btn" style={{ background: bot.color }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────
   Chat portal shell
───────────────────────────────────────── */
export default function Chat() {
  const [activeBot, setActiveBot] = useState('ops');

  return (
    <div className="hr-portal">
      <aside className="hr-portal__sidebar">
        <div className="hr-portal__sidebar-header">
          <h2 className="hr-portal__sidebar-title">Chat</h2>
          <span className="hr-portal__sidebar-subtitle">AI Assistants</span>
        </div>
        <nav className="hr-portal__nav">
          {Object.entries(BOT_DATA).map(([key, bot]) => (
            <button
              key={key}
              className={`hr-portal__nav-link${activeBot === key ? ' hr-portal__nav-link--active' : ''}`}
              onClick={() => setActiveBot(key)}
            >
              <span style={{ fontSize: 18 }}>{bot.emoji}</span>
              {bot.name}
            </button>
          ))}
        </nav>
        <div className="chat-sidebar-info">
          <MessageSquare size={14} />
          Rule-based FAQ bots — no API key required.
        </div>
      </aside>
      <section className="hr-portal__content" style={{ padding: 0 }}>
        <ChatWindow key={activeBot} botId={activeBot} />
      </section>
    </div>
  );
}
