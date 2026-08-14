'use client';

import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Loader2, X } from 'lucide-react';

import type { TaskInput } from '@/lib/api';

import type {
  ColumnId,
  TagKey,
  Task,
  Teammate,
} from './types';
import {
  COLUMN_LABELS,
  COLUMN_ORDER,
} from './types';

const ALL_TAGS: TagKey[] = [
  'Frontend',
  'Backend',
  'Design',
  'DevOps',
  'Testing',
  'Docs',
];

interface TaskFormValues {
  title: string;
  description: string;
  tag: TagKey;
  assigneeId: string;
  columnId: ColumnId;
}

interface TaskModalProps {
  mode: 'create' | 'edit';
  task: Task | null;
  defaultColumnId: ColumnId;
  teammates: Teammate[];
  onSave: (data: TaskInput) => Promise<void>;
  onClose: () => void;
}

export default function TaskModal({
  mode,
  task,
  defaultColumnId,
  teammates,
  onSave,
  onClose,
}: TaskModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<TaskFormValues>({
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      tag: task?.tag ?? 'Frontend',
      assigneeId:
        task?.assigneeId ??
        teammates[0]?.id ??
        '',
      columnId:
        task?.columnId ??
        defaultColumnId,
    },
  });

  const selectedAssigneeId = useWatch({
    control,
    name: 'assigneeId',
  });

  useEffect(() => {
    reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
      tag: task?.tag ?? 'Frontend',
      assigneeId:
        task?.assigneeId ??
        teammates[0]?.id ??
        '',
      columnId:
        task?.columnId ??
        defaultColumnId,
    });
  }, [
    task,
    defaultColumnId,
    teammates,
    reset,
  ]);

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [onClose]);

  const onSubmit = async (
    data: TaskFormValues,
  ) => {
    await onSave(data);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label={
        mode === 'create'
          ? 'Create new task'
          : 'Edit task'
      }
    >
      <div className="fade-in w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-foreground">
            {mode === 'create'
              ? 'New Task'
              : 'Edit Task'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="space-y-5 px-6 py-5">
            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-foreground"
                htmlFor="task-title"
              >
                Task title{' '}
                <span className="text-red-400">
                  *
                </span>
              </label>

              <input
                id="task-title"
                type="text"
                placeholder="e.g. Implement user notifications"
                className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring dark:bg-background ${
                  errors.title
                    ? 'border-red-400'
                    : 'border-border focus:border-primary'
                }`}
                {...register('title', {
                  required:
                    'Task title is required',
                  minLength: {
                    value: 3,
                    message:
                      'Title must be at least 3 characters',
                  },
                  maxLength: {
                    value: 120,
                    message:
                      'Title must be under 120 characters',
                  },
                })}
              />

              {errors.title && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-foreground"
                htmlFor="task-desc"
              >
                Description
              </label>

              <p className="mb-1.5 text-xs text-muted-foreground">
                Optional - add context, links, or
                acceptance criteria.
              </p>

              <textarea
                id="task-desc"
                rows={3}
                placeholder="What needs to be done and why?"
                className="w-full resize-none rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring dark:bg-background"
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-foreground"
                  htmlFor="task-tag"
                >
                  Tag{' '}
                  <span className="text-red-400">
                    *
                  </span>
                </label>

                <select
                  id="task-tag"
                  className={`w-full appearance-none rounded-lg border bg-white px-3 py-2.5 text-sm text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring dark:bg-background ${
                    errors.tag
                      ? 'border-red-400'
                      : 'border-border focus:border-primary'
                  }`}
                  {...register('tag', {
                    required: 'Tag is required',
                  })}
                >
                  {ALL_TAGS.map((tag) => (
                    <option
                      key={`modal-tag-${tag}`}
                      value={tag}
                    >
                      {tag}
                    </option>
                  ))}
                </select>

                {errors.tag && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.tag.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-foreground"
                  htmlFor="task-column"
                >
                  Column{' '}
                  <span className="text-red-400">
                    *
                  </span>
                </label>

                <select
                  id="task-column"
                  className="w-full appearance-none rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring dark:bg-background"
                  {...register('columnId')}
                >
                  {COLUMN_ORDER.map((columnId) => (
                    <option
                      key={`modal-col-${columnId}`}
                      value={columnId}
                    >
                      {COLUMN_LABELS[columnId]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium text-foreground"
                htmlFor="task-assignee"
              >
                Assignee{' '}
                <span className="text-red-400">
                  *
                </span>
              </label>

              <p className="mb-2 text-xs text-muted-foreground">
                Who is responsible for completing
                this task?
              </p>

              <div className="flex flex-wrap gap-2">
                {teammates.map((teammate) => (
                  <label
                    key={`assignee-opt-${teammate.id}`}
                    className="cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={teammate.id}
                      className="sr-only"
                      {...register('assigneeId', {
                        required:
                          'Assignee is required',
                      })}
                    />

                    <AssigneeChip
                      teammate={teammate}
                      selected={
                        selectedAssigneeId ===
                        teammate.id
                      }
                    />
                  </label>
                ))}
              </div>

              {errors.assigneeId && (
                <p className="mt-1.5 text-xs text-red-500">
                  {errors.assigneeId.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex min-w-[120px] items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : mode === 'create' ? (
                'Create Task'
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssigneeChip({
  teammate,
  selected,
}: {
  teammate: Teammate;
  selected: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm text-foreground transition-all ${
        selected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border hover:border-primary/50 hover:bg-primary/5'
      }`}
    >
      <div
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${teammate.color} text-xs font-bold text-white`}
      >
        {teammate.initials}
      </div>

      <span className="text-xs font-medium">
        {teammate.name.split(' ')[0]}
      </span>
    </div>
  );
}
