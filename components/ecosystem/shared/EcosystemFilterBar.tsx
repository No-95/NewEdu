'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

export function EcosystemFilterBar({
  searchPlaceholder = 'Tìm kiếm...',
  searchValue,
  onSearchChange,
  filters,
  filterValues,
  onFilterChange,
}: {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
}) {
  return (
    <div className="home-card flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="border-border bg-card pl-9"
        />
      </div>
      {filters?.map((filter) => (
        <Select
          key={filter.key}
          value={filterValues?.[filter.key] ?? 'all'}
          onValueChange={(v) => onFilterChange?.(filter.key, v)}
        >
          <SelectTrigger className="w-full border-border bg-card md:w-[180px]">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
