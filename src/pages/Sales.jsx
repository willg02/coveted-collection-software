import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Plus, Trash2, ChevronRight } from 'lucide-react';
import api from '../lib/apiClient';

const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

const stageColors = {
  new:       { bg: '#f1f5f9', color: '#475569' },
  contacted: { bg: '#eff6ff', color: '#1d4ed8' },
  qualified: { bg: '#fff7ed', color: '#c2410c' },
  proposal:  { bg: '#fdf4ff', color: '#7e22ce' },
  won:       { bg: '#f0fdf4', color: '#15803d' },
  lost:      { bg: '#fef2f2', color: '#b91c1c' },
};

function StageBadge({ stage }) {
  const s = stageColors[stage] || stageColors.new;
  return (
    <span className="hr-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}22` }}>
      {stage}
    </span>
  );
}

const EMPTY_FORM = { name: '', email: '', phone: '', source: '', stage: 'new', value: '', notes: '' };

/* ─────────────────────────────────────────
   Pipeline / Kanban view
───────────────────────────────────────── */
function PipelineView({ leads, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const submit = async (e) => {
    e.preventDefault();
    await api.createLead({ ...form, value: form.value ? parseFloat(form.value) : 0 });
    setForm(EMPTY_FORM);
    setShowForm(false);
    onRefresh();
  };

  const advance = async (lead) => {
    const idx = STAGES.indexOf(lead.stage);
    if (idx >= STAGES.length - 1) return;
    await api.updateLead(lead.id, { stage: STAGES[idx + 1] });
    onRefresh();
  };

  const remove = async (id) => {
    if (!confirm('Remove this lead?')) return;
    await api.deleteLead(id);
    onRefresh();
  };

  const activeLeads = leads.filter(l => l.stage !== 'lost');
  const totalValue  = activeLeads.reduce((s, l) => s + (l.value || 0), 0);
  const wonValue    = leads.filter(l => l.stage === 'won').reduce((s, l) => s + (l.value || 0), 0);

  return (
    <div>
      <div className="sales-stats">
        <div className="hr-time__box"><div className="hr-time__val">{leads.length}</div><div className="hr-time__label">Total Leads</div></div>
        <div className="hr-time__box"><div className="hr-time__val">{activeLeads.length}</div><div className="hr-time__label">Active</div></div>
        <div className="hr-time__box"><div className="hr-time__val">{leads.filter(l => l.stage === 'won').length}</div><div className="hr-time__label">Won</div></div>
        <div className="hr-time__box"><div className="hr-time__val">${totalValue.toLocaleString()}</div><div className="hr-time__label">Pipeline</div></div>
        <div className="hr-time__box"><div className="hr-time__val">${wonValue.toLocaleString()}</div><div className="hr-time__label">Won Value</div></div>
      </div>

      {showForm ? (
        <form className="hr-form" onSubmit={submit}>
          <div className="hr-form__row hr-form__row--split">
            <input className="hr-form__input" placeholder="Contact name *" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            <input className="hr-form__input" placeholder="Email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="hr-form__row hr-form__row--split">
            <input className="hr-form__input" placeholder="Phone" value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <input className="hr-form__input" placeholder="Source (e.g. referral)" value={form.source}
              onChange={e => setForm(p => ({ ...p, source: e.target.value }))} />
          </div>
          <div className="hr-form__row hr-form__row--split">
            <select className="hr-form__input" value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" min="0" step="0.01" className="hr-form__input" placeholder="Value ($)"
              value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
          </div>
          <div className="hr-form__row">
            <input className="hr-form__input" placeholder="Notes" value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="hr-form__actions">
            <button type="submit" className="hr-portal__new-btn"><Plus size={14} /> Add Lead</button>
            <button type="button" className="hr-form__cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="hr-portal__new-btn" onClick={() => setShowForm(true)}><Plus size={18} /> Add Lead</button>
      )}

      <div className="sales-pipeline">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage);
          const sc = stageColors[stage];
          return (
            <div className="sales-column" key={stage}>
              <div className="sales-column__header" style={{ borderTop: `3px solid ${sc.color}` }}>
                <span style={{ color: sc.color, fontWeight: 600, textTransform: 'capitalize' }}>{stage}</span>
                <span className="hr-badge" style={{ background: sc.bg, color: sc.color }}>{stageLeads.length}</span>
              </div>
              <div className="sales-column__body">
                {stageLeads.map(lead => (
                  <div className="sales-card" key={lead.id}>
                    <div className="sales-card__name">{lead.name}</div>
                    {lead.value > 0 && <div className="sales-card__value">${lead.value.toLocaleString()}</div>}
                    {lead.source && <div className="sales-card__meta">via {lead.source}</div>}
                    <div className="sales-card__actions">
                      {stage !== 'won' && stage !== 'lost' && (
                        <button className="sales-card__advance" onClick={() => advance(lead)} title="Advance stage">
                          <ChevronRight size={13} /> Next
                        </button>
                      )}
                      <select
                        value={lead.stage}
                        onChange={async (e) => { await api.updateLead(lead.id, { stage: e.target.value }); onRefresh(); }}
                        className="sales-card__stage-select"
                      >
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="hr-list__delete" onClick={() => remove(lead.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && <div className="sales-card__empty">—</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   All Leads list
───────────────────────────────────────── */
function LeadsListView({ leads, onRefresh }) {
  const [stageFilter, setStageFilter] = useState('all');

  const remove = async (id) => {
    if (!confirm('Remove this lead?')) return;
    await api.deleteLead(id);
    onRefresh();
  };

  const filtered = stageFilter === 'all' ? leads : leads.filter(l => l.stage === stageFilter);

  return (
    <div>
      <div className="ops-filter-row">
        {['all', ...STAGES].map(s => (
          <button key={s} className={`hr-tasks__filter${stageFilter === s ? ' hr-tasks__filter--active' : ''}`}
            onClick={() => setStageFilter(s)}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="hr-portal__empty">
          <div className="hr-portal__empty-icon"><TrendingUp size={28} /></div>
          <p>No leads found.</p>
        </div>
      ) : (
        <div className="hr-list">
          {filtered.map(lead => (
            <div className="hr-list__item" key={lead.id}>
              <div className="hr-list__main">
                <span className="hr-list__name">{lead.name}</span>
                <div className="hr-list__meta">
                  <StageBadge stage={lead.stage} />
                  {lead.value > 0 && <span className="hr-badge" style={{ background: '#f1f5f9', color: '#475569' }}>${lead.value.toLocaleString()}</span>}
                  {lead.source && <span className="hr-badge" style={{ background: '#f1f5f9', color: '#475569' }}>via {lead.source}</span>}
                  {lead.email && <span className="hr-badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>{lead.email}</span>}
                </div>
              </div>
              <button className="hr-list__delete" onClick={() => remove(lead.id)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   View registry & Sales portal shell
───────────────────────────────────────── */
export default function Sales() {
  const [activeView, setActiveView] = useState('pipeline');
  const [leads, setLeads] = useState([]);

  const load = useCallback(() => {
    api.getLeads().then(setLeads).catch(() => {});
  }, []);
  useEffect(load, [load]);

  return (
    <div className="hr-portal">
      <aside className="hr-portal__sidebar">
        <div className="hr-portal__sidebar-header">
          <h2 className="hr-portal__sidebar-title">Sales</h2>
          <span className="hr-portal__sidebar-subtitle">CRM &amp; Pipeline</span>
        </div>
        <nav className="hr-portal__nav">
          {[['pipeline', TrendingUp, 'Pipeline'], ['leads', TrendingUp, 'All Leads']].map(([key, Icon, label]) => (
            <button key={key}
              className={`hr-portal__nav-link${activeView === key ? ' hr-portal__nav-link--active' : ''}`}
              onClick={() => setActiveView(key)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
      </aside>
      <section className="hr-portal__content">
        {activeView === 'pipeline' && <PipelineView leads={leads} onRefresh={load} />}
        {activeView === 'leads'    && <LeadsListView leads={leads} onRefresh={load} />}
      </section>
    </div>
  );
}
