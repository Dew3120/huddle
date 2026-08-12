'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { ColumnId, TagKey, Task } from './types';
import { COLUMN_ORDER, INITIAL_TASKS, TEAMMATES } from './types';
import KanbanColumn from './KanbanColumn';
import KanbanNavbar from './KanbanNavbar';
import TaskDetailModal from './TaskDetailModal';
import TaskModal from './TaskModal';

export type ModalMode = 'create' | 'edit' | null;

function getInitialDarkMode() {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem('huddle-dark-mode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return stored !== null ? stored === 'true' : prefersDark;
}

export default function KanbanBoardScreen() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<TagKey | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultColumn, setDefaultColumn] = useState<ColumnId>('todo');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);
  const [isDark, setIsDark] = useState(getInitialDarkMode);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const glowRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -200, y: -200 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('huddle-dark-mode', String(isDark));
  }, [isDark]);

  const toggleDark = useCallback(() => {
    setIsDark((previous) => !previous);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePos.current = { x: event.clientX, y: event.clientY };

      if (rafId.current) return;

      rafId.current = requestAnimationFrame(() => {
        if (glowRef.current) {
          glowRef.current.style.left = `${mousePos.current.x}px`;
          glowRef.current.style.top = `${mousePos.current.y}px`;
        }

        rafId.current = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const openCreateModal = useCallback((columnId: ColumnId = 'todo') => {
    setDefaultColumn(columnId);
    setEditingTask(null);
    setModalMode('create');
  }, []);

  const openEditModal = useCallback((task: Task) => {
    setEditingTask(task);
    setModalMode('edit');
  }, []);

  const openDetailModal = useCallback((task: Task) => {
    setDetailTask(task);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailTask(null);
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setEditingTask(null);
  }, []);

  const handleSaveTask = useCallback(
    (data: Omit<Task, 'id' | 'createdAt'>) => {
      if (modalMode === 'create') {
        const newTask: Task = {
          ...data,
          id: `task-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
        };

        setTasks((previous) => [...previous, newTask]);
        toast.success('Task created successfully');
      }

      if (modalMode === 'edit' && editingTask) {
        setTasks((previous) =>
          previous.map((task) => (task.id === editingTask.id ? { ...task, ...data } : task)),
        );

        toast.success('Task updated');
      }

      closeModal();
    },
    [modalMode, editingTask, closeModal],
  );

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((previous) => previous.filter((task) => task.id !== taskId));
    toast.success('Task deleted');
  }, []);

  const handleMoveTask = useCallback((taskId: string, toColumn: ColumnId) => {
    setTasks((previous) =>
      previous.map((task) => (task.id === taskId ? { ...task, columnId: toColumn } : task)),
    );

    const label = toColumn === 'todo' ? 'To Do' : toColumn === 'doing' ? 'Doing' : 'Done';
    toast.success(`Moved to ${label}`);
  }, []);

  const handleDragStart = useCallback((taskId: string) => {
    setDraggedId(taskId);
  }, []);

  const handleDragOver = useCallback((columnId: ColumnId) => {
    setDragOverColumn(columnId);
  }, []);

  const handleDrop = useCallback(
    (columnId: ColumnId) => {
      if (draggedId) {
        const task = tasks.find((item) => item.id === draggedId);

        if (task && task.columnId !== columnId) {
          handleMoveTask(draggedId, columnId);
        }
      }

      setDraggedId(null);
      setDragOverColumn(null);
    },
    [draggedId, tasks, handleMoveTask],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverColumn(null);
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase();

    if (filterAssignee && task.assigneeId !== filterAssignee) return false;
    if (filterTag && task.tag !== filterTag) return false;
    if (query && !task.title.toLowerCase().includes(query)) return false;

    return true;
  });

  const tasksByColumn = COLUMN_ORDER.reduce<Record<ColumnId, Task[]>>(
    (accumulator, columnId) => {
      accumulator[columnId] = filteredTasks.filter((task) => task.columnId === columnId);
      return accumulator;
    },
    { todo: [], doing: [], done: [] },
  );

  const totalByColumn = COLUMN_ORDER.reduce<Record<ColumnId, number>>(
    (accumulator, columnId) => {
      accumulator[columnId] = tasks.filter((task) => task.columnId === columnId).length;
      return accumulator;
    },
    { todo: 0, doing: 0, done: 0 },
  );

  const columnDelays = ['delay-75', 'delay-150', 'delay-225'];

  return (
    <div className="dark-transition board-bg relative flex min-h-screen flex-col overflow-x-hidden">
      <div
        ref={glowRef}
        className="cursor-glow"
        style={{ width: 400, height: 400, opacity: isDark ? 0.72 : 0.58 }}
        aria-hidden="true"
      />

      <KanbanNavbar
        teammates={TEAMMATES}
        filterAssignee={filterAssignee}
        setFilterAssignee={setFilterAssignee}
        filterTag={filterTag}
        setFilterTag={setFilterTag}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNewTask={() => openCreateModal('todo')}
        isDark={isDark}
        onToggleDark={toggleDark}
      />

      <main className="flex-1 overflow-x-auto px-6 pb-6 pt-[88px]">
        <div className="flex h-full min-w-[960px] gap-5 xl:min-w-0">
          {COLUMN_ORDER.map((columnId, index) => (
            <div
              key={`col-wrap-${columnId}`}
              className={`col-enter flex-1 ${columnDelays[index]}`}
              style={{ opacity: 0 }}
            >
              <KanbanColumn
                columnId={columnId}
                tasks={tasksByColumn[columnId]}
                totalCount={totalByColumn[columnId]}
                teammates={TEAMMATES}
                isDragOver={dragOverColumn === columnId}
                draggedTaskId={draggedId}
                onAddTask={() => openCreateModal(columnId)}
                onEditTask={openEditModal}
                onDeleteTask={handleDeleteTask}
                onMoveTask={handleMoveTask}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDark={isDark}
                onViewTaskDetail={openDetailModal}
              />
            </div>
          ))}
        </div>
      </main>

      {modalMode && (
        <TaskModal
          mode={modalMode}
          task={editingTask}
          defaultColumnId={defaultColumn}
          teammates={TEAMMATES}
          onSave={handleSaveTask}
          onClose={closeModal}
        />
      )}

      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          teammates={TEAMMATES}
          onClose={closeDetailModal}
          onEdit={() => {
            closeDetailModal();
            openEditModal(detailTask);
          }}
          onDelete={() => {
            handleDeleteTask(detailTask.id);
            closeDetailModal();
          }}
        />
      )}
    </div>
  );
}
