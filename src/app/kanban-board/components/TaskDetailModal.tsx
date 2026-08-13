'use client';

import React, { useCallback, useEffect } from 'react';
import { Calendar, Layers, Pencil, Tag, Trash2, User, X } from 'lucide-react';
import type { Task, Teammate } from './types';
import { COLUMN_LABELS, TAG_STYLES } from './types';

interface TaskDetailModalProps {
  task: Task;
  teammates: Teammate[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskDetailModal({
  task,
  teammates,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  const assignee = teammates.find((teammate) => teammate.id === task.assigneeId);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label={`Task details: ${task.title}`}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="fade-in relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-xl dark:bg-[#13131f]"
        style={{
          boxShadow:
            '0 0 0 1px rgba(167,139,250,0.18), 0 24px 64px 0 rgba(0,0,0,0.55), 0 0 40px 0 rgba(124,58,237,0.12)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/60 px-6 pb-4 pt-6">
          <div className="min-w-0 flex-1">
            <span
              className={`tag-badge mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TAG_STYLES[task.tag]}`}
            >
              {task.tag}
            </span>

            <h2 className="mt-1 text-lg font-bold leading-snug text-foreground">
              {task.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="mt-0.5 flex-shrink-0 rounded-lg p-1.5 text-muted-foreground transition-all duration-150 hover:scale-110 hover:bg-primary/10 hover:text-foreground active:scale-95 dark:hover:bg-primary/20"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex max-h-[60vh] flex-col gap-5 overflow-y-auto px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </p>

            {task.description ? (
              <p className="text-sm leading-relaxed text-foreground">{task.description}</p>
            ) : (
              <p className="text-sm italic text-muted-foreground">No description provided.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <User size={11} />
                Assigned To
              </span>

              {assignee ? (
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${assignee.color} text-xs font-bold text-white`}
                    aria-hidden="true"
                  >
                    {assignee.initials}
                  </div>

                  <span className="text-sm font-medium text-foreground">{assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Unassigned</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Layers size={11} />
                Status
              </span>

              <span className="text-sm font-medium text-foreground">
                {COLUMN_LABELS[task.columnId]}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Tag size={11} />
                Label
              </span>

              <span
                className={`tag-badge w-fit rounded-full px-2 py-0.5 text-xs font-medium ${TAG_STYLES[task.tag]}`}
              >
                {task.tag}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Calendar size={11} />
                Created
              </span>

              <span className="text-sm font-medium text-foreground">{task.createdAt}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border/60 bg-muted/30 px-6 py-4 dark:bg-white/[0.02]">
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-all duration-150 hover:scale-[1.03] hover:bg-red-100 active:scale-95 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/35"
          >
            <Trash2 size={14} />
            Delete
          </button>

          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:scale-[1.03] hover:bg-primary/90 hover:shadow-md active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            }}
          >
            <Pencil size={14} />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}