import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  ShoppingCart,
  ClipboardList,
  Check,
} from 'lucide-react';
import api from '../lib/apiClient';

/* ─────────────────────────────────────────
   Property Status Badge
───────────────────────────────────────── */
const statusColors = {
  setup:    { bg: '#fff7ed', color: '#c2410c' },
  active:   { bg: '#f0fdf4', color: '#15803d' },
  inactive: { bg: '#f8fafc', color: '#64748b' },
};

function StatusBadge({ status }) {
  const s = statusColors[status] || statusColors.inactive;
  return (
    <span className="hr-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}22` }}>
      {status}
    </span>
  );
}

/* ─────────────────────────────────────────
   Properties List view
───────────────────────────────────────── */
function PropertiesListView() {
  const [properties, setProperties] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [activeTab, setActiveTab] = useState({});
  const [form, setForm] = useState({ name: '', address: '', type: 'short-term', status: 'setup', units: 1, notes: '' });

  const load = useCallback(() => {
    api.getPropertiesV2().then(setProperties).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const submit = async (e) => {
    e.preventDefault();
    await api.createProperty(form);
    setForm({ name: '', address: '', type: 'short-term', status: 'setup', units: 1, notes: '' });
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this property and all its data?')) return;
    await api.deleteProperty(id);
    load();
  };

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const setTab = (id, tab) => setActiveTab(p => ({ ...p, [id]: tab }));
  const getTab = (id) => activeTab[id] || 'orders';

  return (
    <div>
      {showForm ? (
        <form className="hr-form" onSubmit={submit}>
          <div className="hr-form__row hr-form__row--split">
            <input className="hr-form__input" placeholder="Property name *" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            <input className="hr-form__input" placeholder="Address" value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
          </div>
          <div className="hr-form__row hr-form__row--split">
            <select className="hr-form__input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="short-term">Short-Term Rental</option>
              <option value="long-term">Long-Term Rental</option>
              <option value="commercial">Commercial</option>
            </select>
            <select className="hr-form__input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="setup">In Setup</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="hr-form__row hr-form__row--split">
            <input type="number" min="1" className="hr-form__input" placeholder="Units" value={form.units}
              onChange={e => setForm(p => ({ ...p, units: e.target.value }))} />
            <input className="hr-form__input" placeholder="Notes (optional)" value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn"><Plus size={16} /> Add Property</button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="hr-portal__new-btn" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add Property
        </button>
      )}

      {properties.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><Building2 size={28} /></div>
          <p>No properties yet. Add your first property above.</p>
        </div>
      ) : (
        <div className="prop-list">
          {properties.map(prop => (
            <div className="prop-card" key={prop.id}>
              <div className="prop-card__header" onClick={() => toggleExpand(prop.id)}>
                <div className="prop-card__title-group">
                  <div className="prop-card__icon"><Building2 size={20} /></div>
                  <div>
                    <div className="prop-card__name">{prop.name}</div>
                    {prop.address && <div className="prop-card__address">{prop.address}</div>}
                  </div>
                </div>
                <div className="prop-card__meta">
                  <StatusBadge status={prop.status} />
                  <span className="hr-badge" style={{ background: '#f1f5f9', color: '#475569' }}>{prop.type}</span>
                  <span className="prop-card__units">{prop.units} unit{prop.units !== 1 ? 's' : ''}</span>
                  <button className="hr-list__delete" onClick={e => { e.stopPropagation(); remove(prop.id); }}><Trash2 size={14} /></button>
                  {expanded[prop.id] ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                </div>
              </div>

              {expanded[prop.id] && (
                <div className="prop-card__body">
                  <div className="prop-tabs">
                    <button className={`prop-tab${getTab(prop.id) === 'orders' ? ' prop-tab--active' : ''}`}
                      onClick={() => setTab(prop.id, 'orders')}>
                      <ShoppingCart size={14} /> Orders ({prop.orders?.length || 0})
                    </button>
                    <button className={`prop-tab${getTab(prop.id) === 'tasks' ? ' prop-tab--active' : ''}`}
                      onClick={() => setTab(prop.id, 'tasks')}>
                      <ClipboardList size={14} /> Setup Tasks ({prop.setupTasks?.length || 0})
                    </button>
                  </div>

                  {getTab(prop.id) === 'orders' && (
                    <OrdersPanel propertyId={prop.id} orders={prop.orders || []} onRefresh={load} />
                  )}
                  {getTab(prop.id) === 'tasks' && (
                    <SetupTasksPanel propertyId={prop.id} tasks={prop.setupTasks || []} onRefresh={load} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Orders sub-panel
───────────────────────────────────────── */
const orderStatusColors = {
  pending:   { bg: '#fff7ed', color: '#c2410c' },
  ordered:   { bg: '#eff6ff', color: '#1d4ed8' },
  delivered: { bg: '#f0fdf4', color: '#15803d' },
  installed: { bg: '#f5f3ff', color: '#6d28d9' },
};

function OrdersPanel({ propertyId, orders, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'furniture', vendor: '', cost: '', status: 'pending', notes: '' });

  const submit = async (e) => {
    e.preventDefault();
    await api.createPropertyOrder(propertyId, form);
    setForm({ title: '', type: 'furniture', vendor: '', cost: '', status: 'pending', notes: '' });
    setShowForm(false);
    onRefresh();
  };

  const cycleStatus = async (orderId, currentStatus) => {
    const order = ['pending', 'ordered', 'delivered', 'installed'];
    const next = order[(order.indexOf(currentStatus) + 1) % order.length];
    await api.updatePropertyOrder(propertyId, orderId, { status: next });
    onRefresh();
  };

  const remove = async (orderId) => {
    await api.deletePropertyOrder(propertyId, orderId);
    onRefresh();
  };

  const totalCost = orders.reduce((s, o) => s + (o.cost || 0), 0);

  return (
    <div>
      {orders.length > 0 && (
        <div className="prop-orders__summary">
          <span>{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
          <span className="prop-orders__total">Total: ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      )}

      {showForm ? (
        <form className="hr-form" style={{ marginTop: 12 }} onSubmit={submit}>
          <div className="hr-form__row hr-form__row--split">
            <input className="hr-form__input" placeholder="Item / title *" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            <select className="hr-form__input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="furniture">Furniture</option>
              <option value="appliances">Appliances</option>
              <option value="supplies">Supplies</option>
              <option value="renovation">Renovation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="hr-form__row hr-form__row--split">
            <input className="hr-form__input" placeholder="Vendor" value={form.vendor}
              onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} />
            <input type="number" min="0" step="0.01" className="hr-form__input" placeholder="Cost ($)"
              value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}>
              <Plus size={14} /> Add Order
            </button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="prop-add-btn" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Add Order
        </button>
      )}

      {orders.length === 0 && !showForm && <p className="prop-empty-hint">No orders yet.</p>}

      <div className="prop-orders">
        {orders.map(o => {
          const sc = orderStatusColors[o.status] || orderStatusColors.pending;
          return (
            <div className="prop-order-row" key={o.id}>
              <div className="prop-order-row__info">
                <span className="prop-order-row__title">{o.title}</span>
                {o.vendor && <span className="prop-order-row__vendor">{o.vendor}</span>}
              </div>
              <div className="prop-order-row__meta">
                {o.cost > 0 && <span className="prop-order-row__cost">${o.cost.toLocaleString()}</span>}
                <button
                  className="hr-badge"
                  style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}44`, cursor: 'pointer' }}
                  title="Click to advance status"
                  onClick={() => cycleStatus(o.id, o.status)}
                >
                  {o.status}
                </button>
                <button className="hr-list__delete" onClick={() => remove(o.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Setup Tasks sub-panel
───────────────────────────────────────── */
function SetupTasksPanel({ propertyId, tasks, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.createSetupTask(propertyId, { title });
    setTitle('');
    setShowForm(false);
    onRefresh();
  };

  const toggle = async (taskId, done) => {
    await api.updateSetupTask(propertyId, taskId, { done: !done });
    onRefresh();
  };

  const remove = async (taskId) => {
    await api.deleteSetupTask(propertyId, taskId);
    onRefresh();
  };

  const completed = tasks.filter(t => t.done).length;

  return (
    <div>
      {tasks.length > 0 && (
        <div className="prop-orders__summary">
          <span>{completed}/{tasks.length} complete</span>
          <div className="prop-progress">
            <div className="prop-progress__bar" style={{ width: `${tasks.length > 0 ? (completed / tasks.length) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {showForm ? (
        <form className="hr-form" style={{ marginTop: 12 }} onSubmit={submit}>
          <div className="hr-form__row">
            <input className="hr-form__input" placeholder="Task title *" value={title}
              onChange={e => setTitle(e.target.value)} autoFocus required />
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}>
              <Plus size={14} /> Add Task
            </button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="prop-add-btn" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Add Task
        </button>
      )}

      {tasks.length === 0 && !showForm && <p className="prop-empty-hint">No setup tasks yet.</p>}

      <div className="prop-task-list">
        {tasks.map(t => (
          <div className={`prop-task-row${t.done ? ' prop-task-row--done' : ''}`} key={t.id}>
            <button className="prop-task-row__check" onClick={() => toggle(t.id, t.done)}>
              {t.done ? <Check size={14} /> : <span />}
            </button>
            <span className="prop-task-row__title">{t.title}</span>
            <button className="hr-list__delete" onClick={() => remove(t.id)}><Trash2 size={13} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Summary / Stats view
───────────────────────────────────────── */
function SummaryView() {
  const [properties, setProperties] = useState([]);
  useEffect(() => { api.getPropertiesV2().then(setProperties).catch(() => {}); }, []);

  const total = properties.length;
  const active = properties.filter(p => p.status === 'active').length;
  const setup = properties.filter(p => p.status === 'setup').length;
  const totalOrders = properties.reduce((s, p) => s + (p.orders?.length || 0), 0);
  const pendingOrders = properties.reduce((s, p) => s + (p.orders?.filter(o => o.status === 'pending').length || 0), 0);
  const totalCost = properties.reduce((s, p) => s + (p.orders?.reduce((os, o) => os + (o.cost || 0), 0) || 0), 0);

  return (
    <div>
      <div className="prop-stat-grid">
        <div className="prop-stat"><div className="prop-stat__val">{total}</div><div className="prop-stat__label">Properties</div></div>
        <div className="prop-stat"><div className="prop-stat__val">{active}</div><div className="prop-stat__label">Active</div></div>
        <div className="prop-stat"><div className="prop-stat__val">{setup}</div><div className="prop-stat__label">In Setup</div></div>
        <div className="prop-stat"><div className="prop-stat__val">{totalOrders}</div><div className="prop-stat__label">Total Orders</div></div>
        <div className="prop-stat"><div className="prop-stat__val">{pendingOrders}</div><div className="prop-stat__label">Pending Orders</div></div>
        <div className="prop-stat"><div className="prop-stat__val">${totalCost.toLocaleString()}</div><div className="prop-stat__label">Order Value</div></div>
      </div>

      {properties.length > 0 && (
        <>
          <h3 className="hr-profile__section-title" style={{ marginTop: 28 }}>Setup Progress</h3>
          <div className="prop-list">
            {properties.filter(p => p.setupTasks?.length > 0).map(p => {
              const tasks = p.setupTasks || [];
              const done = tasks.filter(t => t.done).length;
              const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
              return (
                <div className="prop-progress-row" key={p.id}>
                  <div className="prop-progress-row__info">
                    <span>{p.name}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="prop-progress-row__bar-wrap">
                    <div className="prop-progress">
                      <div className="prop-progress__bar" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="prop-progress-row__pct">{done}/{tasks.length} tasks · {pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   View registry & Properties portal shell
───────────────────────────────────────── */
const views = {
  properties: { label: 'Properties',       icon: Building2,     component: PropertiesListView },
  summary:    { label: 'Portfolio Summary', icon: ClipboardList, component: SummaryView },
};

export default function Properties() {
  const [activeView, setActiveView] = useState('properties');
  const ActiveComponent = views[activeView].component;

  return (
    <div className="hr-portal">
      <aside className="hr-portal__sidebar">
        <div className="hr-portal__sidebar-header">
          <h2 className="hr-portal__sidebar-title">Properties</h2>
          <span className="hr-portal__sidebar-subtitle">Portfolio Management</span>
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
