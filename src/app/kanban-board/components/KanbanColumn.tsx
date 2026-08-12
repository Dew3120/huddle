'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Task, Teammate, ColumnId } from './types';
import { COLUMN_LABELS } from './types';
import TaskCard from './TaskCard';

const COLUMN_ACCENT: Record<ColumnId, string> = {
  todo: 'bg-slate-400',
  doing: 'bg-amber-400',
  done: 'bg-emerald-400',
};

const COLUMN_ACCENT_GLOW: Record<ColumnId, string> = {
  todo: 'rgba(148,163,184,0.5)',
  doing: 'rgba(251,191,36,0.5)',
  done: 'rgba(52,211,153,0.5)',
};

const COLUMN_ACCENT_GLOW_DARK: Record<ColumnId, string> = {
  todo: 'rgba(148,163,184,0.35)',
  doing: 'rgba(251,191,36,0.35)',
  done: 'rgba(52,211,153,0.35)',
};

const COLUMN_COUNT_BG: Record<ColumnId, string> = {
  todo: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  doing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
};

const COLUMN_DRAG_ACCENT: Record<ColumnId, string> = {
  todo: 'border-slate-400 bg-slate-50/80 dark:bg-black',
  doing: 'border-amber-400 bg-amber-50/80 dark:bg-black',
  done: 'border-emerald-400 bg-emerald-50/80 dark:bg-black',
};

interface KanbanColumnProps {
  columnId: ColumnId;
  tasks: Task[];
  totalCount: number;
  teammates: Teammate[];
  isDragOver: boolean;
  draggedTaskId: string | null;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (taskId: string, toColumn: ColumnId) => void;
  onDragStart: (taskId: string) => void;
  onDragOver: (colId: ColumnId) => void;
  onDrop: (colId: ColumnId) => void;
  onDragEnd: () => void;
  isDark: boolean;
  onViewTaskDetail: (task: Task) => void;
}

export default function KanbanColumn({
  columnId,
  tasks,
  totalCount,
  teammates,
  isDragOver,
  draggedTaskId,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDark,
  onViewTaskDetail,
}: KanbanColumnProps) {
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    onDragOver(columnId);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    onDrop(columnId);
  };

  const glowColor = isDark ? COLUMN_ACCENT_GLOW_DARK[columnId] : COLUMN_ACCENT_GLOW[columnId];

  return (
    <div
      className={`flex h-full min-w-0 max-w-none flex-col rounded-2xl border transition-all duration-[250ms] ${
        isDragOver
          ? `${COLUMN_DRAG_ACCENT[columnId]} scale-[1.01] shadow-lg`
          : 'border-border/70 bg-white/70 hover:border-border hover:bg-white/90 hover:shadow-md dark:bg-black dark:hover:bg-black'
      }`}
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: isDragOver
          ? `0 0 0 2px ${glowColor}, 0 8px 32px rgba(0,0,0,${isDark ? '0.3' : '0.08'})`
          : undefined,
        transition: 'all 250ms cubic-bezier(0.34,1.56,0.64,1)',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className="flex items-center justify-between rounded-t-2xl border-b border-border/60 px-4 py-3.5"
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${COLUMN_ACCENT[columnId]} transition-all duration-300`}
            style={{
              transform: isHeaderHovered ? 'scale(1.4)' : 'scale(1)',
              boxShadow: isHeaderHovered ? `0 0 8px ${glowColor}` : 'none',
            }}
          />

          <h2 className="text-base font-semibold text-foreground">{COLUMN_LABELS[columnId]}</h2>

          <span
            className={`count-badge rounded-full px-2 py-0.5 text-xs font-semibold ${COLUMN_COUNT_BG[columnId]} transition-all duration-200`}
            style={{
              transform: isHeaderHovered ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {totalCount}
          </span>
        </div>

        <button
          onClick={onAddTask}
          className="add-task-btn ripple-btn rounded-lg p-1.5 text-muted-foreground"
          aria-label={`Add task to ${COLUMN_LABELS[columnId]}`}
          title={`Add task to ${COLUMN_LABELS[columnId]}`}
        >
          <Plus size={16} />
        </button>
      </div>

      {isDragOver && (
        <div
          className="fade-in mx-3 mt-3 flex h-14 items-center justify-center rounded-xl border-2 border-dashed border-current text-xs font-medium opacity-30"
          style={{
            color: columnId === 'todo' ? '#94a3b8' : columnId === 'doing' ? '#f59e0b' : '#10b981',
          }}
        >
          Drop here
        </div>
      )}

      <div className="max-h-[calc(100vh-150px)] flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {tasks.length === 0 && !isDragOver ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="float-dot mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <span className={`h-5 w-5 rounded-md ${COLUMN_ACCENT[columnId]} opacity-40`} />
            </div>

            <p className="text-sm font-medium text-muted-foreground">No tasks here</p>

            <p className="mt-0.5 max-w-[160px] text-xs text-muted-foreground">
              Drag a card here or add a new task.
            </p>

            <button
              onClick={onAddTask}
              className="ripple-btn mt-3 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5 hover:text-primary/80 hover:underline dark:hover:bg-primary/10"
            >
              + Add task
            </button>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div
              key={task.id}
              className="card-enter"
              style={{ animationDelay: `${index * 40}ms`, opacity: 0 }}
            >
              <TaskCard
                task={task}
                teammates={teammates}
                isDragging={draggedTaskId === task.id}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
                onMove={(toColumn) => onMoveTask(task.id, toColumn)}
                onDragStart={() => onDragStart(task.id)}
                onDragEnd={onDragEnd}
                isDark={isDark}
                onViewDetail={() => onViewTaskDetail(task)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
