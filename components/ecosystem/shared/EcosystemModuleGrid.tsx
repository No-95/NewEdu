'use client';

import type { ModuleItem } from '@/lib/ecosystem/types';
import {
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  Users,
  UserCheck,
} from 'lucide-react';

const ICONS = [Users, GraduationCap, BookOpen, UserCheck, ClipboardList, Calendar];

export function EcosystemModuleGrid({ modules }: { modules: ModuleItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((mod, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <button
            key={mod.id}
            type="button"
            className="home-card-muted group text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-primary transition-colors group-hover:border-primary/30">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">{mod.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
          </button>
        );
      })}
    </div>
  );
}
