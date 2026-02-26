import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  CalendarDays,
  Clock,
  MonitorPlay,
  Bell as BellIcon,
  CheckSquare,
  TrendingUp,
  User,
  Users,
  GitBranch,
  Bell,
  BarChart3,
  ClipboardList,
  Settings,
  Sparkles,
  Plus,
  Info,
  Send,
  Trash2,
  Play,
  Square,
  X,
  Video,
  Target,
  Check,
  AlertCircle,
} from 'lucide-react';
import api from '../lib/apiClient';
import { useAuth } from '../lib/AuthContext';

/* ═══════════════════════════════════════
   TIER 1 — Functional sub-page views
   ═══════════════════════════════════════ */

/* ── Announcements ── */
function AnnouncementsView() {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const load = useCallback(() => { api.getAnnouncements().then(setItems).catch(() => {}); }, []);
  useEffect(load, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    await api.createAnnouncement({ title, content });
    setTitle(''); setContent(''); setShowForm(false);
    load();
  };

  const remove = async (id) => { await api.deleteAnnouncement(id); load(); };

  return (
    <div>
      {showForm ? (
        <form className="hr-form" onSubmit={submit}>
          <div className="hr-form__row">
            <input className="hr-form__input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="hr-form__row">
            <textarea className="hr-form__textarea" placeholder="Content" value={content} onChange={e => setContent(e.target.value)} rows={4} required />
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn"><Send size={16} /> Publish</button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="hr-portal__new-btn" onClick={() => setShowForm(true)}>
          <Plus size={18} /> New Announcement
        </button>
      )}

      {items.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><Info size={28} /></div>
          <p>No announcements yet</p>
        </div>
      ) : (
        <div className="hr-list">
          {items.map(a => (
            <div className="hr-list__item" key={a.id}>
              <div className="hr-list__item-header">
                <strong>{a.title}</strong>
                <button className="hr-list__delete" onClick={() => remove(a.id)}><Trash2 size={14} /></button>
              </div>
              <p className="hr-list__item-body">{a.content}</p>
              <span className="hr-list__meta">by {a.author?.name} · {new Date(a.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Messages ── */
function MessagesView() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [receiverId, setReceiverId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const load = useCallback(() => { api.getMessages().then(setItems).catch(() => {}); }, []);
  useEffect(() => { load(); api.getAllUsers().then(setUsers).catch(() => {}); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    await api.sendMessage({ subject, content, receiverId });
    setSubject(''); setContent(''); setReceiverId(''); setShowForm(false);
    load();
  };

  const markRead = async (id) => { await api.markRead(id); load(); };
  const remove = async (id) => { await api.deleteMessage(id); load(); };

  const unread = items.filter(m => m.receiverId === user?.id && !m.read).length;

  return (
    <div>
      {showForm ? (
        <form className="hr-form" onSubmit={submit}>
          <div className="hr-form__row">
            <select className="hr-form__input" value={receiverId} onChange={e => setReceiverId(e.target.value)} required>
              <option value="">Select recipient…</option>
              {users.filter(u => u.id !== user?.id).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="hr-form__row">
            <input className="hr-form__input" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>
          <div className="hr-form__row">
            <textarea className="hr-form__textarea" placeholder="Message" value={content} onChange={e => setContent(e.target.value)} rows={4} required />
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn"><Send size={16} /> Send</button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="hr-portal__new-btn" onClick={() => setShowForm(true)}>
          <Plus size={18} /> New Message {unread > 0 && <span className="hr-badge">{unread}</span>}
        </button>
      )}

      {items.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><MessageSquare size={28} /></div>
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="hr-list">
          {items.map(m => (
            <div className={`hr-list__item${!m.read && m.receiverId === user?.id ? ' hr-list__item--unread' : ''}`} key={m.id} onClick={() => !m.read && m.receiverId === user?.id && markRead(m.id)}>
              <div className="hr-list__item-header">
                <strong>{m.subject}</strong>
                <button className="hr-list__delete" onClick={e => { e.stopPropagation(); remove(m.id); }}><Trash2 size={14} /></button>
              </div>
              <p className="hr-list__item-body">{m.content}</p>
              <span className="hr-list__meta">
                {m.senderId === user?.id ? `To: ${m.receiver?.name}` : `From: ${m.sender?.name}`} · {new Date(m.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Leave Requests ── */
function LeaveRequestsView() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState('vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const load = useCallback(() => { api.getLeave().then(setItems).catch(() => {}); }, []);
  useEffect(load, [load]);

  const submit = async (e) => {
    e.preventDefault();
    await api.submitLeave({ type, startDate, endDate, reason });
    setType('vacation'); setStartDate(''); setEndDate(''); setReason(''); setShowForm(false);
    load();
  };

  const review = async (id, status) => { await api.reviewLeave(id, status); load(); };

  const statusColors = { pending: '#f59e0b', approved: '#22c55e', denied: '#ef4444' };

  return (
    <div>
      {showForm ? (
        <form className="hr-form" onSubmit={submit}>
          <div className="hr-form__row">
            <select className="hr-form__input" value={type} onChange={e => setType(e.target.value)}>
              <option value="vacation">Vacation</option>
              <option value="sick">Sick</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="hr-form__row hr-form__row--split">
            <input type="date" className="hr-form__input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            <input type="date" className="hr-form__input" value={endDate} onChange={e => setEndDate(e.target.value)} required />
          </div>
          <div className="hr-form__row">
            <textarea className="hr-form__textarea" placeholder="Reason (optional)" value={reason} onChange={e => setReason(e.target.value)} rows={3} />
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn"><Send size={16} /> Submit Request</button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="hr-portal__new-btn" onClick={() => setShowForm(true)}>
          <Plus size={18} /> New Leave Request
        </button>
      )}

      {items.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><CalendarDays size={28} /></div>
          <p>No leave requests</p>
        </div>
      ) : (
        <div className="hr-list">
          {items.map(lr => (
            <div className="hr-list__item" key={lr.id}>
              <div className="hr-list__item-header">
                <strong style={{ textTransform: 'capitalize' }}>{lr.type} Leave</strong>
                <span className="hr-badge" style={{ background: statusColors[lr.status], color: '#fff' }}>{lr.status}</span>
              </div>
              <p className="hr-list__item-body">
                {lr.startDate} → {lr.endDate}
                {lr.reason && <><br />{lr.reason}</>}
              </p>
              <span className="hr-list__meta">
                {lr.user?.name} · {new Date(lr.createdAt).toLocaleDateString()}
              </span>
              {lr.status === 'pending' && (user?.role === 'admin' || user?.role === 'manager') && (
                <div className="hr-list__actions">
                  <button className="hr-list__action-btn hr-list__action-btn--approve" onClick={() => review(lr.id, 'approved')}>Approve</button>
                  <button className="hr-list__action-btn hr-list__action-btn--deny" onClick={() => review(lr.id, 'denied')}>Deny</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Time Tracking ── */
function TimeTrackingView() {
  const [data, setData] = useState({ entries: [], today: 0, thisWeek: 0 });
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(() => { api.getTime().then(setData).catch(() => {}); }, []);
  useEffect(load, [load]);

  const activeClockIn = data.entries.find(e => e.clockIn && !e.clockOut);

  const submit = async (e) => {
    e.preventDefault();
    await api.logTime({ date, hours, note });
    setDate(new Date().toISOString().slice(0, 10)); setHours(''); setNote(''); setShowForm(false);
    load();
  };

  const handleClockIn = async () => { await api.clockIn(); load(); };
  const handleClockOut = async () => { if (activeClockIn) { await api.clockOut(activeClockIn.id); load(); } };
  const remove = async (id) => { await api.deleteTime(id); load(); };

  return (
    <div>
      <div className="hr-time__summary">
        <div className="hr-time__box">
          <span className="hr-time__box-label">Today</span>
          <span className="hr-time__box-value">{data.today}h</span>
        </div>
        <div className="hr-time__box">
          <span className="hr-time__box-label">This Week</span>
          <span className="hr-time__box-value">{data.thisWeek}h</span>
        </div>
        <div className="hr-time__clock-buttons">
          {activeClockIn ? (
            <button className="hr-portal__new-btn hr-portal__new-btn--danger" onClick={handleClockOut}>
              <Square size={16} /> Clock Out
            </button>
          ) : (
            <button className="hr-portal__new-btn" onClick={handleClockIn}>
              <Play size={16} /> Clock In
            </button>
          )}
        </div>
      </div>

      {showForm ? (
        <form className="hr-form" onSubmit={submit}>
          <div className="hr-form__row hr-form__row--split">
            <input type="date" className="hr-form__input" value={date} onChange={e => setDate(e.target.value)} required />
            <input type="number" step="0.25" min="0" max="24" className="hr-form__input" placeholder="Hours" value={hours} onChange={e => setHours(e.target.value)} required />
          </div>
          <div className="hr-form__row">
            <input className="hr-form__input" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn"><Plus size={16} /> Log Entry</button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="hr-portal__new-btn" style={{ marginBottom: 16 }} onClick={() => setShowForm(true)}>
          <Plus size={18} /> Manual Entry
        </button>
      )}

      {data.entries.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><Clock size={28} /></div>
          <p>No time entries yet</p>
        </div>
      ) : (
        <div className="hr-list">
          {data.entries.map(e => (
            <div className="hr-list__item" key={e.id}>
              <div className="hr-list__item-header">
                <strong>{e.date}</strong>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="hr-badge">{e.hours}h</span>
                  <button className="hr-list__delete" onClick={() => remove(e.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              {(e.clockIn || e.note) && (
                <p className="hr-list__item-body">
                  {e.clockIn && <>{e.clockIn}{e.clockOut ? ` → ${e.clockOut}` : ' (active)'}</>}
                  {e.note && <>{e.clockIn ? ' · ' : ''}{e.note}</>}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tasks ── */
function TasksView() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => { api.getTasks().then(setItems).catch(() => {}); }, []);
  useEffect(() => { load(); api.getAllUsers().then(setAllUsers).catch(() => {}); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    await api.createTask({ title, description, priority, dueDate: dueDate || undefined, assigneeId: assigneeId || undefined });
    setTitle(''); setDescription(''); setPriority('medium'); setDueDate(''); setAssigneeId(''); setShowForm(false);
    load();
  };

  const updateStatus = async (id, status) => { await api.updateTask(id, { status }); load(); };
  const remove = async (id) => { await api.deleteTask(id); load(); };

  const filtered = filter === 'all' ? items : items.filter(t => t.status === filter);
  const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
  const statusLabels = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

  return (
    <div>
      {showForm ? (
        <form className="hr-form" onSubmit={submit}>
          <div className="hr-form__row">
            <input className="hr-form__input" placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="hr-form__row">
            <textarea className="hr-form__textarea" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="hr-form__row hr-form__row--split">
            <select className="hr-form__input" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input type="date" className="hr-form__input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className="hr-form__row">
            <select className="hr-form__input" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
              <option value="">Assign to me</option>
              {allUsers.filter(u => u.id !== user?.id).map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn"><Plus size={16} /> Create Task</button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="hr-tasks__header">
          <button className="hr-portal__new-btn" onClick={() => setShowForm(true)}>
            <Plus size={18} /> New Task
          </button>
          <div className="hr-tasks__filters">
            {['all', 'todo', 'in-progress', 'done'].map(f => (
              <button key={f} className={`hr-tasks__filter${filter === f ? ' hr-tasks__filter--active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : statusLabels[f]}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><CheckSquare size={28} /></div>
          <p>No tasks {filter !== 'all' ? `with status "${statusLabels[filter]}"` : ''}</p>
        </div>
      ) : (
        <div className="hr-list">
          {filtered.map(t => (
            <div className="hr-list__item" key={t.id}>
              <div className="hr-list__item-header">
                <strong>{t.title}</strong>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="hr-badge" style={{ background: priorityColors[t.priority], color: '#fff' }}>{t.priority}</span>
                  <button className="hr-list__delete" onClick={() => remove(t.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              {t.description && <p className="hr-list__item-body">{t.description}</p>}
              <span className="hr-list__meta">
                Assigned to {t.assignee?.name} · {t.dueDate ? `Due ${t.dueDate}` : 'No due date'}
              </span>
              <div className="hr-list__actions">
                {['todo', 'in-progress', 'done'].map(s => (
                  <button
                    key={s}
                    className={`hr-list__action-btn${t.status === s ? ' hr-list__action-btn--active' : ''}`}
                    onClick={() => updateStatus(t.id, s)}
                  >
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   TIER 2+ — Placeholder views (unchanged)
   ═══════════════════════════════════════ */

/* ── Meeting Hub ── */
function MeetingHubView() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [form, setForm] = useState({ title: '', date: '', time: '', videoLink: '', notes: '', attendeeIds: [] });

  const load = useCallback(() => { api.getMeetings().then(setMeetings).catch(() => {}); }, []);
  useEffect(() => { load(); api.getAllUsers().then(setAllUsers).catch(() => {}); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    await api.createMeeting(form);
    setForm({ title: '', date: '', time: '', videoLink: '', notes: '', attendeeIds: [] });
    setShowForm(false);
    load();
  };

  const remove = async (id) => { if (!confirm('Delete this meeting?')) return; await api.deleteMeeting(id); load(); };

  const toggleAttendee = (id) =>
    setForm(p => ({
      ...p,
      attendeeIds: p.attendeeIds.includes(id) ? p.attendeeIds.filter(x => x !== id) : [...p.attendeeIds, id],
    }));

  const today = new Date().toISOString().split('T')[0];
  const filtered = meetings
    .filter(m => filter === 'upcoming' ? m.date >= today : filter === 'past' ? m.date < today : true)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div className="ops-filter-row">
        {['upcoming', 'past', 'all'].map(f => (
          <button key={f} className={`hr-tasks__filter${filter === f ? ' hr-tasks__filter--active' : ''}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button className="hr-portal__new-btn" style={{ marginLeft: 'auto', marginBottom: 0 }}
          onClick={() => setShowForm(s => !s)}>
          <Plus size={16} /> Schedule Meeting
        </button>
      </div>

      {showForm && (
        <form className="hr-form" onSubmit={submit} style={{ marginBottom: 20 }}>
          <div className="hr-form__row hr-form__row--split">
            <input className="hr-form__input" placeholder="Meeting title *" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            <input type="date" className="hr-form__input" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
          </div>
          <div className="hr-form__row hr-form__row--split">
            <input type="time" className="hr-form__input" value={form.time}
              onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
            <input className="hr-form__input" placeholder="Video link (Zoom, Google Meet…)" value={form.videoLink}
              onChange={e => setForm(p => ({ ...p, videoLink: e.target.value }))} />
          </div>
          <div className="hr-form__row">
            <textarea className="hr-form__textarea" placeholder="Agenda / notes (optional)" rows={2}
              value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="hr-form__row">
            <p style={{ fontSize: 13, fontWeight: 500, color: '#64748b', margin: '0 0 8px' }}>Attendees</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {allUsers.filter(u => u.id !== user?.id).map(u => {
                const sel = form.attendeeIds.includes(u.id);
                return (
                  <button key={u.id} type="button" className="hr-badge"
                    style={{ cursor: 'pointer', background: sel ? '#ede9fe' : '#f1f5f9', color: sel ? '#6d28d9' : '#64748b', border: `1px solid ${sel ? '#a78bfa' : 'transparent'}` }}
                    onClick={() => toggleAttendee(u.id)}>
                    {u.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}>
              <Plus size={14} /> Save Meeting
            </button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {filtered.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><MonitorPlay size={28} /></div>
          <p>No {filter} meetings.</p>
        </div>
      ) : (
        <div className="hr-list">
          {filtered.map(m => (
            <div className="hr-list__item hr-meeting-card" key={m.id}>
              <div className="hr-list__item-header">
                <strong>{m.title}</strong>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {m.videoLink && (
                    <a href={m.videoLink} target="_blank" rel="noreferrer" className="hr-meeting-card__video-btn">
                      <Video size={13} /> Join
                    </a>
                  )}
                  <button className="hr-list__delete" onClick={() => remove(m.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="hr-list__meta">
                <span className="hr-badge"><CalendarDays size={11} /> {m.date}</span>
                {m.time && <span className="hr-badge"><Clock size={11} /> {m.time}</span>}
                <span className="hr-badge">by {m.createdBy?.name}</span>
              </div>
              {m.attendees?.length > 0 && (
                <div className="hr-meeting-card__attendees">
                  {m.attendees.map(a => (
                    <span key={a.id} className="hr-meeting-card__avatar" title={a.name}>
                      {a.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  ))}
                </div>
              )}
              {m.notes && <p className="hr-list__item-body">{m.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* ── Performance Goals ── */
const GOAL_STATUS_COLORS = {
  'not-started': { bg: '#f8fafc', color: '#64748b' },
  'in-progress': { bg: '#eff6ff', color: '#1d4ed8' },
  'completed':   { bg: '#f0fdf4', color: '#15803d' },
};
const GOAL_CAT_COLORS = {
  work:     { bg: '#f5f3ff', color: '#6d28d9' },
  learning: { bg: '#fff7ed', color: '#c2410c' },
  personal: { bg: '#f0fdf4', color: '#15803d' },
};

function PerformanceView() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', category: 'work', targetDate: '', userId: '' });

  const load = useCallback(() => { api.getPerformanceGoals().then(setGoals).catch(() => {}); }, []);
  useEffect(() => {
    load();
    if (user?.role === 'admin' || user?.role === 'manager') api.getAllUsers().then(setAllUsers).catch(() => {});
  }, [load, user?.role]);

  const submit = async (e) => {
    e.preventDefault();
    await api.createPerformanceGoal(form);
    setForm({ title: '', description: '', category: 'work', targetDate: '', userId: '' });
    setShowForm(false); load();
  };

  const updateProgress = async (id, progress) => {
    const status = progress >= 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started';
    await api.updatePerformanceGoal(id, { progress, status });
    load();
  };

  const remove = async (id) => { await api.deletePerformanceGoal(id); load(); };

  const filtered = filter === 'all' ? goals : goals.filter(g => g.status === filter);

  return (
    <div>
      <div className="hr-tasks__header">
        <button className="hr-portal__new-btn" onClick={() => setShowForm(s => !s)}>
          <Plus size={18} /> New Goal
        </button>
        <div className="hr-tasks__filters">
          {['all', 'not-started', 'in-progress', 'completed'].map(f => (
            <button key={f} className={`hr-tasks__filter${filter === f ? ' hr-tasks__filter--active' : ''}`}
              onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <form className="hr-form" onSubmit={submit} style={{ marginBottom: 20 }}>
          <div className="hr-form__row">
            <input className="hr-form__input" placeholder="Goal title *" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div className="hr-form__row">
            <textarea className="hr-form__textarea" placeholder="Description (optional)" rows={2}
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="hr-form__row hr-form__row--split">
            <select className="hr-form__input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              <option value="work">Work</option>
              <option value="learning">Learning</option>
              <option value="personal">Personal</option>
            </select>
            <input type="date" className="hr-form__input" value={form.targetDate}
              onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))} />
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && allUsers.length > 0 && (
            <div className="hr-form__row">
              <select className="hr-form__input" value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))}>
                <option value="">Assign to myself</option>
                {allUsers.filter(u => u.id !== user?.id).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}>
              <Plus size={14} /> Create Goal
            </button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {filtered.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><Target size={28} /></div>
          <p>No goals {filter !== 'all' ? `with status "${filter}"` : ''}.</p>
        </div>
      ) : (
        <div className="hr-list">
          {filtered.map(g => {
            const sc = GOAL_STATUS_COLORS[g.status] || GOAL_STATUS_COLORS['not-started'];
            const cc = GOAL_CAT_COLORS[g.category] || GOAL_CAT_COLORS.work;
            const today = new Date().toISOString().slice(0, 10);
            return (
              <div className="hr-list__item hr-perf-goal" key={g.id}>
                <div className="hr-list__item-header">
                  <div>
                    <strong>{g.title}</strong>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8' }}>{g.user?.name}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span className="hr-badge" style={{ background: cc.bg, color: cc.color }}>{g.category}</span>
                    <span className="hr-badge" style={{ background: sc.bg, color: sc.color }}>{g.status}</span>
                    <button className="hr-list__delete" onClick={() => remove(g.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
                {g.description && <p className="hr-list__item-body">{g.description}</p>}
                <div className="hr-perf-goal__progress">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                    <span>Progress</span>
                    <span style={{ fontWeight: 600, color: g.progress >= 100 ? '#15803d' : '#6366f1' }}>{g.progress}%</span>
                  </div>
                  <div className="hr-perf-goal__bar-wrap">
                    <div className="hr-perf-goal__bar" style={{ width: `${g.progress}%` }} />
                  </div>
                  <input type="range" min="0" max="100" step="5" value={g.progress}
                    className="hr-perf-goal__slider"
                    onChange={e => updateProgress(g.id, parseInt(e.target.value, 10))} />
                </div>
                {g.targetDate && (
                  <span className="hr-list__meta">
                    Target: {g.targetDate}
                    {g.targetDate < today && g.status !== 'completed' && (
                      <span className="hr-badge" style={{ marginLeft: 8, background: '#fee2e2', color: '#b91c1c' }}>Overdue</span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function MyProfileView() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (newPassword !== confirm) return setStatus({ type: 'error', msg: 'New passwords do not match' });
    if (newPassword.length < 6) return setStatus({ type: 'error', msg: 'Password must be at least 6 characters' });
    setLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setStatus({ type: 'success', msg: 'Password updated successfully!' });
      setCurrentPassword(''); setNewPassword(''); setConfirm('');
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="hr-profile__card">
        <div className="hr-profile__avatar">{user?.name?.split(' ').map(n => n[0]).join('') || '?'}</div>
        <div className="hr-profile__info">
          <h2 className="hr-profile__name">{user?.name}</h2>
          <p className="hr-profile__email">{user?.email}</p>
          <span className="hr-badge" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          {user?.department && <span className="hr-profile__dept">{user.department}</span>}
        </div>
      </div>

      <h3 className="hr-profile__section-title">Change Password</h3>
      {status && (
        <p className={`hr-profile__status hr-profile__status--${status.type}`}>{status.msg}</p>
      )}
      <form className="hr-form" onSubmit={submit}>
        <div className="hr-form__row">
          <input
            type="password"
            className="hr-form__input"
            placeholder="Current password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="hr-form__row">
          <input
            type="password"
            className="hr-form__input"
            placeholder="New password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="hr-form__row">
          <input
            type="password"
            className="hr-form__input"
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
        </div>
        <div className="hr-form__actions">
          <button type="submit" className="hr-portal__new-btn" disabled={loading}>
            {loading ? 'Saving…' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
function DirectoryView() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(() => { api.getAllUsers().then(setMembers).catch(() => {}); }, []);
  useEffect(load, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await api.inviteUser({ name, email, password, role, department });
      setSuccess(`${name} has been added!`);
      setName(''); setEmail(''); setPassword(''); setRole('employee'); setDepartment('');
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Remove this user?')) return;
    await api.deleteUser(id);
    load();
  };

  const roleColors = { admin: '#7c3aed', manager: '#2563eb', employee: '#64748b' };

  return (
    <div>
      {success && <p className="hr-profile__status hr-profile__status--success">{success}</p>}

      {(user?.role === 'admin' || user?.role === 'manager') && (
        showForm ? (
          <form className="hr-form" onSubmit={submit}>
            {error && <p className="hr-profile__status hr-profile__status--error">{error}</p>}
            <div className="hr-form__row hr-form__row--split">
              <input className="hr-form__input" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required />
              <input type="email" className="hr-form__input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="hr-form__row hr-form__row--split">
              <input type="password" className="hr-form__input" placeholder="Temporary password" value={password} onChange={e => setPassword(e.target.value)} required />
              <select className="hr-form__input" value={role} onChange={e => setRole(e.target.value)}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="hr-form__row">
              <input className="hr-form__input" placeholder="Department (optional)" value={department} onChange={e => setDepartment(e.target.value)} />
            </div>
            <div className="hr-form__actions">
              <button type="submit" className="hr-portal__new-btn"><Plus size={16} /> Add Member</button>
              <button type="button" className="hr-form__cancel" onClick={() => { setShowForm(false); setError(''); }}>Cancel</button>
            </div>
          </form>
        ) : (
          <button className="hr-portal__new-btn" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Invite Team Member
          </button>
        )
      )}

      {members.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><Users size={28} /></div>
          <p>No team members yet</p>
        </div>
      ) : (
        <div className="hr-directory">
          {members.map(m => (
            <div className="hr-directory__card" key={m.id}>
              <div className="hr-directory__avatar">{m.name.split(' ').map(n => n[0]).join('')}</div>
              <div className="hr-directory__info">
                <strong>{m.name}</strong>
                <span>{m.email}</span>
                {m.department && <span className="hr-directory__dept">{m.department}</span>}
              </div>
              <div className="hr-directory__meta">
                <span className="hr-badge" style={{ background: roleColors[m.role] || '#64748b', color: '#fff' }}>
                  {m.role}
                </span>
                {user?.role === 'admin' && m.id !== user.id && (
                  <button className="hr-list__delete" onClick={() => remove(m.id)} title="Remove user">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* ── Org Chart ── */
function OrgChartView() {
  const [members, setMembers] = useState([]);
  useEffect(() => { api.getAllUsers().then(setMembers).catch(() => {}); }, []);

  const roleOrder = ['admin', 'manager', 'employee'];
  const roleColors = { admin: '#7c3aed', manager: '#2563eb', employee: '#475569' };

  const byDept = members.reduce((acc, m) => {
    const dept = m.department || 'General';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(m);
    return acc;
  }, {});

  if (members.length === 0) return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><GitBranch size={28} /></div>
      <p>No team members yet</p>
    </div>
  );

  return (
    <div className="hr-org-chart">
      {Object.entries(byDept).sort(([a], [b]) => a.localeCompare(b)).map(([dept, people]) => {
        const grouped = roleOrder.reduce((acc, role) => {
          const users = people.filter(p => p.role === role);
          if (users.length) acc.push({ role, users });
          return acc;
        }, []);
        return (
          <div className="hr-org-dept" key={dept}>
            <div className="hr-org-dept__name">{dept}</div>
            <div className="hr-org-dept__body">
              {grouped.map(({ role, users }) => (
                <div className="hr-org-role" key={role}>
                  <div className="hr-org-role__label" style={{ color: roleColors[role] || '#475569' }}>{role}</div>
                  <div className="hr-org-role__users">
                    {users.map(u => (
                      <div className="hr-org-user" key={u.id}>
                        <div className="hr-directory__avatar" style={{ borderColor: roleColors[role] || '#475569' }}>
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="hr-org-user__info">
                          <strong>{u.name}</strong>
                          <span>{u.email}</span>
                        </div>
                        <span className="hr-badge" style={{ background: (roleColors[role] || '#475569') + '1a', color: roleColors[role] || '#475569' }}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
// SOPs are managed in Operations → SOPs (removed from HR nav)
/* ── Notifications ── */
function NotificationsView() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const items = [];
    const load = [];

    load.push(
      api.getMessages().then(msgs => {
        msgs.filter(m => m.receiverId === user?.id && !m.read).forEach(m => items.push({
          id: `msg-${m.id}`, type: 'message', severity: 'info',
          title: `New message: ${m.subject}`, detail: `From ${m.sender?.name}`, time: m.createdAt,
        }));
      }).catch(() => {})
    );

    if (user?.role === 'admin' || user?.role === 'manager') {
      load.push(
        api.getLeave().then(leaves => {
          leaves.filter(l => l.status === 'pending').forEach(l => items.push({
            id: `leave-${l.id}`, type: 'leave', severity: 'warning',
            title: `Pending leave: ${l.user?.name}`, detail: `${l.type} · ${l.startDate} → ${l.endDate}`, time: l.createdAt,
          }));
        }).catch(() => {})
      );
    }

    load.push(
      api.getTasks().then(tasks => {
        tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < today).forEach(t => items.push({
          id: `task-${t.id}`, type: 'task', severity: 'error',
          title: `Overdue task: ${t.title}`, detail: `Due ${t.dueDate}`, time: t.createdAt,
        }));
      }).catch(() => {})
    );

    load.push(
      api.getAnnouncements().then(ann => {
        ann.slice(0, 3).forEach(a => items.push({
          id: `ann-${a.id}`, type: 'announcement', severity: 'neutral',
          title: a.title, detail: `by ${a.author?.name}`, time: a.createdAt,
        }));
      }).catch(() => {})
    );

    Promise.all(load).then(() => {
      items.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifs(items);
      setLoading(false);
    });
  }, [user?.id, user?.role]);

  const SEV = {
    error:   { bg: '#fee2e2', color: '#b91c1c' },
    warning: { bg: '#fff7ed', color: '#c2410c' },
    info:    { bg: '#eff6ff', color: '#1d4ed8' },
    neutral: { bg: '#f8fafc', color: '#475569' },
  };
  const TYPE_LABEL = { message: 'Message', leave: 'Leave', task: 'Task', announcement: 'Announcement' };

  if (loading) return <div className="hr-portal__empty"><p>Loading…</p></div>;
  if (notifs.length === 0) return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><Bell size={28} /></div>
      <p>You're all caught up! No notifications.</p>
    </div>
  );

  return (
    <div className="hr-list">
      {notifs.map(n => {
        const cfg = SEV[n.severity] || SEV.neutral;
        return (
          <div className="hr-list__item hr-notif" key={n.id} style={{ borderLeft: `3px solid ${cfg.color}` }}>
            <span className="hr-notif__icon" style={{ background: cfg.bg, color: cfg.color }}>
              <AlertCircle size={15} />
            </span>
            <div className="hr-list__main">
              <span className="hr-list__name">{n.title}</span>
              <div className="hr-list__meta">
                <span className="hr-badge" style={{ background: cfg.bg, color: cfg.color }}>{TYPE_LABEL[n.type]}</span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{n.detail}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
/* ── Reports & Analytics ── */
function ReportsView() {
  const [data, setData] = useState(null);
  useEffect(() => { api.getReports().then(setData).catch(() => {}); }, []);

  if (!data) return <div className="hr-portal__empty"><p>Loading reports…</p></div>;

  const taskTotal = Object.values(data.tasks.counts).reduce((s, v) => s + v, 0) || 1;
  const doneRate  = Math.round((data.tasks.counts.done / taskTotal) * 100);
  const maxHours  = Math.max(1, ...Object.values(data.time.hoursByUser));
  const maxPri    = Math.max(1, ...Object.values(data.tasks.byPriority));
  const priColors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

  return (
    <div>
      <h3 className="hr-profile__section-title">Time Tracking</h3>
      <div className="hr-time__grid" style={{ marginBottom: 20 }}>
        <div className="hr-time__box"><div className="hr-time__val">{data.time.hoursThisWeek}h</div><div className="hr-time__label">This Week</div></div>
        <div className="hr-time__box"><div className="hr-time__val">{data.time.hoursThisMonth}h</div><div className="hr-time__label">This Month</div></div>
        <div className="hr-time__box"><div className="hr-time__val" style={{ color: data.messages.unread > 0 ? '#c2410c' : undefined }}>{data.messages.unread}</div><div className="hr-time__label">Unread Messages</div></div>
      </div>

      {Object.keys(data.time.hoursByUser).length > 0 && (
        <>
          <h4 className="hr-report__subtitle">Hours This Month by Team Member</h4>
          <div className="fin-cat-chart" style={{ marginBottom: 24 }}>
            {Object.entries(data.time.hoursByUser).sort((a, b) => b[1] - a[1]).map(([name, hours]) => (
              <div key={name} className="fin-cat-row">
                <span className="fin-cat-row__label">{name}</span>
                <div className="fin-cat-row__bar-wrap">
                  <div className="fin-cat-row__bar" style={{ width: `${(hours / maxHours) * 100}%`, background: '#6366f1' }} />
                </div>
                <span className="fin-cat-row__val">{hours}h</span>
              </div>
            ))}
          </div>
        </>
      )}

      <h3 className="hr-profile__section-title">Leave Requests</h3>
      <div className="hr-time__grid" style={{ marginBottom: 24 }}>
        <div className="hr-time__box"><div className="hr-time__val" style={{ color: '#f59e0b' }}>{data.leave.counts.pending || 0}</div><div className="hr-time__label">Pending</div></div>
        <div className="hr-time__box"><div className="hr-time__val" style={{ color: '#22c55e' }}>{data.leave.counts.approved || 0}</div><div className="hr-time__label">Approved</div></div>
        <div className="hr-time__box"><div className="hr-time__val" style={{ color: '#ef4444' }}>{data.leave.counts.denied || 0}</div><div className="hr-time__label">Denied</div></div>
        <div className="hr-time__box"><div className="hr-time__val">{data.leave.total}</div><div className="hr-time__label">Total</div></div>
      </div>

      <h3 className="hr-profile__section-title">Tasks</h3>
      <div className="hr-time__grid" style={{ marginBottom: 12 }}>
        <div className="hr-time__box"><div className="hr-time__val">{data.tasks.counts.todo || 0}</div><div className="hr-time__label">To Do</div></div>
        <div className="hr-time__box"><div className="hr-time__val" style={{ color: '#1d4ed8' }}>{data.tasks.counts['in-progress'] || 0}</div><div className="hr-time__label">In Progress</div></div>
        <div className="hr-time__box"><div className="hr-time__val" style={{ color: '#22c55e' }}>{data.tasks.counts.done || 0}</div><div className="hr-time__label">Done</div></div>
        <div className="hr-time__box"><div className="hr-time__val" style={{ color: '#ef4444' }}>{data.tasks.overdue}</div><div className="hr-time__label">Overdue</div></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 4 }}>
        <span>Completion Rate</span>
        <span style={{ fontWeight: 700, color: '#6366f1' }}>{doneRate}%</span>
      </div>
      <div className="prop-progress" style={{ marginBottom: 20 }}>
        <div className="prop-progress__bar" style={{ width: `${doneRate}%` }} />
      </div>

      {Object.keys(data.tasks.byPriority).length > 0 && (
        <>
          <h4 className="hr-report__subtitle">Open Tasks by Priority</h4>
          <div className="fin-cat-chart">
            {Object.entries(data.tasks.byPriority).map(([p, count]) => (
              <div key={p} className="fin-cat-row">
                <span className="fin-cat-row__label" style={{ textTransform: 'capitalize' }}>{p}</span>
                <div className="fin-cat-row__bar-wrap">
                  <div className="fin-cat-row__bar" style={{ width: `${(count / maxPri) * 100}%`, background: priColors[p] || '#6366f1' }} />
                </div>
                <span className="fin-cat-row__val">{count}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
/* ── Onboarding ── */
const ONBOARD_CATS = ['general', 'access', 'training', 'paperwork', 'setup'];

function OnboardingView() {
  const { user } = useAuth();
  const [steps, setSteps] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', category: 'general', assigneeId: '' });

  const load = useCallback(() => { api.getOnboardingSteps().then(setSteps).catch(() => {}); }, []);
  useEffect(() => {
    load();
    if (user?.role === 'admin' || user?.role === 'manager') api.getAllUsers().then(setAllUsers).catch(() => {});
  }, [load, user?.role]);

  const submit = async (e) => {
    e.preventDefault();
    await api.createOnboardingStep(form);
    setForm({ title: '', description: '', category: 'general', assigneeId: '' });
    setShowForm(false); load();
  };

  const toggle = async (id, done) => { await api.updateOnboardingStep(id, { done: !done }); load(); };
  const remove = async (id) => { await api.deleteOnboardingStep(id); load(); };

  const displayed = filter === 'done' ? steps.filter(s => s.done)
    : filter === 'pending' ? steps.filter(s => !s.done)
    : steps;

  const grouped = ONBOARD_CATS.reduce((acc, cat) => {
    const items = displayed.filter(s => s.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const doneCount = steps.filter(s => s.done).length;
  const pct = steps.length > 0 ? Math.round((doneCount / steps.length) * 100) : 0;

  return (
    <div>
      {steps.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 6 }}>
            <span>{doneCount}/{steps.length} steps complete</span>
            <span style={{ fontWeight: 700, color: '#6366f1' }}>{pct}%</span>
          </div>
          <div className="prop-progress"><div className="prop-progress__bar" style={{ width: `${pct}%` }} /></div>
        </div>
      )}

      <div className="ops-filter-row">
        {['all', 'pending', 'done'].map(f => (
          <button key={f} className={`hr-tasks__filter${filter === f ? ' hr-tasks__filter--active' : ''}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button className="hr-portal__new-btn" style={{ marginLeft: 'auto', marginBottom: 0 }}
          onClick={() => setShowForm(s => !s)}>
          <Plus size={16} /> Add Step
        </button>
      </div>

      {showForm && (
        <form className="hr-form" onSubmit={submit} style={{ marginTop: 12, marginBottom: 20 }}>
          <div className="hr-form__row hr-form__row--split">
            <input className="hr-form__input" placeholder="Step title *" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            <select className="hr-form__input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {ONBOARD_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="hr-form__row">
            <input className="hr-form__input" placeholder="Description (optional)" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <div className="hr-form__row">
              <select className="hr-form__input" value={form.assigneeId} onChange={e => setForm(p => ({ ...p, assigneeId: e.target.value }))}>
                <option value="">Assign to myself</option>
                {allUsers.filter(u => u.id !== user?.id).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}><Plus size={14} /> Save</button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {displayed.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><ClipboardList size={28} /></div>
          <p>No onboarding steps {filter !== 'all' ? `(${filter})` : ''}.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div className="hr-onboard-category">
              <span className="hr-badge" style={{ background: '#f1f5f9', color: '#475569', textTransform: 'capitalize' }}>{cat}</span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{items.filter(i => i.done).length}/{items.length} done</span>
            </div>
            <div className="hr-list">
              {items.map(s => (
                <div className={`hr-list__item hr-onboard-item${s.done ? ' hr-onboard-item--done' : ''}`} key={s.id}>
                  <button className="ops-check-btn" onClick={() => toggle(s.id, s.done)}>
                    {s.done ? <Check size={14} /> : <span />}
                  </button>
                  <div className="hr-list__main">
                    <span className="hr-list__name" style={{ textDecoration: s.done ? 'line-through' : 'none', color: s.done ? '#94a3b8' : 'inherit' }}>
                      {s.title}
                    </span>
                    {s.description && <p className="hr-list__item-body">{s.description}</p>}
                    {(user?.role === 'admin' || user?.role === 'manager') && s.assignee && (
                      <div className="hr-list__meta"><span className="hr-badge">{s.assignee.name}</span></div>
                    )}
                  </div>
                  <button className="hr-list__delete" onClick={() => remove(s.id)}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
/* ── Leave Management (admin / manager overview) ── */
function LeaveManagementView() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');

  const load = useCallback(() => { api.getLeave().then(setItems).catch(() => {}); }, []);
  useEffect(load, [load]);

  const review = async (id, status) => { await api.reviewLeave(id, status); load(); };

  const counts = { pending: 0, approved: 0, denied: 0 };
  items.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });

  const types = ['all', ...new Set(items.map(i => i.type))];
  const filtered = items
    .filter(l => statusFilter === 'all' || l.status === statusFilter)
    .filter(l => typeFilter  === 'all' || l.type   === typeFilter);

  const STATUS_COLORS = { pending: '#f59e0b', approved: '#22c55e', denied: '#ef4444' };

  if (user?.role !== 'admin' && user?.role !== 'manager') return (
    <div className="hr-portal__empty">
      <div className="hr-portal__empty-icon"><Settings size={28} /></div>
      <p>Leave management is for admins and managers.</p>
    </div>
  );

  return (
    <div>
      <div className="hr-time__grid" style={{ marginBottom: 20 }}>
        {Object.entries(counts).map(([s, count]) => (
          <div key={s} className="hr-time__box" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter(s)}>
            <div className="hr-time__val" style={{ color: STATUS_COLORS[s] }}>{count}</div>
            <div className="hr-time__label" style={{ textTransform: 'capitalize' }}>{s}</div>
          </div>
        ))}
        <div className="hr-time__box">
          <div className="hr-time__val">{items.length}</div>
          <div className="hr-time__label">Total</div>
        </div>
      </div>

      <div className="ops-filter-row" style={{ flexWrap: 'wrap', gap: 6 }}>
        {['all', 'pending', 'approved', 'denied'].map(f => (
          <button key={f} className={`hr-tasks__filter${statusFilter === f ? ' hr-tasks__filter--active' : ''}`}
            onClick={() => setStatusFilter(f)}>
            {f === 'all' ? 'All statuses' : f}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        {types.map(t => (
          <button key={t} className={`hr-tasks__filter${typeFilter === t ? ' hr-tasks__filter--active' : ''}`}
            onClick={() => setTypeFilter(t)}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><CalendarDays size={28} /></div>
          <p>No leave requests match this filter.</p>
        </div>
      ) : (
        <div className="hr-list">
          {filtered.map(lr => (
            <div className="hr-list__item" key={lr.id}>
              <div className="hr-list__item-header">
                <strong>{lr.user?.name}</strong>
                <span className="hr-badge" style={{ background: STATUS_COLORS[lr.status], color: '#fff' }}>
                  {lr.status}
                </span>
              </div>
              <p className="hr-list__item-body">
                <strong style={{ textTransform: 'capitalize' }}>{lr.type}</strong> · {lr.startDate} → {lr.endDate}
                {lr.reason && <><br /><span style={{ color: '#64748b' }}>{lr.reason}</span></>}
              </p>
              <span className="hr-list__meta">
                {new Date(lr.createdAt).toLocaleDateString()}
                {lr.reviewer && ` · Reviewed by ${lr.reviewer.name}`}
              </span>
              {lr.status === 'pending' && (
                <div className="hr-list__actions">
                  <button className="hr-list__action-btn hr-list__action-btn--approve" onClick={() => review(lr.id, 'approved')}>
                    <Check size={13} /> Approve
                  </button>
                  <button className="hr-list__action-btn hr-list__action-btn--deny" onClick={() => review(lr.id, 'denied')}>
                    <X size={13} /> Deny
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function AIIntelligenceView() {
  return (<div className="hr-portal__empty"><div className="hr-portal__empty-icon"><Sparkles size={28} /></div><p>AI Intelligence Systems coming soon</p></div>);
}

/* ═══════════════════════════════════════
   View registry & HR Hub shell
   ═══════════════════════════════════════ */

const views = {
  messages:        { label: 'Messages',             icon: MessageSquare, component: MessagesView },
  leave:           { label: 'Leave Requests',       icon: CalendarDays,  component: LeaveRequestsView },
  time:            { label: 'Time Tracking',        icon: Clock,         component: TimeTrackingView },
  meetings:        { label: 'Meeting Hub',          icon: MonitorPlay,   component: MeetingHubView },
  announcements:   { label: 'Announcements',        icon: BellIcon,      component: AnnouncementsView },
  tasks:           { label: 'Tasks',                icon: CheckSquare,   component: TasksView },
  performance:     { label: 'Performance',          icon: TrendingUp,    component: PerformanceView },
  profile:         { label: 'My Profile',           icon: User,          component: MyProfileView },
  directory:       { label: 'Directory',            icon: Users,         component: DirectoryView },
  orgchart:        { label: 'Org Chart',            icon: GitBranch,     component: OrgChartView },
  notifications:   { label: 'Notifications',        icon: Bell,          component: NotificationsView },
  reports:         { label: 'Reports & Analytics',  icon: BarChart3,     component: ReportsView },
  onboarding:      { label: 'Onboarding',           icon: ClipboardList, component: OnboardingView },
  leavemanagement: { label: 'Leave Management',     icon: Settings,      component: LeaveManagementView },
  ai:              { label: 'AI Intelligence',      icon: Sparkles,      component: AIIntelligenceView },
};

const mainLinks  = ['messages', 'leave', 'time', 'meetings', 'announcements', 'tasks', 'performance', 'profile', 'directory', 'orgchart', 'notifications'];
const adminLinks = ['reports', 'onboarding', 'leavemanagement', 'ai'];

/* ── Main HR Hub Page ── */

export default function HR() {
  const [activeView, setActiveView] = useState('announcements');
  const [msgCount, setMsgCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const { user } = useAuth();
  const ActiveComponent = views[activeView].component;

  // Load sidebar stats
  useEffect(() => {
    api.getMessages().then(msgs => {
      setMsgCount(msgs.filter(m => m.receiverId === user?.id && !m.read).length);
    }).catch(() => {});
    api.getLeave().then(leaves => {
      setLeaveCount(leaves.filter(l => l.status === 'pending').length);
    }).catch(() => {});
  }, [activeView, user?.id]);

  return (
    <div className="hr-portal">
      <aside className="hr-portal__sidebar">
        <div className="hr-portal__sidebar-header">
          <h2 className="hr-portal__sidebar-title">HR Portal</h2>
          <span className="hr-portal__sidebar-subtitle">Employee Management</span>
        </div>

        <div className="hr-portal__stats">
          <div className="hr-portal__stat hr-portal__stat--blue" onClick={() => setActiveView('messages')} style={{ cursor: 'pointer' }}>
            <MessageSquare size={16} />
            <div>
              <span className="hr-portal__stat-label">Messages</span>
              <span className="hr-portal__stat-value">{msgCount}</span>
            </div>
          </div>
          <div className="hr-portal__stat hr-portal__stat--amber" onClick={() => setActiveView('leave')} style={{ cursor: 'pointer' }}>
            <CalendarDays size={16} />
            <div>
              <span className="hr-portal__stat-label">Pending Leave</span>
              <span className="hr-portal__stat-value">{leaveCount}</span>
            </div>
          </div>
        </div>

        <nav className="hr-portal__nav">
          {mainLinks.map((key) => {
            const v = views[key];
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

          <div className="hr-portal__nav-divider" />
          <span className="hr-portal__nav-section">HR ADMIN</span>

          {adminLinks.map((key) => {
            const v = views[key];
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
