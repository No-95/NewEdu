'use client';

type MessengerBubbleProps = {
  text: string;
  isOwn: boolean;
  rich?: boolean;
  children?: React.ReactNode;
};

export function MessengerBubble({ text, isOwn, rich, children }: MessengerBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
          isOwn
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md bg-muted text-foreground',
        ].join(' ')}
      >
        {rich ? children : <p className="whitespace-pre-wrap">{text}</p>}
      </div>
    </div>
  );
}
