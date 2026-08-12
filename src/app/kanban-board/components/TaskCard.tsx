'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Trash2, ArrowRight, MoreHorizontal } from 'lucide-react';
import {
  Task,
  Teammate,
  ColumnId,
  TAG_STYLES,
  COLUMN_LABELS,
  COLUMN_ORDER,
} from './types';

interface TaskCardProps {
  task: Task;
  teammates: Teammate[];
  isDragging: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (toColumn: ColumnId) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDark: boolean;
  onViewDetail: () => void;
}

export default function TaskCard({
  task,
  teammates,
  isDragging,
  onEdit,
  onDelete,
  onMove,
  onDragStart,
  onDragEnd,
  isDark,
  onViewDetail,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStarted = useRef(false);

  const assignee = teammates.find((teammate) => teammate.id === task.assigneeId);
  const otherColumns = COLUMN_ORDER.filter((column) => column !== task.columnId);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setShowMoveMenu(false);
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClick);
    }

    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || isDragging) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -2;
      const rotateY = ((x - centerX) / centerX) * 2;

      cardRef.current.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px) scale(1.005)`;
    },
    [isDragging],
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;

    setIsHovered(false);
    cardRef.current.style.transform = '';
    cardRef.current.style.transition =
      'transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease, border-color 300ms ease';
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!cardRef.current) return;

    setIsHovered(true);
    cardRef.current.style.transition =
      'transform 80ms ease-out, box-shadow 80ms ease-out, border-color 80ms ease-out';
  }, []);

  const hoverShadow = isDark
    ? '0 0 0 1px rgba(167,139,250,0.58), 0 0 14px 2px rgba(167,139,250,0.22), 0 10px 28px 0 rgba(0,0,0,0.45)'
    : '0 0 0 1px rgba(124,58,237,0.38), 0 0 12px 2px rgba(124,58,237,0.16), 0 10px 26px 0 rgba(124,58,237,0.12)';

  const hoverBorderColor = isDark
    ? 'rgba(167,139,250,0.75)'
    : 'rgba(124,58,237,0.5)';

  const defaultShadow = isDark
    ? '0 0 0 1px rgba(167,139,250,0.18), 0 4px 16px 0 rgba(0,0,0,0.45), 0 1px 4px 0 rgba(167,139,250,0.1)'
    : '0 0 0 1px rgba(124,58,237,0.1), 0 4px 16px 0 rgba(124,58,237,0.08), 0 1px 4px 0 rgba(0,0,0,0.06)';

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={() => {
        dragStarted.current = true;
        onDragStart();
      }}
      onDragEnd={() => {
        onDragEnd();
        setTimeout(() => {
          dragStarted.current = false;
        }, 50);
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (!dragStarted.current && !menuOpen) onViewDetail();
      }}
      className={`card-shimmer group cursor-pointer select-none rounded-[20px] border bg-white active:cursor-grabbing dark:bg-card card-enter ${
        isDragging ? 'drag-ghost' : ''
      }`}
      style={{
        willChange: 'transform',
        boxShadow: isHovered && !isDragging ? hoverShadow : defaultShadow,
        borderColor:
          isHovered && !isDragging
            ? hoverBorderColor
            : isDark
              ? 'rgba(167,139,250,0.22)'
              : 'rgba(124,58,237,0.14)',
        transition: 'box-shadow 220ms ease, border-color 220ms ease',
        padding: '14px 16px',
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={`tag-badge rounded-full px-2 py-0.5 text-xs font-semibold ${TAG_STYLES[task.tag]}`}
        >
          {task.tag}
        </span>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((value) => !value);
              setShowMoveMenu(false);
            }}
            className="p-1.5 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-all duration-150 hover:scale-110 active:scale-95"
            aria-label="Task actions"
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-card rounded-xl border border-border shadow-xl z-50 py-1.5 fade-in">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-colors group/item"
              >
                <Pencil
                  size={13}
                  className="transition-transform group-hover/item:rotate-12"
                />
                Edit task
              </button>

              <div className="relative">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowMoveMenu((value) => !value);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <ArrowRight
                    size={13}
                    className={`transition-transform ${
                      showMoveMenu ? 'translate-x-0.5' : ''
                    }`}
                  />
                  Move to
                  <span className="ml-auto text-muted-foreground">&gt;</span>
                </button>

                {showMoveMenu && (
                  <div className="absolute left-full top-0 ml-1 w-36 bg-white dark:bg-card rounded-xl border border-border shadow-xl z-50 py-1.5 fade-in">
                    {otherColumns.map((column) => (
                      <button
                        key={`move-${task.id}-${column}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onMove(column);
                          setMenuOpen(false);
                          setShowMoveMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {COLUMN_LABELS[column]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-border my-1" />

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group/del"
              >
                <Trash2
                  size={13}
                  className="transition-transform group-hover/del:scale-110"
                />
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="mb-3 pr-1 text-sm font-semibold leading-snug text-foreground transition-colors duration-150 group-hover:text-primary/90">
        {task.title}
      </p>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground/60">
          {task.createdAt}
        </span>

        {assignee && (
          <div
            className={`avatar-hover flex h-7 w-7 flex-shrink-0 cursor-pointer items-center justify-center rounded-full ${assignee.color} text-xs font-bold text-white`}
            title={assignee.name}
            aria-label={`Assigned to ${assignee.name}`}
          >
            {assignee.initials}
          </div>
        )}
      </div>
    </div>
  );
}
