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
  BookOpen,
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

function MeetingHubView() {
  return (<div className="hr-portal__empty"><div className="hr-portal__empty-icon"><MonitorPlay size={28} /></div><p>No meetings scheduled</p></div>);
}
function PerformanceView() {
  return (<div className="hr-portal__empty"><div className="hr-portal__empty-icon"><TrendingUp size={28} /></div><p>No performance reviews</p></div>);
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
function OrgChartView() {
  return (<div className="hr-portal__empty"><div className="hr-portal__empty-icon"><GitBranch size={28} /></div><p>Org chart not configured</p></div>);
}
function SOPsView() {
  return (<div className="hr-portal__empty"><div className="hr-portal__empty-icon"><BookOpen size={28} /></div><p>No SOPs added yet</p></div>);
}
function NotificationsView() {
  return (<div className="hr-portal__empty"><div className="hr-portal__empty-icon"><Bell size={28} /></div><p>No notifications</p></div>);
}
function ReportsView() {
  return (<div className="hr-portal__empty"><div className="hr-portal__empty-icon"><BarChart3 size={28} /></div><p>No reports available</p></div>);
}
function OnboardingView() {
  return (<div className="hr-portal__empty"><div className="hr-portal__empty-icon"><ClipboardList size={28} /></div><p>No onboarding tasks</p></div>);
}
function LeaveManagementView() {
  return (<div className="hr-portal__empty"><div className="hr-portal__empty-icon"><Settings size={28} /></div><p>Leave management not configured</p></div>);
}
function AIIntelligenceView() {
  return (<div className="hr-portal__empty"><div className="hr-portal__empty-icon"><Sparkles size={28} /></div><p>AI Intelligence Systems coming soon</p></div>);
}

/* ═══════════════════════════════════════
   View registry & HR Hub shell
   ═══════════════════════════════════════ */

const views = {
  messages:         { label: 'Messages',            icon: MessageSquare,  component: MessagesView },
  leave:            { label: 'Leave Requests',      icon: CalendarDays,   component: LeaveRequestsView },
  time:             { label: 'Time Tracking',       icon: Clock,          component: TimeTrackingView },
  meetings:         { label: 'Meeting Hub',         icon: MonitorPlay,    component: MeetingHubView },
  announcements:    { label: 'Announcements',       icon: BellIcon,       component: AnnouncementsView },
  tasks:            { label: 'Tasks',               icon: CheckSquare,    component: TasksView },
  performance:      { label: 'Performance',         icon: TrendingUp,     component: PerformanceView },
  profile:          { label: 'My Profile',          icon: User,           component: MyProfileView },
  directory:        { label: 'Directory',           icon: Users,          component: DirectoryView },
  orgchart:         { label: 'Org Chart',           icon: GitBranch,      component: OrgChartView },
  sops:             { label: 'SOPs',                icon: BookOpen,       component: SOPsView },
  notifications:    { label: 'Notifications',       icon: Bell,           component: NotificationsView },
  reports:          { label: 'Reports & Analytics', icon: BarChart3,      component: ReportsView },
  onboarding:       { label: 'Onboarding',          icon: ClipboardList,  component: OnboardingView },
  leavemanagement:  { label: 'Leave Management',    icon: Settings,       component: LeaveManagementView },
  ai:               { label: 'AI Intelligence Systems', icon: Sparkles,   component: AIIntelligenceView },
};

const mainLinks = ['messages', 'leave', 'time', 'meetings', 'announcements', 'tasks', 'performance', 'profile', 'directory', 'orgchart', 'sops', 'notifications'];
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
