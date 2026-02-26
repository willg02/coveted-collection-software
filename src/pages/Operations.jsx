import { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  BookOpen,
  CalendarDays,
} from 'lucide-react';
import api from '../lib/apiClient';

/* ─────────────────────────────────────────
   Schedule View
───────────────────────────────────────── */
const eventTypeColors = {
  maintenance: { bg: '#fff7ed', color: '#c2410c' },
  inspection:  { bg: '#eff6ff', color: '#1d4ed8' },
  cleaning:    { bg: '#f0fdf4', color: '#15803d' },
  admin:       { bg: '#f5f3ff', color: '#6d28d9' },
  other:       { bg: '#f8fafc', color: '#64748b' },
};

function ScheduleView() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('upcoming');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', startTime: '', endTime: '', type: 'maintenance', notes: '' });

  const load = useCallback(() => {
    api.getSchedule().then(setEvents).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const submit = async (e) => {
    e.preventDefault();
    await api.createScheduleEvent(form);
    setForm({ title: '', date: '', startTime: '', endTime: '', type: 'maintenance', notes: '' });
    setShowForm(false);
    load();
  };

  const toggleDone = async (id, done) => {
    await api.updateScheduleEvent(id, { done: !done });
    load();
  };

  const remove = async (id) => {
    await api.deleteScheduleEvent(id);
    load();
  };

  const today = new Date().toISOString().split('T')[0];
  const filtered = events.filter(ev => {
    if (filter === 'upcoming') return ev.date >= today && !ev.done;
    if (filter === 'past')     return ev.date < today || ev.done;
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div className="ops-filter-row">
        {['upcoming', 'past', 'all'].map(f => (
          <button key={f} className={`hr-tasks__filter${filter === f ? ' hr-tasks__filter--active' : ''}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button className="hr-portal__new-btn" style={{ marginLeft: 'auto', marginBottom: 0 }} onClick={() => setShowForm(s => !s)}>
          <Plus size={16} /> Add Event
        </button>
      </div>

      {showForm && (
        <form className="hr-form" onSubmit={submit} style={{ marginBottom: 20 }}>
          <div className="hr-form__row hr-form__row--split">
            <input className="hr-form__input" placeholder="Event title *" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            <select className="hr-form__input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="maintenance">Maintenance</option>
              <option value="inspection">Inspection</option>
              <option value="cleaning">Cleaning</option>
              <option value="admin">Admin</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="hr-form__row hr-form__row--split">
            <input type="date" className="hr-form__input" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
            <input type="time" className="hr-form__input" placeholder="Start time" value={form.startTime}
              onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
            <input type="time" className="hr-form__input" placeholder="End time" value={form.endTime}
              onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
          </div>
          <div className="hr-form__row">
            <input className="hr-form__input" placeholder="Notes (optional)" value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}>
              <Plus size={14} /> Save Event
            </button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {filtered.length === 0 && (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><CalendarDays size={28} /></div>
          <p>No {filter} events.</p>
        </div>
      )}

      <div className="hr-list">
        {filtered.map(ev => {
          const sc = eventTypeColors[ev.type] || eventTypeColors.other;
          const overdue = !ev.done && ev.date < today;
          return (
            <div className={`hr-list__item ops-event${ev.done ? ' ops-event--done' : ''}`} key={ev.id}>
              <button className="ops-check-btn" onClick={() => toggleDone(ev.id, ev.done)}>
                {ev.done ? <Check size={15} /> : <span />}
              </button>
              <div className="hr-list__main">
                <span className="hr-list__name">{ev.title}</span>
                <div className="hr-list__meta">
                  <span className="hr-badge" style={{ background: sc.bg, color: sc.color }}>{ev.type}</span>
                  <span className="hr-badge" style={{ background: '#f1f5f9', color: '#475569' }}>{ev.date}</span>
                  {ev.startTime && <span className="hr-badge" style={{ background: '#f1f5f9', color: '#475569' }}>{ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}</span>}
                  {overdue && <span className="hr-badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>Overdue</span>}
                </div>
              </div>
              <button className="hr-list__delete" onClick={() => remove(ev.id)}><Trash2 size={14} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SOPs View
───────────────────────────────────────── */
const sopCategoryColors = {
  onboarding:  { bg: '#f0fdf4', color: '#15803d' },
  maintenance: { bg: '#fff7ed', color: '#c2410c' },
  cleaning:    { bg: '#eff6ff', color: '#1d4ed8' },
  finance:     { bg: '#fdf4ff', color: '#7e22ce' },
  general:     { bg: '#f8fafc', color: '#475569' },
};

function SOPsView() {
  const [sops, setSOPs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState({});
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'general', content: '' });

  const load = useCallback(() => {
    api.getSOPs().then(setSOPs).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const submit = async (e) => {
    e.preventDefault();
    await api.createSOP(form);
    setForm({ title: '', category: 'general', content: '' });
    setShowForm(false);
    load();
  };

  const saveEdit = async (id) => {
    await api.updateSOP(id, editing);
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this SOP?')) return;
    await api.deleteSOP(id);
    load();
  };

  const categories = ['all', ...new Set(sops.map(s => s.category).filter(Boolean))];
  const filtered = filter === 'all' ? sops : sops.filter(s => s.category === filter);

  return (
    <div>
      <div className="ops-filter-row">
        {categories.map(c => (
          <button key={c} className={`hr-tasks__filter${filter === c ? ' hr-tasks__filter--active' : ''}`}
            onClick={() => setFilter(c)}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
        <button className="hr-portal__new-btn" style={{ marginLeft: 'auto', marginBottom: 0 }} onClick={() => setShowForm(s => !s)}>
          <Plus size={16} /> New SOP
        </button>
      </div>

      {showForm && (
        <form className="hr-form" onSubmit={submit} style={{ marginBottom: 20 }}>
          <div className="hr-form__row hr-form__row--split">
            <input className="hr-form__input" placeholder="SOP title *" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            <select className="hr-form__input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {['general', 'onboarding', 'maintenance', 'cleaning', 'finance'].map(c =>
                <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="hr-form__row">
            <textarea className="hr-form__input" rows={5} placeholder="Content — write the procedure here..."
              value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}>
              <Plus size={14} /> Save SOP
            </button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {filtered.length === 0 && (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><BookOpen size={28} /></div>
          <p>No SOPs found. Add your first procedure above.</p>
        </div>
      )}

      <div className="hr-list">
        {filtered.map(sop => {
          const sc = sopCategoryColors[sop.category] || sopCategoryColors.general;
          const isExpanded = !!expanded[sop.id];
          return (
            <div className="hr-list__item" key={sop.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="ops-check-btn ops-check-btn--expand" onClick={() => setExpanded(p => ({ ...p, [sop.id]: !p[sop.id] }))}>
                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>
                <div className="hr-list__main">
                  <span className="hr-list__name">{sop.title}</span>
                  <div className="hr-list__meta">
                    <span className="hr-badge" style={{ background: sc.bg, color: sc.color }}>{sop.category}</span>
                    <span className="hr-badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                      {new Date(sop.updatedAt || sop.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button className="hr-form__cancel" style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={() => setEditing(editing?.id === sop.id ? null : { id: sop.id, title: sop.title, category: sop.category, content: sop.content || '' })}>
                  Edit
                </button>
                <button className="hr-list__delete" onClick={() => remove(sop.id)}><Trash2 size={14} /></button>
              </div>

              {editing?.id === sop.id ? (
                <div className="ops-sop-content">
                  <div className="hr-form__row hr-form__row--split">
                    <input className="hr-form__input" value={editing.title}
                      onChange={e => setEditing(p => ({ ...p, title: e.target.value }))} />
                    <select className="hr-form__input" value={editing.category}
                      onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}>
                      {['general', 'onboarding', 'maintenance', 'cleaning', 'finance'].map(c =>
                        <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <textarea className="hr-form__input" rows={6} value={editing.content}
                    onChange={e => setEditing(p => ({ ...p, content: e.target.value }))} />
                  <div className="hr-form__actions">
                    <button type="button" className="hr-portal__new-btn" style={{ marginBottom: 0 }} onClick={() => saveEdit(sop.id)}>
                      <Check size={14} /> Save
                    </button>
                    <button type="button" className="hr-form__cancel" onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              ) : isExpanded && (
                <pre className="ops-sop-pre">{sop.content || '(No content yet — click Edit to add.)'}</pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   View registry & Operations portal shell
───────────────────────────────────────── */
const views = {
  schedule: { label: 'Schedule', icon: CalendarDays, component: ScheduleView },
  sops:     { label: 'SOPs',     icon: BookOpen,     component: SOPsView },
};

export default function Operations() {
  const [activeView, setActiveView] = useState('schedule');
  const ActiveComponent = views[activeView].component;

  return (
    <div className="hr-portal">
      <aside className="hr-portal__sidebar">
        <div className="hr-portal__sidebar-header">
          <h2 className="hr-portal__sidebar-title">Operations</h2>
          <span className="hr-portal__sidebar-subtitle">Schedules &amp; Procedures</span>
        </div>
        <nav className="hr-portal__nav">
          {Object.entries(views).map(([key, v]) => {
            const Icon = v.icon;
            return (
              <button
                key={key}
                className={`hr-portal__nav-link${activeView === key ? ' hr-portal__nav-link--active' : ''}`}
                onClick={() => setActiveView(key)}
              >
                <Icon size={18} />
                {v.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <section className="hr-portal__content">
        <ActiveComponent />
      </section>
    </div>
  );
}
