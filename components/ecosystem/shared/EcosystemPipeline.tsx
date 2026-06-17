'use client';

import type { Lead, LeadStage } from '@/lib/ecosystem/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function EcosystemPipeline({
  stages,
  leads,
  onAdvanceLead,
  advanceLabel,
  terminalStages = ['enrolled'],
  highlightLeadId,
}: {
  stages: readonly { key: string; label: string }[];
  leads: Lead[];
  onAdvanceLead?: (leadId: string) => void;
  advanceLabel?: string;
  terminalStages?: string[];
  highlightLeadId?: string;
}) {
  return (
    <div className="grid gap-3 overflow-x-auto lg:grid-cols-5">
      {stages.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage.key);
        return (
          <div key={stage.key} className="home-card-muted min-w-[200px]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
              <Badge variant="secondary" className="bg-white/10 text-xs">
                {stageLeads.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {stageLeads.map((lead) => (
                <div
                  key={lead.id}
                  id={`lead-${lead.id}`}
                  className={`rounded-lg border bg-white/5 p-3 text-sm transition-colors hover:border-primary/20 ${
                    highlightLeadId === lead.id
                      ? 'border-primary ring-2 ring-primary/40'
                      : 'border-white/10'
                  }`}
                >
                  <p className="font-medium text-foreground">{lead.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{lead.source}</p>
                  <p className="mt-1 text-xs text-primary">Follow-up: {lead.followUpDate}</p>
                  {onAdvanceLead && !terminalStages.includes(lead.stage) ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-2 h-7 text-xs"
                      onClick={() => onAdvanceLead(lead.id)}
                    >
                      {advanceLabel ?? 'Advance'}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function LeadStageBadge({ stage }: { stage: LeadStage }) {
  const colors: Record<LeadStage, string> = {
    new_lead: 'bg-blue-500/20 text-blue-300',
    contacted: 'bg-amber-500/20 text-amber-300',
    interested: 'bg-purple-500/20 text-purple-300',
    trial_class: 'bg-cyan-500/20 text-cyan-300',
    enrolled: 'bg-emerald-500/20 text-emerald-300',
  };
  const labels: Record<LeadStage, string> = {
    new_lead: 'Lead mới',
    contacted: 'Đã liên hệ',
    interested: 'Quan tâm',
    trial_class: 'Học thử',
    enrolled: 'Đã ghi danh',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[stage]}`}>
      {labels[stage]}
    </span>
  );
}
