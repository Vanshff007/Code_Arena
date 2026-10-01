import { useEffect, useRef, useState } from 'react';
import Button from '../../shared/ui/Button';

// Room chat. Your messages sit on the left in cobalt, the opponent's in
// crimson - same sides as the versus bar.
function BattleChat({ messages, selfName, opponentName, onSend }) {
  const [text, setText] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages.length]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <section aria-label="Chat" className="border border-rule bg-panel">
      <h2 className="border-b border-rule px-4 py-2.5 text-sm font-bold">Chat with {opponentName ?? 'your opponent'}</h2>
      <div ref={listRef} className="h-40 space-y-1.5 overflow-y-auto px-4 py-3 text-sm" aria-live="polite">
        {messages.length === 0 && <p className="text-muted">No messages yet.</p>}
        {messages.map((m, i) => {
          const mine = m.username === selfName;
          return (
            <p key={i} className="break-words">
              <span className={`mr-2 font-bold ${mine ? 'text-p1' : 'text-p2'}`}>{mine ? 'You' : m.username}</span>
              {m.message}
            </p>
          );
        })}
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-rule p-2">
        <label className="sr-only" htmlFor="chat-input">
          Message
        </label>
        <input
          id="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder="Write a message"
          className="min-w-0 flex-1 bg-transparent px-2 text-sm focus:outline-none"
        />
        <Button type="submit" variant="secondary" className="py-1.5">
          Send
        </Button>
      </form>
    </section>
  );
}

export default BattleChat;
