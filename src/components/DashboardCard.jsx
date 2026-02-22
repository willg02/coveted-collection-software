import { ArrowRight } from 'lucide-react';

/**
 * Reusable dashboard feature card.
 *
 * @param {Object}   props
 * @param {React.ReactNode} props.icon       – Lucide icon element
 * @param {string}   props.iconColor         – CSS modifier (indigo, blue, emerald, etc.)
 * @param {string}   props.title
 * @param {string}   [props.subtitle]
 * @param {{ label: string, value: string|number }[]} [props.metrics]
 * @param {string}   [props.ctaLabel]
 * @param {function} [props.onCtaClick]
 */
export default function DashboardCard({
  icon,
  iconColor = 'indigo',
  title,
  subtitle,
  metrics,
  ctaLabel,
  onCtaClick,
}) {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <div className={`dashboard-card__icon dashboard-card__icon--${iconColor}`}>
          {icon}
        </div>
        <div>
          <div className="dashboard-card__title">{title}</div>
          {subtitle && <div className="dashboard-card__subtitle">{subtitle}</div>}
        </div>
      </div>

      {metrics && metrics.length > 0 && (
        <div className="dashboard-card__values">
          {metrics.map((m) => (
            <div className="dashboard-card__metric" key={m.label}>
              <span className="dashboard-card__metric-label">{m.label}</span>
              <span className="dashboard-card__metric-value">{m.value}</span>
            </div>
          ))}
        </div>
      )}

      {ctaLabel && (
        <button className="dashboard-card__cta" onClick={onCtaClick}>
          {ctaLabel}
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}
