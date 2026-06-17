'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { AppPageShell } from '@/components/ecosystem/shared/AppPageShell';
import { useLanguage } from '@/lib/context/LanguageContext';
import { getTestDescriptionKey, getTestDisplayTitle } from '@/lib/tests/catalog';
import type { AiGradeResult, QuestionType, TestQuestion } from '@/lib/tests/types';
import { api } from '@/convex/_generated/api';
import { useUserEmail } from '@/hooks/useUserSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Id } from '@/convex/_generated/dataModel';

type AnswerState = {
  selectedIndex?: number | null;
  userAnswer?: string;
};

type LoadedQuestion = TestQuestion & { _id: string };

type GradedAnswer = AnswerState & {
  questionId: string;
  score: number;
  correct: boolean;
  aiFeedback?: string;
  modelAnswer?: string;
};

function isAnswered(question: TestQuestion, answer?: AnswerState) {
  if (!answer) return false;
  if (question.type === 'multiple_choice') return answer.selectedIndex !== null && answer.selectedIndex !== undefined;
  return Boolean(answer.userAnswer?.trim());
}

export function TestTakeClient({ testId }: { testId: string }) {
  const { t, language } = useLanguage();
  const userEmail = useUserEmail();
  const payload = useQuery(api.tests.getPublishedTestByExternalId, { externalId: testId });
  const submitAttempt = useMutation(api.tests.submitTestAttempt);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [graded, setGraded] = useState<GradedAnswer[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const test = payload?.test;
  const questions = useMemo(
    () => (payload?.questions ?? []) as LoadedQuestion[],
    [payload?.questions]
  );

  if (payload === undefined) {
    return (
      <AppPageShell pageClassName="tests-page" title={t('testsPage.loading')}>
        <div className="home-card flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          {t('testsPage.loading')}
        </div>
      </AppPageShell>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <AppPageShell pageClassName="tests-page" title={t('testsPage.notFoundTitle')}>
        <div className="home-card py-12 text-center">
          <p className="text-muted-foreground">{t('testsPage.notFoundBody')}</p>
          <Button asChild className="mt-4">
            <Link href="/tests">{t('testsPage.backToCatalog')}</Link>
          </Button>
        </div>
      </AppPageShell>
    );
  }

  const displayTitle = getTestDisplayTitle(test, t);
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion._id] : undefined;
  const allAnswered = questions.every((q) => isAnswered(q, answers[q._id]));

  const totalScore = graded?.reduce((sum, a) => sum + a.score, 0) ?? 0;

  const handleSelect = (optionIndex: number) => {
    if (graded || !currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: { ...prev[currentQuestion._id], selectedIndex: optionIndex },
    }));
  };

  const handleTextChange = (value: string) => {
    if (graded || !currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: { ...prev[currentQuestion._id], userAnswer: value },
    }));
  };

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const gradedResults: GradedAnswer[] = [];
      const aiItems: Array<{
        questionId: string;
        type: QuestionType;
        prompt: string;
        modelAnswer: string;
        rubric: string;
        userAnswer: string;
        acceptableVariants?: string[];
        fieldId: string;
      }> = [];

      for (const question of questions) {
        const answer = answers[question._id];
        if (question.type === 'multiple_choice') {
          const pick = answer?.selectedIndex ?? null;
          const correct = pick === question.correctIndex;
          gradedResults.push({
            questionId: question._id,
            selectedIndex: pick,
            score: correct ? 1 : 0,
            correct,
            aiFeedback: question.explanation,
            modelAnswer: question.options?.[question.correctIndex ?? 0] ?? question.modelAnswer,
          });
        } else {
          aiItems.push({
            questionId: question._id,
            type: question.type,
            prompt: question.passage ? `${question.passage}\n\n${question.prompt}` : question.prompt,
            modelAnswer: question.modelAnswer,
            rubric: question.rubric,
            userAnswer: answer?.userAnswer?.trim() ?? '',
            acceptableVariants: question.acceptableVariants,
            fieldId: test.fieldId,
          });
        }
      }

      if (aiItems.length > 0) {
        const gradeRes = await fetch('/api/tests/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: aiItems, locale: language }),
        });
        const gradeData = await gradeRes.json();
        if (!gradeRes.ok) {
          throw new Error(gradeData.error || t('testsPage.take.gradingError'));
        }

        for (const item of aiItems) {
          const result = (gradeData.results as Array<{ questionId?: string; grade: AiGradeResult }>).find(
            (r) => r.questionId === item.questionId
          );
          const grade = result?.grade ?? {
            correct: false,
            score: 0,
            feedback: t('testsPage.take.gradingError'),
          };
          gradedResults.push({
            questionId: item.questionId,
            userAnswer: item.userAnswer,
            score: grade.score >= 0.7 ? 1 : grade.score >= 0.4 ? 0.5 : 0,
            correct: grade.correct,
            aiFeedback: grade.feedback,
            modelAnswer: grade.modelAnswer ?? item.modelAnswer,
          });
        }
      }

      setGraded(gradedResults);

      await submitAttempt({
        email: userEmail ?? undefined,
        testExternalId: test.externalId,
        answers: gradedResults.map((g) => ({
          questionId: g.questionId as Id<'testQuestions'>,
          selectedIndex: g.selectedIndex ?? undefined,
          userAnswer: g.userAnswer,
          score: g.score,
          correct: g.correct,
          aiFeedback: g.aiFeedback,
          modelAnswer: g.modelAnswer,
        })),
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t('testsPage.take.gradingError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppPageShell pageClassName="tests-page" title={displayTitle} subtitle={t(getTestDescriptionKey(test))}>
      <div className="mb-6">
        <Button asChild variant="outline" className="tests-btn-outline border-border bg-card">
          <Link href="/tests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('testsPage.backToCatalog')}
          </Link>
        </Button>
      </div>

      {!graded ? (
        <div className="home-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>
              {t('testsPage.take.progress', { params: { current: currentIndex + 1, total: questions.length } })}
            </span>
            <span>{t(`testsPage.questionTypes.${currentQuestion?.type}`)}</span>
          </div>

          {currentQuestion?.passage && (
            <div className="mb-4 rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
              {currentQuestion.passage}
            </div>
          )}

          <h2 className="text-xl font-semibold text-foreground">{currentQuestion?.prompt}</h2>

          {currentQuestion?.type === 'multiple_choice' ? (
            <div className="mt-6 space-y-3">
              {currentQuestion.options?.map((option, index) => {
                const active = currentAnswer?.selectedIndex === index;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(index)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                      active
                        ? 'border-primary/50 bg-primary/10 text-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary/5'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-6">
              {currentQuestion?.type === 'fill_blank' || currentQuestion?.type === 'translation' ? (
                <Input
                  value={currentAnswer?.userAnswer ?? ''}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={t('testsPage.take.shortPlaceholder')}
                  maxLength={currentQuestion.maxLength ?? 200}
                  className="border-border bg-card text-base"
                />
              ) : (
                <Textarea
                  value={currentAnswer?.userAnswer ?? ''}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={t('testsPage.take.longPlaceholder')}
                  maxLength={currentQuestion?.maxLength ?? 500}
                  rows={currentQuestion?.type === 'short_answer' ? 4 : 6}
                  className="border-border bg-card text-base"
                />
              )}
              <p className="mt-2 text-xs text-muted-foreground">{t('testsPage.take.typeHint')}</p>
            </div>
          )}

          {submitError && <p className="mt-4 text-sm text-rose-400">{submitError}</p>}

          <div className="mt-8 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="tests-btn-outline border-border bg-card"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              {t('testsPage.take.prev')}
            </Button>
            {currentIndex < questions.length - 1 ? (
              <Button
                type="button"
                className="tests-btn-primary bg-primary text-primary-foreground"
                disabled={!isAnswered(currentQuestion!, currentAnswer)}
                onClick={() => setCurrentIndex((i) => i + 1)}
              >
                {t('testsPage.take.next')}
              </Button>
            ) : (
              <Button
                type="button"
                className="tests-btn-primary bg-primary text-primary-foreground"
                disabled={!allAnswered || submitting}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('testsPage.take.grading')}
                  </>
                ) : (
                  t('testsPage.take.submit')
                )}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="home-card text-center">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">{t('testsPage.take.resultTitle')}</p>
            <p className="mt-2 text-4xl font-bold text-primary">
              {t('testsPage.take.score', {
                params: {
                  score: Math.round(totalScore * 10) / 10,
                  total: questions.length,
                  percent: Math.round((totalScore / questions.length) * 100),
                },
              })}
            </p>
            <Button asChild className="tests-btn-primary mt-6 bg-primary text-primary-foreground">
              <Link href="/tests">{t('testsPage.backToCatalog')}</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => {
              const result = graded.find((g) => g.questionId === question._id);
              const correct = result?.correct ?? false;
              return (
                <article key={question._id} className="home-card">
                  <div className="flex items-start gap-2">
                    {correct ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">
                        {index + 1}. {question.prompt}
                      </p>
                      {result?.userAnswer && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t('testsPage.take.yourAnswer')}: {result.userAnswer}
                        </p>
                      )}
                      {result?.modelAnswer && (
                        <p className="mt-1 text-sm text-primary/90">
                          {t('testsPage.take.modelAnswer')}: {result.modelAnswer}
                        </p>
                      )}
                      {result?.aiFeedback && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{result.aiFeedback}</p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </AppPageShell>
  );
}
