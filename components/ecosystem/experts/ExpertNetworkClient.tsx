'use client';

import { useMemo, useState } from 'react';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { EcosystemFilterBar } from '@/components/ecosystem/shared/EcosystemFilterBar';
import { EcosystemSection } from '@/components/ecosystem/shared/EcosystemSection';
import { MOCK_EXPERTS } from '@/lib/ecosystem/mock-data';
import { useLanguage } from '@/lib/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, UserPlus, Calendar } from 'lucide-react';

export function ExpertNetworkClient() {
  const { t } = useLanguage();
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{expert.name}</h3>
                  <p className="text-sm text-primary">{expert.industry} · {expert.country}</p>
                  <div className="mt-1 flex items-center gap-1 text-sm text-amber-400">
                    <Star className="h-4 w-4 fill-current" />
                    {expert.rating}
                  </div>
                </div>
                <p className="shrink-0 text-sm font-semibold text-foreground">{expert.consultationFee}</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{expert.biography}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {expert.expertise.map((e) => (
                  <Badge key={e} variant="secondary" className="bg-white/10">{e}</Badge>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {t('ecosystemPages.shared.experience')} {expert.experience} · {expert.certifications.join(', ')}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Calendar className="mr-1 h-4 w-4" /> {t('ecosystemPages.expertNetwork.actions.bookConsultation')}
                </Button>
                <Button size="sm" variant="outline" className="border-white/15">
                  {t('ecosystemPages.expertNetwork.actions.sendRequest')}
                </Button>
                <Button size="sm" variant="outline" className="border-white/15">
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
