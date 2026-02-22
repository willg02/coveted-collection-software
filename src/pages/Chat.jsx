import { MessageSquare } from 'lucide-react';

export default function Chat() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-page__icon">
        <MessageSquare size={28} />
      </div>
      <h2 className="placeholder-page__title">Coveted Chat</h2>
      <p className="placeholder-page__desc">
        AI assistants for operations and HR support. 2 bots ready to help.
      </p>
    </div>
  );
}
