import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DollarSign, Plus, Trash2, TrendingUp, TrendingDown,
  Calendar, Clock, CheckCircle, Users, Download,
  BarChart3, FileText, Truck, ClipboardList,
} from 'lucide-react';
import api from '../lib/apiClient';

const EXPENSE_CATS = ['maintenance', 'supplies', 'marketing', 'utilities', 'payroll', 'other'];
const REVENUE_CATS = ['rent', 'booking', 'service', 'other'];

const catColors = {
  maintenance: '#c2410c', supplies: '#1d4ed8', marketing: '#7e22ce',
  utilities: '#0369a1', payroll: '#15803d', rent: '#065f46',
  booking: '#1d4ed8', service: '#6d28d9', other: '#64748b',
};

/* ── helper: date range presets ── */
function thisMonth() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return { start: `${y}-${m}-01`, end: `${y}-${m}-${new Date(y, now.getMonth() + 1, 0).getDate()}` };
}

function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${m}/${day}/${y}`;
}

/* ═══════════════════════════════════════════════════════════
     TAB 1 — Portfolio Overview
   ═══════════════════════════════════════════════════════════ */

const TIMEFRAMES = ['All Time', 'This Month', 'This Quarter', 'This Year'];

function PortfolioOverview() {
  const [timeframe, setTimeframe] = useState('All Time');
  const [portfolio, setPortfolio] = useState(null);
  const [subTab, setSubTab] = useState('overview');
  const [expenses, setExpenses] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [showExpForm, setShowExpForm] = useState(false);
  const [showRevForm, setShowRevForm] = useState(false);
  const [expForm, setExpForm] = useState({ title: '', amount: '', category: 'other', date: new Date().toISOString().split('T')[0], notes: '' });
  const [revForm, setRevForm] = useState({ title: '', amount: '', category: 'rent', date: new Date().toISOString().split('T')[0], notes: '' });

  const dateRange = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    if (timeframe === 'This Month') return thisMonth();
    if (timeframe === 'This Quarter') {
      const qStart = new Date(y, Math.floor(m / 3) * 3, 1);
      const qEnd   = new Date(y, Math.floor(m / 3) * 3 + 3, 0);
      return { start: qStart.toISOString().slice(0, 10), end: qEnd.toISOString().slice(0, 10) };
    }
    if (timeframe === 'This Year') return { start: `${y}-01-01`, end: `${y}-12-31` };
    return { start: null, end: null };
  }, [timeframe]);

  const load = useCallback(() => {
    api.getPortfolio(dateRange.start, dateRange.end).then(setPortfolio).catch(() => {});
    api.getExpenses().then(setExpenses).catch(() => {});
    api.getRevenue().then(setRevenues).catch(() => {});
  }, [dateRange]);
  useEffect(load, [load]);

  const p = portfolio || {};
  const totalIncome  = p.totalIncome   ?? 0;
  const totalExp     = p.totalExpenses ?? 0;
  const netProfit    = p.netProfit     ?? 0;
  const profitMargin = p.profitMargin  ?? 0;
  const props        = p.propertyBreakdown || [];
  const monthly      = p.monthly || [];

  /* chart helpers */
  const maxChartVal = Math.max(1, ...props.map(pp => Math.max(pp.income, pp.expenses, Math.abs(pp.netProfit))));

  const submitExpense = async (e) => {
    e.preventDefault();
    await api.createExpense({ ...expForm, amount: parseFloat(expForm.amount) });
    setExpForm({ title: '', amount: '', category: 'other', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowExpForm(false);
    load();
  };
  const submitRevenue = async (e) => {
    e.preventDefault();
    await api.createRevenue({ ...revForm, amount: parseFloat(revForm.amount) });
    setRevForm({ title: '', amount: '', category: 'rent', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowRevForm(false);
    load();
  };
  const removeExp = async (id) => { await api.deleteExpense(id); load(); };
  const removeRev = async (id) => { await api.deleteRevenue(id); load(); };

  const ranked = [...props].sort((a, b) => b.netProfit - a.netProfit);

  return (
    <div>
      <h2 className="fin-section-title">Portfolio Financials</h2>
      <p className="fin-section-sub">Comprehensive financial overview across all properties</p>

      {/* Timeframe selector */}
      <div className="fin-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Calendar size={16} style={{ color: '#64748b' }} />
          <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Timeframe:</span>
          <select className="fin-select" value={timeframe} onChange={e => setTimeframe(e.target.value)}>
            {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* 4 Summary cards */}
      <div className="fin-summary-row">
        <div className="fin-summary-card">
          <div className="fin-summary-card__label">Total Income</div>
          <div className="fin-summary-card__val" style={{ color: '#15803d' }}>${totalIncome.toLocaleString()}</div>
          <TrendingUp size={20} className="fin-summary-card__icon" style={{ color: '#15803d' }} />
        </div>
        <div className="fin-summary-card">
          <div className="fin-summary-card__label">Total Expenses</div>
          <div className="fin-summary-card__val" style={{ color: '#dc2626' }}>${totalExp.toLocaleString()}</div>
          <TrendingDown size={20} className="fin-summary-card__icon" style={{ color: '#dc2626' }} />
        </div>
        <div className="fin-summary-card">
          <div className="fin-summary-card__label">Net Profit</div>
          <div className="fin-summary-card__val" style={{ color: netProfit >= 0 ? '#15803d' : '#dc2626' }}>
            ${netProfit.toLocaleString()}
          </div>
          <DollarSign size={20} className="fin-summary-card__icon" style={{ color: '#475569' }} />
        </div>
        <div className="fin-summary-card">
          <div className="fin-summary-card__label">Profit Margin</div>
          <div className="fin-summary-card__val" style={{ color: '#475569' }}>{profitMargin}%</div>
          <TrendingUp size={20} className="fin-summary-card__icon" style={{ color: '#3b82f6' }} />
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="fin-subtabs">
        {['overview', 'detailed', 'monthly', 'unit-economics', 'financial-reports', 'owner-hub'].map(t => (
          <button key={t} className={`fin-subtab${subTab === t ? ' fin-subtab--active' : ''}`} onClick={() => setSubTab(t)}>
            {{ overview: 'Overview', detailed: 'Detailed Breakdown', monthly: 'Monthly View', 'unit-economics': 'Unit Economics', 'financial-reports': 'Financial Reports', 'owner-hub': 'Owner Hub' }[t]}
          </button>
        ))}
      </div>

      {/* ── Sub-tab content ── */}

      {subTab === 'overview' && (
        <>
          {/* Property Performance bar chart */}
          <div className="fin-card" style={{ marginBottom: 20 }}>
            <h3 className="fin-card__title">Property Performance</h3>
            {props.length === 0 ? <p className="fin-empty">No property data yet.</p> : (
              <div className="fin-bar-chart">
                <div className="fin-bar-chart__y-axis">
                  {[100, 50, 0, -50, -100].map(v => (
                    <span key={v} className="fin-bar-chart__y-label">{v === 0 ? '0' : `${v > 0 ? '' : ''}${Math.round(maxChartVal * v / 100).toLocaleString()}`}</span>
                  ))}
                </div>
                <div className="fin-bar-chart__bars">
                  {props.map(pp => (
                    <div key={pp.id} className="fin-bar-chart__group">
                      <div className="fin-bar-chart__col">
                        <div className="fin-bar-chart__bar fin-bar-chart__bar--income"
                          style={{ height: `${Math.max(1, (pp.income / maxChartVal) * 100)}%` }} title={`Income: $${pp.income.toLocaleString()}`} />
                        <div className="fin-bar-chart__bar fin-bar-chart__bar--expense"
                          style={{ height: `${Math.max(1, (pp.expenses / maxChartVal) * 100)}%` }} title={`Expenses: $${pp.expenses.toLocaleString()}`} />
                        <div className={`fin-bar-chart__bar ${pp.netProfit >= 0 ? 'fin-bar-chart__bar--profit-pos' : 'fin-bar-chart__bar--profit-neg'}`}
                          style={{ height: `${Math.max(1, (Math.abs(pp.netProfit) / maxChartVal) * 100)}%` }} title={`Net: $${pp.netProfit.toLocaleString()}`} />
                      </div>
                      <span className="fin-bar-chart__x-label">{pp.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="fin-bar-legend">
              <span><span className="fin-legend-dot" style={{ background: '#10b981' }} /> Income</span>
              <span><span className="fin-legend-dot" style={{ background: '#ef4444' }} /> Expenses</span>
              <span><span className="fin-legend-dot" style={{ background: '#3b82f6' }} /> Net Profit</span>
            </div>
          </div>

          {/* Property Rankings by Profit */}
          <div className="fin-card">
            <h3 className="fin-card__title">Property Rankings by Profit</h3>
            {ranked.length === 0 ? <p className="fin-empty">No properties.</p> : (
              <div className="fin-rankings">
                {ranked.map((pp, i) => (
                  <div key={pp.id} className="fin-rank-row">
                    <span className="fin-rank-badge">{i + 1}</span>
                    <div className="fin-rank-info">
                      <span className="fin-rank-name">{pp.name}</span>
                      <span className="fin-rank-meta">Income: ${pp.income.toLocaleString()} &bull; Expenses: ${pp.expenses.toLocaleString()}</span>
                    </div>
                    <span className={`fin-rank-profit ${pp.netProfit >= 0 ? 'fin-rank-profit--pos' : 'fin-rank-profit--neg'}`}>
                      ${pp.netProfit.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {subTab === 'detailed' && (
        <>
          {/* Expense list + add */}
          <div className="fin-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="fin-card__title" style={{ margin: 0 }}>Expenses</h3>
              <button className="hr-portal__new-btn" style={{ marginBottom: 0 }} onClick={() => setShowExpForm(s => !s)}><Plus size={14} /> Add</button>
            </div>
            {showExpForm && (
              <form className="hr-form" onSubmit={submitExpense} style={{ marginBottom: 14 }}>
                <div className="hr-form__row hr-form__row--split">
                  <input className="hr-form__input" placeholder="Title *" value={expForm.title} onChange={e => setExpForm(p => ({ ...p, title: e.target.value }))} required />
                  <input type="number" min="0" step="0.01" className="hr-form__input" placeholder="Amount *" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} required />
                </div>
                <div className="hr-form__row hr-form__row--split">
                  <select className="hr-form__input" value={expForm.category} onChange={e => setExpForm(p => ({ ...p, category: e.target.value }))}>
                    {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="date" className="hr-form__input" value={expForm.date} onChange={e => setExpForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="hr-form__actions">
                  <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}><Plus size={14} /> Save</button>
                  <button type="button" className="hr-form__cancel" onClick={() => setShowExpForm(false)}>Cancel</button>
                </div>
              </form>
            )}
            {expenses.length === 0 ? <p className="fin-empty">No expenses yet.</p> : (
              <div className="hr-list">
                {expenses.map(e => (
                  <div className="hr-list__item" key={e.id}>
                    <div className="hr-list__main">
                      <span className="hr-list__name">{e.title}</span>
                      <div className="hr-list__meta">
                        <span className="hr-badge" style={{ background: '#fff7ed', color: catColors[e.category] || '#64748b' }}>{e.category}</span>
                        <span className="hr-badge" style={{ background: '#f1f5f9', color: '#c2410c', fontWeight: 600 }}>${e.amount.toLocaleString()}</span>
                        <span className="hr-badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>{e.date}</span>
                      </div>
                    </div>
                    <button className="hr-list__delete" onClick={() => removeExp(e.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revenue list + add */}
          <div className="fin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="fin-card__title" style={{ margin: 0 }}>Revenue</h3>
              <button className="hr-portal__new-btn" style={{ marginBottom: 0 }} onClick={() => setShowRevForm(s => !s)}><Plus size={14} /> Add</button>
            </div>
            {showRevForm && (
              <form className="hr-form" onSubmit={submitRevenue} style={{ marginBottom: 14 }}>
                <div className="hr-form__row hr-form__row--split">
                  <input className="hr-form__input" placeholder="Title *" value={revForm.title} onChange={e => setRevForm(p => ({ ...p, title: e.target.value }))} required />
                  <input type="number" min="0" step="0.01" className="hr-form__input" placeholder="Amount *" value={revForm.amount} onChange={e => setRevForm(p => ({ ...p, amount: e.target.value }))} required />
                </div>
                <div className="hr-form__row hr-form__row--split">
                  <select className="hr-form__input" value={revForm.category} onChange={e => setRevForm(p => ({ ...p, category: e.target.value }))}>
                    {REVENUE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="date" className="hr-form__input" value={revForm.date} onChange={e => setRevForm(p => ({ ...p, date: e.target.value }))} />
                </div>
                <div className="hr-form__actions">
                  <button type="submit" className="hr-portal__new-btn" style={{ marginBottom: 0 }}><Plus size={14} /> Save</button>
                  <button type="button" className="hr-form__cancel" onClick={() => setShowRevForm(false)}>Cancel</button>
                </div>
              </form>
            )}
            {revenues.length === 0 ? <p className="fin-empty">No revenue yet.</p> : (
              <div className="hr-list">
                {revenues.map(r => (
                  <div className="hr-list__item" key={r.id}>
                    <div className="hr-list__main">
                      <span className="hr-list__name">{r.title}</span>
                      <div className="hr-list__meta">
                        <span className="hr-badge" style={{ background: '#f0fdf4', color: catColors[r.category] || '#64748b' }}>{r.category}</span>
                        <span className="hr-badge" style={{ background: '#f1f5f9', color: '#15803d', fontWeight: 600 }}>${r.amount.toLocaleString()}</span>
                        <span className="hr-badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>{r.date}</span>
                      </div>
                    </div>
                    <button className="hr-list__delete" onClick={() => removeRev(r.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {subTab === 'monthly' && (
        <div className="fin-card">
          <h3 className="fin-card__title">Monthly Breakdown</h3>
          {monthly.length === 0 ? <p className="fin-empty">No monthly data yet.</p> : (
            <div className="fin-table-wrap">
              <table className="fin-table">
                <thead>
                  <tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net</th></tr>
                </thead>
                <tbody>
                  {monthly.map(m => (
                    <tr key={m.month}>
                      <td>{m.month}</td>
                      <td style={{ color: '#15803d' }}>${m.income.toLocaleString()}</td>
                      <td style={{ color: '#dc2626' }}>${m.expenses.toLocaleString()}</td>
                      <td style={{ color: m.income - m.expenses >= 0 ? '#15803d' : '#dc2626', fontWeight: 600 }}>
                        ${(m.income - m.expenses).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {subTab === 'unit-economics' && (
        <div className="fin-card">
          <h3 className="fin-card__title">Unit Economics</h3>
          {props.length === 0 ? <p className="fin-empty">Add properties and financial data to see unit economics.</p> : (
            <div className="fin-table-wrap">
              <table className="fin-table">
                <thead>
                  <tr><th>Property</th><th>Income</th><th>Expenses</th><th>Net Profit</th><th>Margin</th></tr>
                </thead>
                <tbody>
                  {props.map(pp => {
                    const margin = pp.income > 0 ? Math.round(((pp.income - pp.expenses) / pp.income) * 100) : 0;
                    return (
                      <tr key={pp.id}>
                        <td>{pp.name}</td>
                        <td style={{ color: '#15803d' }}>${pp.income.toLocaleString()}</td>
                        <td style={{ color: '#dc2626' }}>${pp.expenses.toLocaleString()}</td>
                        <td style={{ color: pp.netProfit >= 0 ? '#15803d' : '#dc2626', fontWeight: 600 }}>${pp.netProfit.toLocaleString()}</td>
                        <td>{margin}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {subTab === 'financial-reports' && (
        <div className="fin-card">
          <h3 className="fin-card__title">Financial Reports</h3>
          <div className="fin-cat-chart" style={{ marginTop: 12 }}>
            <h4 style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>Expenses by Category</h4>
            {Object.keys(p.expByCategory || {}).length === 0 ? <p className="fin-empty">No expense data.</p> : (
              Object.entries(p.expByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                const max = Math.max(1, ...Object.values(p.expByCategory));
                return (
                  <div key={cat} className="fin-cat-row">
                    <span className="fin-cat-row__label">{cat}</span>
                    <div className="fin-cat-row__bar-wrap">
                      <div className="fin-cat-row__bar" style={{ width: `${(amt / max) * 100}%`, background: catColors[cat] || '#6366f1' }} />
                    </div>
                    <span className="fin-cat-row__val">${amt.toLocaleString()}</span>
                  </div>
                );
              })
            )}
            <h4 style={{ fontSize: 13, color: '#475569', marginBottom: 8, marginTop: 20 }}>Revenue by Category</h4>
            {Object.keys(p.revByCategory || {}).length === 0 ? <p className="fin-empty">No revenue data.</p> : (
              Object.entries(p.revByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                const max = Math.max(1, ...Object.values(p.revByCategory));
                return (
                  <div key={cat} className="fin-cat-row">
                    <span className="fin-cat-row__label">{cat}</span>
                    <div className="fin-cat-row__bar-wrap">
                      <div className="fin-cat-row__bar" style={{ width: `${(amt / max) * 100}%`, background: catColors[cat] || '#15803d' }} />
                    </div>
                    <span className="fin-cat-row__val">${amt.toLocaleString()}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {subTab === 'owner-hub' && (
        <div className="fin-card">
          <h3 className="fin-card__title">Owner Hub</h3>
          <p className="fin-empty">Owner distributions and statements — coming soon.</p>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
     TAB 2 — Payment & Payroll Hub
   ═══════════════════════════════════════════════════════════ */

function PaymentPayroll() {
  const tm = thisMonth();
  const [start, setStart] = useState(tm.start);
  const [end, setEnd]     = useState(tm.end);
  const [payTab, setPayTab] = useState('pending');
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);

  const load = useCallback(() => {
    api.getExpenses().then(setExpenses).catch(() => {});
    api.getAllUsers().then(setUsers).catch(() => {});
  }, []);
  useEffect(load, [load]);

  // Derive payroll-relevant items (payroll category expenses in date range)
  const payrollItems = expenses.filter(e =>
    e.category === 'payroll' && e.date >= start && e.date <= end
  );

  // Simulate status buckets — for now all payroll items are "pending"
  const pending  = payrollItems;
  const approved = [];
  const paid     = [];

  const totalPending  = pending.reduce((s, e) => s + e.amount, 0);
  const totalApproved = approved.reduce((s, e) => s + e.amount, 0);
  const totalPaid     = paid.reduce((s, e) => s + e.amount, 0);

  const activeList = { pending, approved, paid }[payTab] || [];

  return (
    <div>
      <h2 className="fin-section-title">Payment & Payroll Hub</h2>
      <p className="fin-section-sub">Auto-updated staff payments and payroll</p>

      {/* Date range */}
      <div className="fin-card" style={{ marginBottom: 20 }}>
        <div className="fin-date-row">
          <div className="fin-date-field">
            <label className="fin-date-label">Start Date</label>
            <input type="date" className="fin-date-input" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div className="fin-date-field">
            <label className="fin-date-label">End Date</label>
            <input type="date" className="fin-date-input" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <button className="fin-btn-outline" onClick={() => { const t = thisMonth(); setStart(t.start); setEnd(t.end); }}>This Month</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="fin-summary-row">
        <div className="fin-summary-card">
          <Clock size={22} style={{ color: '#ea580c' }} />
          <div className="fin-summary-card__val" style={{ color: '#0f172a' }}>${totalPending.toLocaleString()}</div>
          <div className="fin-summary-card__label">Pending</div>
        </div>
        <div className="fin-summary-card">
          <CheckCircle size={22} style={{ color: '#2563eb' }} />
          <div className="fin-summary-card__val" style={{ color: '#0f172a' }}>${totalApproved.toLocaleString()}</div>
          <div className="fin-summary-card__label">Approved</div>
        </div>
        <div className="fin-summary-card">
          <DollarSign size={22} style={{ color: '#15803d' }} />
          <div className="fin-summary-card__val" style={{ color: '#0f172a' }}>${totalPaid.toLocaleString()}</div>
          <div className="fin-summary-card__label">Paid</div>
        </div>
        <div className="fin-summary-card">
          <Users size={22} style={{ color: '#475569' }} />
          <div className="fin-summary-card__val" style={{ color: '#0f172a' }}>{users.length}</div>
          <div className="fin-summary-card__label">Staff</div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="fin-subtabs" style={{ marginBottom: 16 }}>
        {['pending', 'approved', 'paid'].map(t => (
          <button key={t} className={`fin-subtab${payTab === t ? ' fin-subtab--active' : ''}`} onClick={() => setPayTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({({ pending, approved, paid }[t] || []).length})
          </button>
        ))}
      </div>

      <div className="fin-card">
        <h3 className="fin-card__title">{payTab.charAt(0).toUpperCase() + payTab.slice(1)} Payments</h3>
        {activeList.length === 0 ? (
          <p className="fin-empty">No {payTab} payments</p>
        ) : (
          <div className="hr-list">
            {activeList.map(item => (
              <div className="hr-list__item" key={item.id}>
                <div className="hr-list__main">
                  <span className="hr-list__name">{item.title}</span>
                  <div className="hr-list__meta">
                    <span className="hr-badge" style={{ background: '#f1f5f9', color: '#475569' }}>${item.amount.toLocaleString()}</span>
                    <span className="hr-badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
     TAB 3 — Custom Reports
   ═══════════════════════════════════════════════════════════ */

function CustomReports() {
  const tm = thisMonth();
  const [start, setStart] = useState(tm.start);
  const [end, setEnd]     = useState(tm.end);
  const [reportTab, setReportTab] = useState('employee');
  const [perfData, setPerfData] = useState([]);

  useEffect(() => {
    api.getEmployeePerformance(start, end).then(setPerfData).catch(() => setPerfData([]));
  }, [start, end]);

  const downloadCSV = () => {
    if (perfData.length === 0) return;
    const header = 'Employee,Total Jobs,Completed,Completion Rate,Avg Rating,Reviews\n';
    const rows = perfData.map(r => `"${r.name}",${r.totalJobs},${r.completed},${r.completionRate}%,${r.avgRating},${r.reviews}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `employee-performance-${start}-to-${end}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 className="fin-section-title">Custom Reports</h2>
      <p className="fin-section-sub">Generate detailed reports and analytics</p>

      {/* Date range */}
      <div className="fin-card" style={{ marginBottom: 20 }}>
        <div className="fin-date-row">
          <div className="fin-date-field">
            <label className="fin-date-label">Start Date</label>
            <input type="date" className="fin-date-input" value={start} onChange={e => setStart(e.target.value)} />
          </div>
          <div className="fin-date-field">
            <label className="fin-date-label">End Date</label>
            <input type="date" className="fin-date-input" value={end} onChange={e => setEnd(e.target.value)} />
          </div>
          <button className="fin-btn-outline" onClick={() => { const t = thisMonth(); setStart(t.start); setEnd(t.end); }}>This Month</button>
        </div>
      </div>

      {/* Report type tabs */}
      <div className="fin-subtabs" style={{ marginBottom: 16 }}>
        <button className={`fin-subtab${reportTab === 'employee' ? ' fin-subtab--active' : ''}`} onClick={() => setReportTab('employee')}>
          <Users size={14} /> Employee Performance
        </button>
        <button className={`fin-subtab${reportTab === 'cleaning' ? ' fin-subtab--active' : ''}`} onClick={() => setReportTab('cleaning')}>
          <CheckCircle size={14} /> Cleaning Reports
        </button>
        <button className={`fin-subtab${reportTab === 'payroll' ? ' fin-subtab--active' : ''}`} onClick={() => setReportTab('payroll')}>
          <DollarSign size={14} /> Payroll & Tax Forms
        </button>
        <button className={`fin-subtab${reportTab === 'route' ? ' fin-subtab--active' : ''}`} onClick={() => setReportTab('route')}>
          <Truck size={14} /> Route Efficiency
        </button>
      </div>

      {/* Report content */}
      {reportTab === 'employee' && (
        <div className="fin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="fin-card__title" style={{ margin: 0 }}>Employee Performance Report</h3>
            <button className="fin-btn-dark" onClick={downloadCSV}><Download size={14} /> Download CSV</button>
          </div>
          <div className="fin-table-wrap">
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Total Jobs</th>
                  <th>Completed</th>
                  <th>Completion Rate</th>
                  <th>Avg Rating</th>
                  <th>Reviews</th>
                </tr>
              </thead>
              <tbody>
                {perfData.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>No data for this period</td></tr>
                ) : perfData.map(r => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.totalJobs}</td>
                    <td>{r.completed}</td>
                    <td>{r.completionRate}%</td>
                    <td>{r.avgRating}</td>
                    <td>{r.reviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'cleaning' && (
        <div className="fin-card">
          <h3 className="fin-card__title">Cleaning Reports</h3>
          <p className="fin-empty">Cleaning turn reports — coming soon.</p>
        </div>
      )}

      {reportTab === 'payroll' && (
        <div className="fin-card">
          <h3 className="fin-card__title">Payroll & Tax Forms</h3>
          <p className="fin-empty">Payroll summaries and tax form generation — coming soon.</p>
        </div>
      )}

      {reportTab === 'route' && (
        <div className="fin-card">
          <h3 className="fin-card__title">Route Efficiency</h3>
          <p className="fin-empty">Route optimization analytics — coming soon.</p>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
     Main Financials shell — top-level tabs
   ═══════════════════════════════════════════════════════════ */

const TOP_TABS = [
  { key: 'portfolio', label: 'Portfolio Overview' },
  { key: 'payroll',   label: 'Payment & Payroll' },
  { key: 'reports',   label: 'Custom Reports' },
];

export default function Financials() {
  const [tab, setTab] = useState('portfolio');

  return (
    <div className="fin-page">
      {/* Top-level tab bar */}
      <div className="fin-top-tabs">
        {TOP_TABS.map(t => (
          <button key={t.key} className={`fin-top-tab${tab === t.key ? ' fin-top-tab--active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="fin-tab-content">
        {tab === 'portfolio' && <PortfolioOverview />}
        {tab === 'payroll'   && <PaymentPayroll />}
        {tab === 'reports'   && <CustomReports />}
      </div>
    </div>
  );
}
