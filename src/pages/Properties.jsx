import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Plus,
  Trash2,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  ClipboardList,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../lib/apiClient';

/* ─────────────────────────────────────────
   Status badge colours
───────────────────────────────────────── */
const STATUS_COLORS = {
  setup:    { bg: '#fff7ed', color: '#c2410c' },
  active:   { bg: '#dcfce7', color: '#16a34a' },
  inactive: { bg: '#f1f5f9', color: '#64748b' },
};

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
            <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}><Plus size={14} /> Add Order</button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="prop-add-btn" onClick={() => setShowForm(true)}><Plus size={14} /> Add Order</button>
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
                <button className="hr-badge"
                  style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}44`, cursor: 'pointer' }}
                  title="Click to advance status" onClick={() => cycleStatus(o.id, o.status)}>{o.status}</button>
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
    setTitle(''); setShowForm(false); onRefresh();
  };

  const toggle = async (taskId, done) => { await api.updateSetupTask(propertyId, taskId, { done: !done }); onRefresh(); };
  const remove = async (taskId) => { await api.deleteSetupTask(propertyId, taskId); onRefresh(); };

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
            <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}><Plus size={14} /> Add Task</button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="prop-add-btn" onClick={() => setShowForm(true)}><Plus size={14} /> Add Task</button>
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
   Main Properties page
───────────────────────────────────────── */
const EMPTY_FORM = { name: '', address: '', type: 'short-term', status: 'active', beds: 0, baths: 0, units: 1, notes: '' };

export default function Properties() {
  const [properties, setProperties]     = useState([]);
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bedsFilter, setBedsFilter]     = useState('all');
  const [bathsFilter, setBathsFilter]   = useState('all');
  const [sortBy, setSortBy]             = useState('name');
  const [selectedId, setSelectedId]     = useState(null);
  const [detailTab, setDetailTab]       = useState('orders');
  const [showAddForm, setShowAddForm]   = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);

  const load = useCallback(() => { api.getPropertiesV2().then(setProperties).catch(() => {}); }, []);
  useEffect(load, [load]);

  const submit = async (e) => {
    e.preventDefault();
    await api.createProperty(form);
    setForm(EMPTY_FORM); setShowAddForm(false); load();
  };

  const remove = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this property and all its data?')) return;
    await api.deleteProperty(id);
    if (selectedId === id) setSelectedId(null);
    load();
  };

  const selectCard = (id) => { setSelectedId(p => p === id ? null : id); setDetailTab('orders'); };

  /* Filtering + sorting */
  let filtered = [...properties];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q));
  }
  if (typeFilter   !== 'all') filtered = filtered.filter(p => p.type   === typeFilter);
  if (statusFilter !== 'all') filtered = filtered.filter(p => p.status === statusFilter);
  if (bedsFilter   !== 'all') filtered = filtered.filter(p => (p.beds  || 0) >= parseInt(bedsFilter));
  if (bathsFilter  !== 'all') filtered = filtered.filter(p => (p.baths || 0) >= parseFloat(bathsFilter));
  filtered.sort((a, b) => {
    if (sortBy === 'name')   return a.name.localeCompare(b.name);
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    if (sortBy === 'beds')   return (b.beds || 0) - (a.beds || 0);
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

  const selected = properties.find(p => p.id === selectedId);

  return (
    <div className="prop-page">

      {/* Header */}
      <div className="prop-page__hdr">
        <div className="prop-page__hdr-left">
          <Building2 size={22} />
          <h1 className="prop-page__title">Properties</h1>
          <span className="prop-page__count">{properties.length}</span>
        </div>
        <div className="prop-page__actions">
          <button className="prop-btn-guesty" onClick={() => alert('Guesty sync coming soon!')}>
            <RefreshCw size={14} /> Sync from Guesty
          </button>
          <button className="prop-btn-import" onClick={() => { setShowAddForm(s => !s); setSelectedId(null); }}>
            <Plus size={14} /> {showAddForm ? 'Cancel' : 'Import Properties'}
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="prop-add-form-wrap">
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
              <input type="number" min="0" className="hr-form__input" placeholder="Bedrooms"
                value={form.beds} onChange={e => setForm(p => ({ ...p, beds: e.target.value }))} />
              <input type="number" min="0" step="0.5" className="hr-form__input" placeholder="Bathrooms"
                value={form.baths} onChange={e => setForm(p => ({ ...p, baths: e.target.value }))} />
            </div>
            <div className="hr-form__actions">
              <button type="submit" className="hr-portal__new-btn"><Plus size={16} /> Add Property</button>
              <button type="button" className="hr-form__cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="prop-search-wrap">
        <Search size={16} className="prop-search-icon" />
        <input className="prop-search-input"
          placeholder="Search properties by name or address..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="prop-search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
      </div>

      {/* Filters */}
      <div className="prop-filter-bar">
        <span className="prop-filter-bar__label"><SlidersHorizontal size={13} /> Filters:</span>
        <select className="prop-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="short-term">Short-Term</option>
          <option value="long-term">Long-Term</option>
          <option value="commercial">Commercial</option>
        </select>
        <select className="prop-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="setup">Setup</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="prop-filter-select" value={bedsFilter} onChange={e => setBedsFilter(e.target.value)}>
          <option value="all">All Beds</option>
          <option value="1">1+ Beds</option>
          <option value="2">2+ Beds</option>
          <option value="3">3+ Beds</option>
          <option value="4">4+ Beds</option>
        </select>
        <select className="prop-filter-select" value={bathsFilter} onChange={e => setBathsFilter(e.target.value)}>
          <option value="all">All Baths</option>
          <option value="1">1+ Baths</option>
          <option value="2">2+ Baths</option>
          <option value="3">3+ Baths</option>
        </select>
        <div className="prop-sort-wrap">
          <span className="prop-filter-bar__label">&#x2195; Sort:</span>
          <select className="prop-filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="status">Status</option>
            <option value="beds">Beds</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><Building2 size={28} /></div>
          <p>{properties.length === 0 ? 'No properties yet. Click "Import Properties" above to add your first.' : 'No properties match your filters.'}</p>
        </div>
      ) : (
        <div className="prop-grid">
          {filtered.map(prop => {
            const sc = STATUS_COLORS[prop.status] || STATUS_COLORS.inactive;
            const isSelected = selectedId === prop.id;
            return (
              <div key={prop.id} className={`prop-tile${isSelected ? ' prop-tile--selected' : ''}`} onClick={() => selectCard(prop.id)}>
                <div className="prop-tile__body">
                  <div className="prop-tile__top">
                    <span className="prop-tile__name">{prop.name}</span>
                    <button className="hr-list__delete" onClick={e => remove(prop.id, e)} title="Delete property">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {prop.address && (
                    <div className="prop-tile__addr">
                      <MapPin size={12} style={{ flexShrink: 0, marginTop: 1 }} /> {prop.address}
                    </div>
                  )}
                  <div className="prop-tile__specs">
                    <span className="prop-tile__spec"><BedDouble size={14} /> {prop.beds ?? 0} bed{(prop.beds ?? 0) !== 1 ? 's' : ''}</span>
                    <span className="prop-tile__spec"><Bath size={14} /> {prop.baths ?? 0} bath{(prop.baths ?? 0) !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="prop-tile__footer">
                  <span className="prop-tile__badge" style={{ background: sc.bg, color: sc.color }}>{prop.status}</span>
                  <span className="prop-tile__chevron">{isSelected ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="prop-detail-panel">
          <div className="prop-detail-panel__hdr">
            <span className="prop-detail-panel__title">{selected.name}</span>
            <button className="prop-detail-panel__close" onClick={() => setSelectedId(null)}><X size={16} /></button>
          </div>
          <div className="prop-tabs">
            <button className={`prop-tab${detailTab === 'orders' ? ' prop-tab--active' : ''}`} onClick={() => setDetailTab('orders')}>
              <ShoppingCart size={14} /> Orders ({selected.orders?.length || 0})
            </button>
            <button className={`prop-tab${detailTab === 'tasks' ? ' prop-tab--active' : ''}`} onClick={() => setDetailTab('tasks')}>
              <ClipboardList size={14} /> Setup Tasks ({selected.setupTasks?.length || 0})
            </button>
          </div>
          {detailTab === 'orders' && <OrdersPanel propertyId={selected.id} orders={selected.orders || []} onRefresh={load} />}
          {detailTab === 'tasks' && <SetupTasksPanel propertyId={selected.id} tasks={selected.setupTasks || []} onRefresh={load} />}
        </div>
      )}
    </div>
  );
}
