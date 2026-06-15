'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemFilterBar } from '@/components/ecosystem/shared/EcosystemFilterBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { MOCK_EXPERTS } from '@/lib/ecosystem/mock-data';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, UserPlus, Calendar } from 'lucide-react';
import { buildContactHref } from '@/lib/utils/client-actions';

function expertInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(-2)
    .join('')
    .toUpperCase();
}

export function ExpertNetworkClient() {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('all');
  const [country, setCountry] = useState('all');

  const filtered = useMemo(() => {
    return MOCK_EXPERTS.filter((ex) => {
      const matchSearch =
        !search ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.expertise.some((e) => e.toLowerCase().includes(search.toLowerCase()));
      const matchIndustry = industry === 'all' || ex.industry === industry;
      const matchCountry = country === 'all' || ex.country === country;
      return matchSearch && matchIndustry && matchCountry;
    });
  }, [search, industry, country]);

  return (
    <AppPageShell
      pageClassName="experts-network-page"
      title={t('ecosystemPages.expertNetwork.title')}
      subtitle={t('ecosystemPages.expertNetwork.subtitle')}
    >
      <EcosystemFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('ecosystemPages.expertNetwork.searchPlaceholder')}
        filters={[
          {
            key: 'industry',
            label: t('ecosystemPages.expertNetwork.filters.industry'),
            options: [
              { value: 'all', label: t('ecosystemPages.shared.all') },
              { value: 'Giáo dục', label: 'Giáo dục' },
              { value: 'Công nghệ', label: 'Công nghệ' },
              { value: 'Tài chính', label: 'Tài chính' },
              { value: 'Xuất khẩu lao động', label: 'Xuất khẩu lao động' },
              { value: 'Nhân sự', label: 'Nhân sự' },
              { value: 'Ngoại thương', label: 'Ngoại thương' },
              { value: 'Luật', label: 'Luật' },
            ],
          },
          {
            key: 'country',
            label: t('ecosystemPages.expertNetwork.filters.country'),
            options: [
              { value: 'all', label: t('ecosystemPages.shared.all') },
              { value: 'Việt Nam', label: 'Việt Nam' },
              { value: 'Singapore', label: 'Singapore' },
              { value: 'Hàn Quốc', label: 'Hàn Quốc' },
              { value: 'Nhật Bản', label: 'Nhật Bản' },
            ],
          },
        ]}
        filterValues={{ industry, country }}
        onFilterChange={(key, value) => {
          if (key === 'industry') setIndustry(value);
          if (key === 'country') setCountry(value);
        }}
      />

      <EcosystemSection
        title={t('ecosystemPages.expertNetwork.expertsCount', { params: { count: filtered.length } })}
        className="mt-6"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((expert) => (
            <div key={expert.id} className="home-card">
              <div className="flex items-start gap-4">
                <Avatar className="size-16 shrink-0 ring-2 ring-primary/20">
                  <AvatarImage src={expert.avatarUrl} alt={expert.name} />
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {expertInitials(expert.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{expert.name}</h3>
                  <p className="text-sm text-primary">{expert.industry} · {expert.country}</p>
                  <div className="mt-1 flex items-center gap-1 text-sm text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    {expert.rating}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{expert.biography}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {expert.expertise.map((e) => (
                  <Badge key={e} variant="secondary" className="experts-badge border-border bg-muted/80 text-foreground">
                    {e}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {t('ecosystemPages.shared.experience')} {expert.experience} · {expert.certifications.join(', ')}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="experts-btn-primary bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() =>
                    router.push(
                      buildContactHref({
                        topic: 'expert-consultation',
                        role: 'expert_network',
                        message: `Book consultation with ${expert.name}`,
                      })
                    )
                  }
                >
                  <Calendar className="mr-1 h-4 w-4" /> {t('ecosystemPages.expertNetwork.actions.bookConsultation')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="experts-btn-outline border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  onClick={() =>
                    router.push(
                      buildContactHref({
                        topic: 'expert-connection',
                        role: 'expert_network',
                        message: `Connection request to ${expert.name}`,
                      })
                    )
                  }
                >
                  {t('ecosystemPages.expertNetwork.actions.sendRequest')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="experts-btn-outline border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  onClick={() => router.push('/career/career-support')}
                >
                  <UserPlus className="mr-1 h-4 w-4" /> {t('ecosystemPages.expertNetwork.actions.follow')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </EcosystemSection>
    </AppPageShell>
  );
}
