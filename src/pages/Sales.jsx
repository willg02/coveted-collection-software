import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles, TrendingUp, FileText, Clock, Bell, Target, Shield,
  MapPin, Upload, Download, ChevronRight, Search,
} from 'lucide-react';
import api from '../lib/apiClient';

/* ── localStorage helpers for analysis history ── */
const LS_KEY = 'cc_analysis_history';
function getHistory() { try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; } }
function saveHistory(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }

const AMENITY_OPTIONS = ['Rooftop/Deck', 'Pool', 'Hot Tub', 'Parking', 'Gym/Fitness Center', 'Pet-Friendly'];

/* ═══════════════════════════════════════════════════════════
     TAB 1 — AI Pricing
   ═══════════════════════════════════════════════════════════ */
function AIPricingTab() {
  const [properties, setProperties] = useState([]);
  const [selected, setSelected]     = useState('');
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);

  useEffect(() => { api.getPropertiesV2().then(setProperties).catch(() => {}); }, []);

  const analyze = () => {
    if (!selected) return;
    setLoading(true);
    // Stub — will call OpenAI later
    setTimeout(() => {
      const prop = properties.find(p => p.id === selected);
      setResult({
        property: prop?.name || 'Unknown',
        suggestedNightly: Math.floor(Math.random() * 150) + 100,
        weekendPremium: '+15%',
        seasonalAdj: 'Summer +25%, Winter −10%',
        confidence: '72%',
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div>
      <h2 className="sales-section-title"><Sparkles size={20} style={{ color: '#7c3aed' }} /> AI Dynamic Pricing Engine</h2>
      <p className="sales-section-sub">Analyze market demand, competitor pricing, and local events for optimal rental rates</p>

      <div className="fin-card">
        <h3 className="fin-card__title">Select Property for Analysis</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="fin-select" style={{ flex: 1 }} value={selected} onChange={e => setSelected(e.target.value)}>
            <option value="">Choose a property...</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className="fin-btn-dark" onClick={analyze} disabled={!selected || loading}>
            <Sparkles size={14} /> {loading ? 'Analyzing...' : 'Analyze Pricing'}
          </button>
        </div>
      </div>

      {result && (
        <div className="fin-card" style={{ marginTop: 16 }}>
          <h3 className="fin-card__title">Pricing Recommendation — {result.property}</h3>
          <div className="fin-summary-row">
            <div className="fin-summary-card">
              <div className="fin-summary-card__label">Suggested Nightly</div>
              <div className="fin-summary-card__val" style={{ color: '#15803d' }}>${result.suggestedNightly}</div>
            </div>
            <div className="fin-summary-card">
              <div className="fin-summary-card__label">Weekend Premium</div>
              <div className="fin-summary-card__val" style={{ color: '#7c3aed' }}>{result.weekendPremium}</div>
            </div>
            <div className="fin-summary-card">
              <div className="fin-summary-card__label">Seasonal Adj.</div>
              <div className="fin-summary-card__val" style={{ fontSize: 14, color: '#475569' }}>{result.seasonalAdj}</div>
            </div>
            <div className="fin-summary-card">
              <div className="fin-summary-card__label">Confidence</div>
              <div className="fin-summary-card__val" style={{ color: '#2563eb' }}>{result.confidence}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
     TAB 2 — Analysis
   ═══════════════════════════════════════════════════════════ */
function AnalysisTab() {
  const [form, setForm] = useState({
    address: '', city: '', state: '', zip: '', beds: '', baths: '', amenities: [],
  });
  const [whatIf, setWhatIf] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleAmenity = (a) => {
    setForm(p => ({
      ...p,
      amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a],
    }));
  };

  const analyze = (e) => {
    e.preventDefault();
    setLoading(true);
    // Stub — will call OpenAI later
    setTimeout(() => {
      const annual = Math.floor(Math.random() * 60000) + 30000;
      const res = {
        address: form.address || `${form.city}, ${form.state}`,
        beds: form.beds, baths: form.baths,
        annualRevenue: { low: Math.round(annual * 0.8), mid: annual, high: Math.round(annual * 1.2) },
        occupancyRate: Math.floor(Math.random() * 25) + 65 + '%',
        avgNightly: Math.floor(Math.random() * 120) + 100,
        competitors: Math.floor(Math.random() * 20) + 5,
      };
      setResult(res);
      // Save to history
      const history = getHistory();
      history.unshift({ ...res, id: Date.now(), date: new Date().toISOString().slice(0, 10), user: 'You' });
      saveHistory(history.slice(0, 50));
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="sales-analysis-grid">
      {/* Left: form */}
      <div className="fin-card">
        <h3 className="fin-card__title"><MapPin size={16} style={{ color: '#7c3aed' }} /> Property Details</h3>
        <form onSubmit={analyze}>
          <label className="sales-field-label">Street Address *</label>
          <input className="fin-date-input" style={{ width: '100%', marginBottom: 14 }} placeholder="Start typing address..."
            value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required />

          <div className="sales-form-row-3">
            <div>
              <label className="sales-field-label">City *</label>
              <input className="fin-date-input" style={{ width: '100%' }} value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
            </div>
            <div>
              <label className="sales-field-label">State *</label>
              <input className="fin-date-input" style={{ width: '100%' }} value={form.state}
                onChange={e => setForm(p => ({ ...p, state: e.target.value }))} required />
            </div>
            <div>
              <label className="sales-field-label">Zipcode *</label>
              <input className="fin-date-input" style={{ width: '100%' }} value={form.zip}
                onChange={e => setForm(p => ({ ...p, zip: e.target.value }))} required />
            </div>
          </div>

          <div className="sales-form-row-2" style={{ marginTop: 14 }}>
            <div>
              <label className="sales-field-label">Bedrooms *</label>
              <input type="number" min="0" className="fin-date-input" style={{ width: '100%' }}
                value={form.beds} onChange={e => setForm(p => ({ ...p, beds: e.target.value }))} required />
            </div>
            <div>
              <label className="sales-field-label">Bathrooms *</label>
              <input type="number" min="0" step="0.5" className="fin-date-input" style={{ width: '100%' }}
                value={form.baths} onChange={e => setForm(p => ({ ...p, baths: e.target.value }))} required />
            </div>
          </div>

          <label className="sales-field-label" style={{ marginTop: 16 }}>Amenities</label>
          <div className="sales-amenities">
            {AMENITY_OPTIONS.map(a => (
              <label key={a} className="sales-checkbox">
                <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                {a}
              </label>
            ))}
          </div>

          <div className="sales-whatif">
            <span className="sales-field-label" style={{ margin: 0 }}>What-If Scenario</span>
            <button type="button" className="fin-btn-outline" style={{ padding: '4px 14px', fontSize: 12 }}
              onClick={() => setWhatIf(w => !w)}>
              {whatIf ? 'Disable' : 'Enable'}
            </button>
          </div>

          <button type="submit" className="fin-btn-dark" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} disabled={loading}>
            <Sparkles size={14} /> {loading ? 'Analyzing...' : 'Analyze Property'}
          </button>
        </form>
      </div>

      {/* Right: result or placeholder */}
      <div className="fin-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        {result ? (
          <div style={{ width: '100%' }}>
            <h3 className="fin-card__title">Revenue Insights — {result.address}</h3>
            <div className="fin-summary-row" style={{ marginBottom: 16 }}>
              <div className="fin-summary-card">
                <div className="fin-summary-card__label">Annual Revenue (est.)</div>
                <div className="fin-summary-card__val" style={{ color: '#15803d' }}>${result.annualRevenue.mid.toLocaleString()}</div>
              </div>
              <div className="fin-summary-card">
                <div className="fin-summary-card__label">Occupancy Rate</div>
                <div className="fin-summary-card__val" style={{ color: '#2563eb' }}>{result.occupancyRate}</div>
              </div>
            </div>
            <div className="fin-summary-row">
              <div className="fin-summary-card">
                <div className="fin-summary-card__label">Avg Nightly Rate</div>
                <div className="fin-summary-card__val" style={{ color: '#7c3aed' }}>${result.avgNightly}</div>
              </div>
              <div className="fin-summary-card">
                <div className="fin-summary-card__label">Nearby Competitors</div>
                <div className="fin-summary-card__val" style={{ color: '#475569' }}>{result.competitors}</div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <FileText size={48} style={{ color: '#cbd5e1', marginBottom: 16 }} />
            <h3 style={{ color: '#0f172a', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Get AI-Powered Revenue Insights</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', maxWidth: 340, lineHeight: 1.6 }}>
              Enter property details to receive a comprehensive market analysis including revenue forecasts, occupancy rates, pricing recommendations, and competitor insights.
            </p>
          </>
        )}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
     TAB 3 — Training Data
   ═══════════════════════════════════════════════════════════ */
function TrainingDataTab() {
  const [datasets, setDatasets] = useState([]);

  const handleUpload = () => {
    // Stub — file upload will be implemented with backend
    alert('CSV upload will be available once the AI backend is connected.');
  };

  return (
    <div>
      <div className="fin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 className="fin-card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} style={{ color: '#3b82f6' }} /> Training Data Management
            </h3>
            <p className="sales-section-sub" style={{ margin: 0 }}>Upload market data to enhance AI analysis with your proprietary insights</p>
          </div>
          <button className="fin-btn-dark" onClick={handleUpload}><Upload size={14} /> Upload Data</button>
        </div>

        <div className="sales-info-box">
          <h4 className="sales-info-box__title">How Training Data Works</h4>
          <p className="sales-info-box__text">
            Upload multiple CSV files with different types of market data (occupancy, pricing, events). The AI will validate, clean, and use this enriched data for more nuanced analysis of seasonality, demand drivers, and competitive positioning.
          </p>
        </div>

        {datasets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <FileText size={48} style={{ color: '#cbd5e1', marginBottom: 12 }} />
            <p style={{ color: '#475569', fontWeight: 500, fontSize: 14, margin: '0 0 4px' }}>No training datasets uploaded yet</p>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Upload your first CSV to get started</p>
          </div>
        ) : (
          <div className="hr-list" style={{ marginTop: 16 }}>
            {datasets.map(d => (
              <div className="hr-list__item" key={d.id}>
                <div className="hr-list__main">
                  <span className="hr-list__name">{d.name}</span>
                  <span className="hr-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>{d.rows} rows</span>
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
     TAB 4 — History
   ═══════════════════════════════════════════════════════════ */
function HistoryTab() {
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { setHistory(getHistory()); }, []);

  return (
    <div>
      <div className="fin-card">
        <h3 className="fin-card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} style={{ color: '#7c3aed' }} /> Analysis History
        </h3>
        <p className="sales-section-sub" style={{ margin: '0 0 16px' }}>View all previous property market analyses</p>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Clock size={40} style={{ color: '#cbd5e1', marginBottom: 12 }} />
            <p style={{ color: '#475569', fontWeight: 500, fontSize: 14 }}>No analyses yet</p>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Run your first analysis from the Analysis tab</p>
          </div>
        ) : (
          <div className="sales-history-list">
            {history.map(h => (
              <div key={h.id} className="sales-history-card" onClick={() => setExpanded(expanded === h.id ? null : h.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <MapPin size={14} style={{ color: '#7c3aed' }} />
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{h.address}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      {h.beds && <span className="hr-badge" style={{ background: '#f1f5f9', color: '#475569' }}>{h.beds} bed</span>}
                      {h.baths && <span className="hr-badge" style={{ background: '#f1f5f9', color: '#475569' }}>{h.baths} bath</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      Analyzed {h.date} &nbsp;&nbsp; by {h.user}
                    </div>
                    {h.annualRevenue && (
                      <div style={{ color: '#15803d', fontWeight: 600, fontSize: 13, marginTop: 4 }}>
                        ${h.annualRevenue.mid?.toLocaleString()} annual revenue (mid)
                      </div>
                    )}
                  </div>
                  <ChevronRight size={18} style={{ color: '#94a3b8', transform: expanded === h.id ? 'rotate(90deg)' : '', transition: 'transform 0.15s' }} />
                </div>
                {expanded === h.id && (
                  <div style={{ marginTop: 12, padding: '12px 0 0', borderTop: '1px solid #f1f5f9' }}>
                    <div className="fin-summary-row">
                      <div className="fin-summary-card">
                        <div className="fin-summary-card__label">Occupancy</div>
                        <div className="fin-summary-card__val" style={{ fontSize: 18, color: '#2563eb' }}>{h.occupancyRate}</div>
                      </div>
                      <div className="fin-summary-card">
                        <div className="fin-summary-card__label">Avg Nightly</div>
                        <div className="fin-summary-card__val" style={{ fontSize: 18, color: '#7c3aed' }}>${h.avgNightly}</div>
                      </div>
                      <div className="fin-summary-card">
                        <div className="fin-summary-card__label">Competitors</div>
                        <div className="fin-summary-card__val" style={{ fontSize: 18, color: '#475569' }}>{h.competitors}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
     TAB 5 — Market Alerts (AI Occupancy Forecasting)
   ═══════════════════════════════════════════════════════════ */

const MOCK_FORECAST = [
  { month: 'February 2026', location: 'Charlotte, NC', occupancy: 88, direction: 'higher', season: 'normal',  confidence: 85, factors: ['Valentine\'s weekend', 'NBA All-Star proximity'], recs: ['Offer couples packages', 'Raise weekend rates 10%'] },
  { month: 'March 2026',    location: 'Charlotte, NC', occupancy: 90, direction: 'higher', season: 'normal',  confidence: 90, factors: ['Spring break travel', 'Conference season'],         recs: ['Target family bookings', 'Ensure min 3-night stays'] },
  { month: 'April 2026',    location: 'Charlotte, NC', occupancy: 82, direction: 'higher', season: 'normal',  confidence: 88, factors: ['Spring weather', 'Easter travel'],               recs: ['Promote outdoor amenities', 'Offer mid-week discounts'] },
  { month: 'May 2026',      location: 'Charlotte, NC', occupancy: 78, direction: 'lower',  season: 'normal',  confidence: 82, factors: ['School in session', 'Pre-summer lull'],          recs: ['Attract business travelers', 'Run flash sales'] },
  { month: 'June 2026',     location: 'Charlotte, NC', occupancy: 95, direction: 'higher', season: 'peak',    confidence: 90, factors: ['Summer tourism', 'School break'],               recs: ['Raise nightly rates 20%', 'Require min stays'] },
  { month: 'July 2026',     location: 'Charlotte, NC', occupancy: 85, direction: 'higher', season: 'peak',    confidence: 80, factors: ['Fourth of July celebrations', 'Summer tourism', 'Warm weather'], recs: ['Promote proximity to fireworks and festivities', 'Offer special deals for extended stays'] },
];

function MarketAlertsTab() {
  const [forecast, setForecast] = useState(MOCK_FORECAST);
  const [loading, setLoading]   = useState(false);

  const generate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  // SVG area chart
  const chartW = 800, chartH = 180, pad = 30;
  const points = [...forecast].reverse();
  const maxOcc = 100;
  const xStep = (chartW - pad * 2) / Math.max(1, points.length - 1);
  const pathD = points.map((p, i) => {
    const x = pad + i * xStep;
    const y = pad + ((maxOcc - p.occupancy) / maxOcc) * (chartH - pad * 2);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
  const areaD = pathD + ` L${pad + (points.length - 1) * xStep},${chartH - pad} L${pad},${chartH - pad} Z`;

  return (
    <div>
      <div className="fin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 className="fin-card__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} style={{ color: '#7c3aed' }} /> AI Occupancy Forecasting
            </h3>
            <p className="sales-section-sub" style={{ margin: 0 }}>Predict future demand based on historical data, events, and market trends</p>
          </div>
          <button className="fin-btn-dark" onClick={generate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Forecast'}
          </button>
        </div>

        <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>6-Month Occupancy Trend</h4>
        <div className="sales-chart-wrap">
          <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height={chartH} style={{ display: 'block' }}>
            {/* grid lines */}
            {[0, 25, 50, 75, 100].map(v => {
              const y = pad + ((maxOcc - v) / maxOcc) * (chartH - pad * 2);
              return (
                <g key={v}>
                  <line x1={pad} y1={y} x2={chartW - pad} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={pad - 6} y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end">{v}</text>
                </g>
              );
            })}
            {/* x labels */}
            {points.map((p, i) => (
              <text key={i} x={pad + i * xStep} y={chartH - 8} fontSize="10" fill="#64748b" textAnchor="middle">
                {p.month}
              </text>
            ))}
            {/* area + line */}
            <path d={areaD} fill="rgba(139,92,246,0.15)" />
            <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="2.5" />
            {/* dots */}
            {points.map((p, i) => {
              const x = pad + i * xStep;
              const y = pad + ((maxOcc - p.occupancy) / maxOcc) * (chartH - pad * 2);
              return <circle key={i} cx={x} cy={y} r="3" fill="#8b5cf6" />;
            })}
          </svg>
        </div>
      </div>

      {/* Monthly forecast cards */}
      {forecast.map((f, i) => (
        <div className="fin-card" key={i} style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{f.month}</span>
                <span className="hr-badge" style={{ background: '#f1f5f9', color: '#475569' }}>{f.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <TrendingUp size={14} style={{ color: f.direction === 'higher' ? '#15803d' : '#dc2626' }} />
                <span style={{ fontSize: 22, fontWeight: 700, color: f.direction === 'higher' ? '#15803d' : '#dc2626' }}>{f.occupancy}%</span>
                <span style={{ fontSize: 13, color: '#475569' }}>{f.direction}</span>
              </div>
              <span className={`sales-season-badge sales-season-badge--${f.season}`}>{f.season}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Confidence</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#15803d' }}>{f.confidence}%</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Key Factors:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {f.factors.map(fac => (
                <span key={fac} className="hr-badge" style={{ background: '#f1f5f9', color: '#475569' }}>{fac}</span>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Recommendations:</div>
            {f.recs.map(r => (
              <div key={r} style={{ fontSize: 13, color: '#475569', paddingLeft: 8 }}>• {r}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
     TAB 6 — Competitive
   ═══════════════════════════════════════════════════════════ */
function CompetitiveTab() {
  return (
    <div className="fin-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <Target size={48} style={{ color: '#cbd5e1', marginBottom: 12 }} />
      <h3 style={{ color: '#0f172a', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Competitive Intelligence</h3>
      <p style={{ color: '#94a3b8', fontSize: 13, maxWidth: 360, margin: '0 auto' }}>
        Competitor pricing, listing quality scoring, and market positioning analysis — coming soon with AI integration.
      </p>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
     TAB 7 — Data Audit
   ═══════════════════════════════════════════════════════════ */
function DataAuditTab() {
  return (
    <div className="fin-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <Shield size={48} style={{ color: '#cbd5e1', marginBottom: 12 }} />
      <h3 style={{ color: '#0f172a', fontSize: 16, fontWeight: 600, margin: '0 0 8px' }}>Data Audit</h3>
      <p style={{ color: '#94a3b8', fontSize: 13, maxWidth: 360, margin: '0 auto' }}>
        Track data quality, validation reports, and AI model accuracy metrics — coming soon.
      </p>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
     Main Sales shell — top-level tabs
   ═══════════════════════════════════════════════════════════ */
const SALES_TABS = [
  { key: 'pricing',    label: 'AI Pricing',   icon: Sparkles },
  { key: 'analysis',   label: 'Analysis',     icon: TrendingUp },
  { key: 'training',   label: 'Training Data', icon: FileText },
  { key: 'history',    label: 'History',       icon: Clock },
  { key: 'alerts',     label: 'Market Alerts', icon: Bell },
  { key: 'competitive', label: 'Competitive',  icon: Target },
  { key: 'audit',      label: 'Data Audit',    icon: Shield },
];

export default function Sales() {
  const [tab, setTab] = useState('pricing');

  return (
    <div className="fin-page">
      <h2 className="sales-page-title">Sales & Market Analytics</h2>
      <p className="sales-page-sub">AI-powered revenue forecasting and market analysis</p>

      <div className="fin-top-tabs" style={{ marginBottom: 24 }}>
        {SALES_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} className={`fin-top-tab${tab === t.key ? ' fin-top-tab--active' : ''}`}
              onClick={() => setTab(t.key)}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="fin-tab-content">
        {tab === 'pricing'     && <AIPricingTab />}
        {tab === 'analysis'    && <AnalysisTab />}
        {tab === 'training'    && <TrainingDataTab />}
        {tab === 'history'     && <HistoryTab />}
        {tab === 'alerts'      && <MarketAlertsTab />}
        {tab === 'competitive' && <CompetitiveTab />}
        {tab === 'audit'       && <DataAuditTab />}
      </div>
    </div>
  );
}
