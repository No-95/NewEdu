'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type SearchUserResult = {
  email: string;
  fullName?: string;
  avatarUrl?: string;
  hdpId?: string;
};

type MessengerUserSearchProps = {
  placeholder: string;
  minCharsHint: string;
  onSelect: (user: SearchUserResult) => void;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function MessengerUserSearch({
  placeholder,
  minCharsHint,
  onSelect,
}: MessengerUserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUserResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    const handle = window.setTimeout(() => {
      setLoading(true);
      void fetch(`/api/messages/search?q=${encodeURIComponent(trimmed)}`, {
        credentials: 'same-origin',
        cache: 'no-store',
      })
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((data) => setResults(Array.isArray(data.results) ? data.results : []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => window.clearTimeout(handle);
  }, [query]);

  return (
    <div className="border-b border-border/40 px-3 py-2">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
      />
      {query.trim().length > 0 && query.trim().length < 2 ? (
        <p className="mt-1 px-1 text-xs text-muted-foreground">{minCharsHint}</p>
      ) : null}
      {loading ? (
        <div className="flex items-center gap-2 px-1 py-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
        </div>
      ) : null}
      {results.length > 0 ? (
        <ul className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-border/40">
          {results.map((user) => {
            const label = user.fullName || user.email;
            return (
              <li key={user.email}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(user);
                    setQuery('');
                    setResults([]);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/50"
                >
                  <Avatar className="h-8 w-8">
                    {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={label} /> : null}
                    <AvatarFallback>{initials(label)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{label}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
