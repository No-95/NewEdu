'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import {
  BookOpenCheck,
  Clock,
  Filter,
  Loader2,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getTestDescriptionKey, getTestDisplayTitle, getSourceLabelKey } from '@/lib/tests/catalog';
import { TEST_FIELDS } from '@/lib/tests/fields';
import type { TestDifficulty, TestItem } from '@/lib/tests/types';
import { api } from '@/convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE = 24;

const DIFFICULTY_CLASS: Record<TestDifficulty, string> = {
  beginner: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  intermediate: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  advanced: 'border-rose-400/40 bg-rose-400/10 text-rose-300',
};

export function TestsCatalogClient() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [fieldId, setFieldId] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [page, setPage] = useState(1);
  const [seeding, setSeeding] = useState(false);
  const hasSeededRef = useRef(false);

  const tests = useQuery(api.tests.listPublishedTests, {});
  const stats = useQuery(api.tests.getCatalogStats, {});

  useEffect(() => {
    if (hasSeededRef.current || tests === undefined) return;
    if (tests.length > 0) return;

    hasSeededRef.current = true;
    setSeeding(true);
    void fetch('/api/dev/seed-tests')
      .then((res) => res.json())
      .finally(() => setSeeding(false));
  }, [tests]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = (tests ?? []) as TestItem[];
    return rows.filter((test) => {
      const title = getTestDisplayTitle(test, t).toLowerCase();
      const fieldLabel = t(`testsPage.fields.${test.fieldId}`).toLowerCase();
      const matchSearch =
        !query ||
        title.includes(query) ||
        fieldLabel.includes(query) ||
        test.externalId.includes(query);
      const matchField = fieldId === 'all' || test.fieldId === fieldId;
      const matchDifficulty = difficulty === 'all' || test.difficulty === difficulty;
      return matchSearch && matchField && matchDifficulty;
    });
  }, [tests, search, fieldId, difficulty, t]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const isLoading = tests === undefined || seeding;

  return (
    <AppPageShell
      pageClassName="tests-page"
      title={t('testsPage.title')}
      subtitle={t('testsPage.subtitle')}
    >
      <section className="home-card mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="home-card-muted flex items-center gap-3">
            <BookOpenCheck className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('testsPage.stats.tests')}</p>
              <p className="text-2xl font-bold text-foreground">{stats?.totalTests ?? (tests?.length ?? 0)}</p>
            </div>
          </div>
          <div className="home-card-muted flex items-center gap-3">
            <Filter className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('testsPage.stats.fields')}</p>
              <p className="text-2xl font-bold text-foreground">{TEST_FIELDS.length}</p>
            </div>
          </div>
          <div className="home-card-muted flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{t('testsPage.stats.questions')}</p>
              <p className="text-2xl font-bold text-foreground">
                {(stats?.totalQuestions ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-card mb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('testsPage.searchPlaceholder')}
              className="border-border bg-card pl-9"
            />
          </div>
          <Select
            value={fieldId}
            onValueChange={(value) => {
              setFieldId(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full border-border bg-card lg:w-[220px]">
              <SelectValue placeholder={t('testsPage.filters.field')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('testsPage.filters.allFields')}</SelectItem>
              {TEST_FIELDS.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {t(field.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={difficulty}
            onValueChange={(value) => {
              setDifficulty(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full border-border bg-card lg:w-[180px]">
              <SelectValue placeholder={t('testsPage.filters.difficulty')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('testsPage.filters.allLevels')}</SelectItem>
              <SelectItem value="beginner">{t('testsPage.difficulty.beginner')}</SelectItem>
              <SelectItem value="intermediate">{t('testsPage.difficulty.intermediate')}</SelectItem>
              <SelectItem value="advanced">{t('testsPage.difficulty.advanced')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('testsPage.resultsCount', { params: { count: filtered.length } })}
        </p>
      </section>

      {isLoading ? (
        <div className="home-card flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t('testsPage.loading')}
        </div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((test) => {
            const displayTitle = getTestDisplayTitle(test, t);
            return (
              <article key={test.externalId} className="home-card flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="tests-badge border-border bg-muted/80 text-foreground">
                    {t(`testsPage.fields.${test.fieldId}`)}
                  </Badge>
                  <Badge variant="outline" className={DIFFICULTY_CLASS[test.difficulty]}>
                    {t(`testsPage.difficulty.${test.difficulty}`)}
                  </Badge>
                  {test.featured && (
                    <Badge variant="outline" className="border-primary/40 text-primary">
                      {t('testsPage.featured')}
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {t(getSourceLabelKey(test.source))}
                  </Badge>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{displayTitle}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {test.description ?? t(getTestDescriptionKey(test))}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <BookOpenCheck className="h-3.5 w-3.5" />
                    {t('testsPage.meta.questions', { params: { count: test.questionCount } })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {t('testsPage.meta.duration', { params: { minutes: test.durationMinutes } })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {t('testsPage.meta.taken', { params: { count: test.popularity } })}
                  </span>
                </div>
                <p className="mt-2 text-xs text-primary/80">
                  {t('testsPage.meta.mix', {
                    params: { typed: test.typedQuestionCount, mcq: test.mcqCount },
                  })}
                </p>
                <Button asChild className="tests-btn-primary mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href={`/tests/${test.externalId}`}>{t('testsPage.startTest')}</Link>
                </Button>
              </article>
            );
          })}
        </section>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="home-card py-12 text-center text-muted-foreground">{t('testsPage.empty')}</div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="tests-btn-outline border-border bg-card"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t('testsPage.pagination.prev')}
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            {t('testsPage.pagination.page', { params: { current: currentPage, total: totalPages } })}
          </span>
          <Button
            type="button"
            variant="outline"
            className="tests-btn-outline border-border bg-card"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {t('testsPage.pagination.next')}
          </Button>
        </div>
      )}
    </AppPageShell>
  );
}
