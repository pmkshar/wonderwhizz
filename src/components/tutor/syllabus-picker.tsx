'use client'

import { useMemo } from 'react'
import { Book, ChevronRight, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SYLLABUS_BOARDS,
  getBoard,
  getChapters,
  hasChapters,
  type SyllabusChapter,
} from '@/lib/syllabus'
import { getSubject, SUBJECTS } from '@/lib/subjects'

interface SyllabusPickerProps {
  boardId: string | null
  grade: number
  subjectId: string
  chapterId: string | null
  onBoardChange: (boardId: string | null) => void
  onChapterChange: (chapterId: string | null) => void
}

/**
 * 3-step picker inside the Tutor options drawer:
 *   1. Board (CBSE / ICSE / Karnataka / Maharashtra)
 *   2. (grade & subject are fixed by the parent — shown as read-only info)
 *   3. Chapter list for the chosen board + grade + subject
 *
 * Picking a chapter is OPTIONAL — if the student just has a quick question
 * they can leave it as "General syllabus help".
 */
export function SyllabusPicker({
  boardId,
  grade,
  subjectId,
  chapterId,
  onBoardChange,
  onChapterChange,
}: SyllabusPickerProps) {
  const subject = getSubject(subjectId)
  const board = boardId ? getBoard(boardId) : undefined

  // Boards that actually have chapters for this grade+subject combination
  const usableBoards = useMemo(
    () =>
      SYLLABUS_BOARDS.filter((b) => b.subjectIds.includes(subjectId)).filter(
        (b) => b.grades.includes(grade)
      ),
    [subjectId, grade]
  )

  const chapters = useMemo(
    () => (boardId ? getChapters(boardId, subjectId, grade) : []),
    [boardId, subjectId, grade]
  )

  const canBrowse = boardId ? hasChapters(boardId, subjectId, grade) : false
  const selectedChapter = useMemo(
    () => chapters.find((c) => c.id === chapterId) ?? null,
    [chapters, chapterId]
  )

  return (
    <div className="space-y-4">
      {/* Step 1 — Board */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          <span className="mr-1">1.</span> School board / syllabus
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {usableBoards.map((b) => {
            const active = b.id === boardId
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  onBoardChange(active ? null : b.id)
                  onChapterChange(null)
                }}
                aria-pressed={active}
                className={cn(
                  'flex items-start gap-2 rounded-lg border-2 p-2 text-left transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary/40'
                )}
              >
                <span className="text-lg leading-none">{b.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold leading-tight">{b.shortLabel}</div>
                  <div className="truncate text-[10px] text-muted-foreground">
                    {b.label.split('(')[0].trim()}
                  </div>
                </div>
              </button>
            )
          })}
          {usableBoards.length === 0 && (
            <p className="col-span-2 text-xs text-muted-foreground">
              No syllabus content available for {subject?.label} Class {grade}.
              The tutor will still help with general homework.
            </p>
          )}
        </div>
        {board && (
          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
            {board.description}
          </p>
        )}
      </div>

      {/* Step 2 — Grade & Subject (read-only — they're already in the top bar) */}
      <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Class {grade}</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold">
            {subject?.emoji} {subject?.label}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Change subject &amp; grade from the top bar.
        </p>
      </div>

      {/* Step 3 — Chapter */}
      {boardId && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            <span className="mr-1">2.</span> Chapter (optional)
          </label>
          {!canBrowse ? (
            <p className="rounded-md border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
              No chapter list available for{' '}
              <span className="font-semibold">
                {board?.shortLabel} Class {grade} {subject?.label}
              </span>
              . The tutor will still answer using the board&apos;s general
              curriculum.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onChapterChange(null)}
                aria-pressed={!chapterId}
                className={cn(
                  'mb-1.5 flex w-full items-center gap-2 rounded-md border-2 px-2.5 py-1.5 text-left text-xs transition-all',
                  !chapterId
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary/40'
                )}
              >
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span className="font-semibold">General syllabus help</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  any chapter
                </span>
              </button>
              <div className="ww-chat-scroll max-h-72 space-y-1 overflow-y-auto pr-1">
                {chapters.map((ch) => {
                  const active = ch.id === chapterId
                  return (
                    <ChapterButton
                      key={ch.id}
                      chapter={ch}
                      active={active}
                      onClick={() => onChapterChange(active ? null : ch.id)}
                    />
                  )
                })}
              </div>
              {chapterId && selectedChapter && (
                <div className="mt-2 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[11px] text-foreground">
                  <span className="font-semibold">Selected topics:</span>{' '}
                  {selectedChapter.topics.join(' · ')}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Footer hint */}
      {!boardId && (
        <p className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
          <Book className="mt-0.5 h-3 w-3 shrink-0" />
          Pick your board so the tutor can give answers that match your
          textbook&apos;s chapter order and depth.
        </p>
      )}
    </div>
  )
}

function ChapterButton({
  chapter,
  active,
  onClick,
}: {
  chapter: SyllabusChapter
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex w-full items-start gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition-all',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/40'
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
          active
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {chapter.number}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold leading-tight">{chapter.title}</div>
        {chapter.topics.length > 0 && (
          <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
            {chapter.topics.slice(0, 3).join(' · ')}
          </div>
        )}
      </div>
    </button>
  )
}
