import { useCallback, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useQuizTimer } from '@/features/quiz/hooks/useQuizTimer'
import {
  calculateQuizScore,
  formatTimer,
  parseQuizDuration,
} from '@/features/quiz/utils/quizUtils'
import { useAppSelector } from '@/app/hooks'
import { useStudentFormation } from '@/features/formations/hooks/useStudentFormation'
import { selectFormationById } from '@/features/formations/slice/formationsSlice'
import {
  findQuizInFormation,
  getFullQuizQuestions,
} from '@/mocks/data/quizQuestions'
import { cn } from '@/lib/utils'

export function StudentQuizPage() {
  const { slug, quizId } = useParams<{ slug: string; quizId: string }>()
  const navigate = useNavigate()
  const { formation: apiFormation } = useStudentFormation(slug)
  const storedFormation = useAppSelector((state) =>
    slug ? selectFormationById(state, slug) : undefined,
  )
  const formationRecord = apiFormation ?? storedFormation
  const data = quizId ? findQuizInFormation(formationRecord, quizId) : null

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [attemptKey, setAttemptKey] = useState(0)
  const [result, setResult] = useState<{
    correct: number
    total: number
    percent: number
  } | null>(null)
  const submittedRef = useRef(false)
  const stopTimerRef = useRef<() => void>(() => {})

  const questions = data ? getFullQuizQuestions(data.quiz) : []
  const durationSeconds = data ? parseQuizDuration(data.quiz.duration) : 900

  const handleSubmit = useCallback(() => {
    if (!data || submittedRef.current) return
    submittedRef.current = true
    stopTimerRef.current()
    const score = calculateQuizScore(questions, answers)
    setResult(score)
    setSubmitted(true)
  }, [answers, data, questions])

  const { secondsLeft, stop } = useQuizTimer(
    durationSeconds,
    handleSubmit,
    attemptKey,
  )
  stopTimerRef.current = stop

  if (!data) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-6 text-center">
        <p className="text-sm text-slate-500">Quiz introuvable.</p>
        <Link
          to="/student/formations"
          className="mt-3 inline-block text-sm text-primary-600"
        >
          Retour aux formations
        </Link>
      </div>
    )
  }

  const { formation, subModule, quiz } = data
  const isLocked = quiz.status === 'locked'
  const answeredCount = Object.keys(answers).length
  const isLowTime = secondsLeft <= 60 && !submitted

  if (isLocked) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-6 text-center">
        <p className="text-sm text-slate-500">Ce quiz est verrouillé.</p>
        <Link
          to={`/student/formations/${formation.id}`}
          className="mt-3 inline-block text-sm text-primary-600"
        >
          Retour au module
        </Link>
      </div>
    )
  }

  if (submitted && result) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Résultats</h1>
        <p className="mt-1 text-sm text-slate-500">{quiz.title}</p>

        <div className="mt-6 text-center">
          <p
            className={cn(
              'text-4xl font-bold',
              result.percent >= 50 ? 'text-emerald-600' : 'text-rose-600',
            )}
          >
            {result.percent}%
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {result.correct} / {result.total} bonnes réponses
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {questions.map((q, i) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.correctAnswer
            return (
              <div
                key={q.id}
                className={cn(
                  'rounded-lg border px-4 py-3 text-sm',
                  isCorrect
                    ? 'border-emerald-100 bg-emerald-50/50'
                    : 'border-rose-100 bg-rose-50/50',
                )}
              >
                <p className="font-medium text-slate-800">
                  {i + 1}. {q.text}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Votre réponse : {userAnswer ?? '—'}
                </p>
                {!isCorrect && (
                  <p className="mt-0.5 text-xs text-emerald-700">
                    Bonne réponse : {q.correctAnswer}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/student/formations/${formation.id}`)}
          >
            Retour au module
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              submittedRef.current = false
              setAnswers({})
              setSubmitted(false)
              setResult(null)
              setAttemptKey((k) => k + 1)
            }}
          >
            Refaire
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Link
        to={`/student/formations/${formation.id}`}
        className="mb-3 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
      >
        ← Retour au module
      </Link>

      <div className="sticky top-0 z-10 mb-4 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-slate-900">
              {quiz.title}
            </h1>
            <p className="text-xs text-slate-500">
              {subModule.title} · {answeredCount}/{questions.length} répondues
            </p>
          </div>
          <div
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 font-mono text-sm font-semibold',
              isLowTime
                ? 'bg-rose-50 text-rose-600'
                : 'bg-slate-100 text-slate-700',
            )}
          >
            {formatTimer(secondsLeft)}
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className="space-y-4"
      >
        {questions.map((question, index) => (
          <fieldset
            key={question.id}
            className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <legend className="px-1 text-sm font-semibold text-slate-900">
              {index + 1}. {question.text}
            </legend>

            {question.type === 'open' ? (
              <textarea
                value={answers[question.id] ?? ''}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [question.id]: e.target.value,
                  }))
                }
                rows={3}
                className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Votre réponse..."
              />
            ) : (
              <div className="mt-3 space-y-2">
                {question.options?.map((option) => (
                  <label
                    key={option}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                      answers[question.id] === option
                        ? 'border-primary-300 bg-primary-50 text-primary-800'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [question.id]: option,
                        }))
                      }
                      className="h-4 w-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
          </fieldset>
        ))}

        <Button
          type="submit"
          className="w-full"
          disabled={answeredCount === 0}
        >
          Terminer le quiz
        </Button>
      </form>
    </div>
  )
}
