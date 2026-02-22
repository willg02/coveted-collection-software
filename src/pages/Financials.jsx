import { DollarSign } from 'lucide-react';

export default function Financials() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page__icon">
        <DollarSign size={28} />
      </div>
      <h2 className="placeholder-page__title">Financials</h2>
      <p className="placeholder-page__desc">
        View financial reports, revenue tracking, and expense management.
      </p>
    </div>
  );
}
