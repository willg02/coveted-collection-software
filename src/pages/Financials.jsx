import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../lib/apiClient';

const EXPENSE_CATS  = ['maintenance', 'supplies', 'marketing', 'utilities', 'payroll', 'other'];
const REVENUE_CATS  = ['rent', 'booking', 'service', 'other'];

const catColors = {
  maintenance: '#c2410c', supplies: '#1d4ed8', marketing: '#7e22ce',
  utilities: '#0369a1', payroll: '#15803d', rent: '#065f46',
  booking: '#1d4ed8', service: '#6d28d9', other: '#64748b',
};

/* ─────────────────────────────────────────
   Overview
───────────────────────────────────────── */
function OverviewView() {
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [revenues, setRevenues] = useState([]);

  useEffect(() => {
    api.getFinancialSummary().then(setSummary).catch(() => {});
    api.getExpenses().then(d => setExpenses(d.slice(0, 6))).catch(() => {});
    api.getRevenue().then(d => setRevenues(d.slice(0, 6))).catch(() => {});
  }, []);

  const totalRev = summary?.totalRevenue  || 0;
  const totalExp = summary?.totalExpenses || 0;
  const net      = totalRev - totalExp;

  const expByCat = expenses.reduce((m, e) => { m[e.category] = (m[e.category] || 0) + e.amount; return m; }, {});
  const maxCatVal = Math.max(1, ...Object.values(expByCat));

  return (
    <div>
      <div className="hr-time__grid" style={{ marginBottom: 28 }}>
        <div className="hr-time__box">
          <div className="hr-time__val">${totalRev.toLocaleString()}</div>
          <div className="hr-time__label" style={{ color: '#15803d' }}>Total Revenue</div>
        </div>
        <div className="hr-time__box">
          <div className="hr-time__val">${totalExp.toLocaleString()}</div>
          <div className="hr-time__label" style={{ color: '#c2410c' }}>Total Expenses</div>
        </div>
        <div className="hr-time__box">
          <div className="hr-time__val" style={{ color: net >= 0 ? '#15803d' : '#c2410c' }}>${net.toLocaleString()}</div>
          <div className="hr-time__label">Net Income</div>
        </div>
      </div>

      {Object.keys(expByCat).length > 0 && (
        <>
          <h3 className="hr-profile__section-title">Expenses by Category</h3>
          <div className="fin-cat-chart">
            {Object.entries(expByCat).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat} className="fin-cat-row">
                <span className="fin-cat-row__label">{cat}</span>
                <div className="fin-cat-row__bar-wrap">
                  <div className="fin-cat-row__bar" style={{ width: `${(amt / maxCatVal) * 100}%`, background: catColors[cat] || '#6366f1' }} />
                </div>
                <span className="fin-cat-row__val">${amt.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="fin-recent-grid">
        <div>
          <h3 className="hr-profile__section-title"><TrendingDown size={16} color="#c2410c" /> Recent Expenses</h3>
          {expenses.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 13 }}>None yet.</p> : (
            <div className="hr-list" style={{ marginTop: 8 }}>
              {expenses.map(e => (
                <div className="hr-list__item" key={e.id}>
                  <div className="hr-list__main">
                    <span className="hr-list__name">{e.title}</span>
                    <div className="hr-list__meta">
                      <span className="hr-badge" style={{ background: '#fff7ed', color: catColors[e.category] || '#64748b' }}>{e.category}</span>
                      <span className="hr-badge" style={{ background: '#f1f5f9', color: '#475569' }}>${e.amount.toLocaleString()}</span>
                      <span className="hr-badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>{e.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="hr-profile__section-title"><TrendingUp size={16} color="#15803d" /> Recent Revenue</h3>
          {revenues.length === 0 ? <p style={{ color: '#94a3b8', fontSize: 13 }}>None yet.</p> : (
            <div className="hr-list" style={{ marginTop: 8 }}>
              {revenues.map(r => (
                <div className="hr-list__item" key={r.id}>
                  <div className="hr-list__main">
                    <span className="hr-list__name">{r.title}</span>
                    <div className="hr-list__meta">
                      <span className="hr-badge" style={{ background: '#f0fdf4', color: catColors[r.category] || '#64748b' }}>{r.category}</span>
                      <span className="hr-badge" style={{ background: '#f1f5f9', color: '#475569' }}>${r.amount.toLocaleString()}</span>
                      <span className="hr-badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>{r.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Expenses view
───────────────────────────────────────── */
function ExpensesView() {
  const [expenses, setExpenses] = useState([]);
  const [catFilter, setCatFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', category: 'other', date: new Date().toISOString().split('T')[0], notes: '' });

  const load = useCallback(() => {
    api.getExpenses().then(setExpenses).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const submit = async (e) => {
    e.preventDefault();
    await api.createExpense({ ...form, amount: parseFloat(form.amount) });
    setForm({ title: '', amount: '', category: 'other', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    await api.deleteExpense(id);
    load();
  };

  const filtered = catFilter === 'all' ? expenses : expenses.filter(e => e.category === catFilter);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className="ops-filter-row">
        {['all', ...EXPENSE_CATS].map(c => (
          <button key={c} className={`hr-tasks__filter${catFilter === c ? ' hr-tasks__filter--active' : ''}`}
            onClick={() => setCatFilter(c)}>
            {c}
          </button>
        ))}
        <button className="hr-portal__new-btn" style={{ marginLeft: 'auto', marginBottom: 0 }} onClick={() => setShowForm(s => !s)}>
          <Plus size={16} /> Add
        </button>
      </div>

      {showForm && (
        <form className="hr-form" onSubmit={submit} style={{ marginBottom: 20 }}>
          <div className="hr-form__row hr-form__row--split">
            <input className="hr-form__input" placeholder="Title *" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            <input type="number" min="0" step="0.01" className="hr-form__input" placeholder="Amount *"
              value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
          </div>
          <div className="hr-form__row hr-form__row--split">
            <select className="hr-form__input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" className="hr-form__input" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}>
              <Plus size={14} /> Save
            </button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {filtered.length > 0 && (
        <div className="fin-total-row">
          <span>Total ({catFilter === 'all' ? 'all categories' : catFilter})</span>
          <span style={{ color: '#c2410c', fontWeight: 700 }}>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      )}

      <div className="hr-list">
        {filtered.map(e => (
          <div className="hr-list__item" key={e.id}>
            <div className="hr-list__main">
              <span className="hr-list__name">{e.title}</span>
              <div className="hr-list__meta">
                <span className="hr-badge" style={{ background: '#fff7ed', color: catColors[e.category] || '#64748b' }}>{e.category}</span>
                <span className="hr-badge" style={{ background: '#f1f5f9', color: '#c2410c', fontWeight: 600 }}>${e.amount.toLocaleString()}</span>
                <span className="hr-badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>{e.date}</span>
              </div>
            </div>
            <button className="hr-list__delete" onClick={() => remove(e.id)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Revenue view
───────────────────────────────────────── */
function RevenueView() {
  const [revenues, setRevenues] = useState([]);
  const [catFilter, setCatFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', category: 'rent', date: new Date().toISOString().split('T')[0], notes: '' });

  const load = useCallback(() => {
    api.getRevenue().then(setRevenues).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const submit = async (e) => {
    e.preventDefault();
    await api.createRevenue({ ...form, amount: parseFloat(form.amount) });
    setForm({ title: '', amount: '', category: 'rent', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    await api.deleteRevenue(id);
    load();
  };

  const filtered = catFilter === 'all' ? revenues : revenues.filter(r => r.category === catFilter);
  const total = filtered.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <div className="ops-filter-row">
        {['all', ...REVENUE_CATS].map(c => (
          <button key={c} className={`hr-tasks__filter${catFilter === c ? ' hr-tasks__filter--active' : ''}`}
            onClick={() => setCatFilter(c)}>
            {c}
          </button>
        ))}
        <button className="hr-portal__new-btn" style={{ marginLeft: 'auto', marginBottom: 0 }} onClick={() => setShowForm(s => !s)}>
          <Plus size={16} /> Add
        </button>
      </div>

      {showForm && (
        <form className="hr-form" onSubmit={submit} style={{ marginBottom: 20 }}>
          <div className="hr-form__row hr-form__row--split">
            <input className="hr-form__input" placeholder="Title *" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            <input type="number" min="0" step="0.01" className="hr-form__input" placeholder="Amount *"
              value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
          </div>
          <div className="hr-form__row hr-form__row--split">
            <select className="hr-form__input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {REVENUE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" className="hr-form__input" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}>
              <Plus size={14} /> Save
            </button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {filtered.length > 0 && (
        <div className="fin-total-row">
          <span>Total ({catFilter === 'all' ? 'all categories' : catFilter})</span>
          <span style={{ color: '#15803d', fontWeight: 700 }}>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      )}

      <div className="hr-list">
        {filtered.map(r => (
          <div className="hr-list__item" key={r.id}>
            <div className="hr-list__main">
              <span className="hr-list__name">{r.title}</span>
              <div className="hr-list__meta">
                <span className="hr-badge" style={{ background: '#f0fdf4', color: catColors[r.category] || '#64748b' }}>{r.category}</span>
                <span className="hr-badge" style={{ background: '#f1f5f9', color: '#15803d', fontWeight: 600 }}>${r.amount.toLocaleString()}</span>
                <span className="hr-badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>{r.date}</span>
              </div>
            </div>
            <button className="hr-list__delete" onClick={() => remove(r.id)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   View registry & Financials portal shell
───────────────────────────────────────── */
const views = {
  overview: { label: 'Overview',  icon: DollarSign,   component: OverviewView  },
  expenses: { label: 'Expenses',  icon: TrendingDown, component: ExpensesView  },
  revenue:  { label: 'Revenue',   icon: TrendingUp,   component: RevenueView   },
};

export default function Financials() {
  const [activeView, setActiveView] = useState('overview');
  const ActiveComponent = views[activeView].component;

  return (
    <div className="hr-portal">
      <aside className="hr-portal__sidebar">
        <div className="hr-portal__sidebar-header">
          <h2 className="hr-portal__sidebar-title">Financials</h2>
          <span className="hr-portal__sidebar-subtitle">Income &amp; Expenses</span>
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
