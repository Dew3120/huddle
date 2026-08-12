'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LayoutGrid, LogOut, Moon, Plus, Search, Sun, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLogo from '@/components/ui/AppLogo';
import type { TagKey, Teammate } from './types';

const ALL_TAGS: TagKey[] = ['Frontend', 'Backend', 'Design', 'DevOps', 'Testing', 'Docs'];

const TAG_STYLES: Record<TagKey, string> = {
  Frontend: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  Backend: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  Design: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
  DevOps: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  Testing: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
  Docs: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
};

interface KanbanNavbarProps {
  teammates: Teammate[];
  filterAssignee: string | null;
  setFilterAssignee: (id: string | null) => void;
  filterTag: TagKey | null;
  setFilterTag: (tag: TagKey | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNewTask: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export default function KanbanNavbar({
  teammates,
  filterAssignee,
  setFilterAssignee,
  filterTag,
  setFilterTag,
  searchQuery,
  setSearchQuery,
  onNewTask,
  isDark,
  onToggleDark,
}: KanbanNavbarProps) {
  const router = useRouter();
  const [tagOpen, setTagOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const tagRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (tagRef.current && !tagRef.current.contains(event.target as Node)) {
        setTagOpen(false);
      }

      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    toast.success('Signed out successfully');
    router.push('/');
  };

  const clearFilters = () => {
    setFilterAssignee(null);
    setFilterTag(null);
    setSearchQuery('');
  };

  const activeFilters = (filterAssignee ? 1 : 0) + (filterTag ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <header className="navbar-glass fixed inset-x-0 top-0 z-50">
      <div className="flex h-16 items-center gap-4 px-6">
        <div className="flex flex-shrink-0 items-center gap-3">
          <div className="group flex cursor-pointer items-center gap-2">
            <div className="transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110">
              <AppLogo size={24} />
            </div>

            <span className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
              Huddle
            </span>
          </div>

          <div className="hidden items-center gap-1.5 text-muted-foreground sm:flex">
            <span className="text-border">/</span>
            <LayoutGrid size={14} className="transition-transform hover:scale-105" />
            <span className="text-sm font-semibold text-foreground">Team Board</span>
          </div>
        </div>

        <div className="hidden w-[360px] flex-none md:block">
          <div
            className={`relative rounded-xl transition-all duration-200 ${
              searchFocused
                ? 'shadow-[0_0_0_3px_rgba(124,58,237,0.2)] dark:shadow-[0_0_0_3px_rgba(167,139,250,0.25)]'
                : ''
            }`}
          >
            <Search
              size={15}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                searchFocused ? 'text-primary' : 'text-muted-foreground'
              }`}
            />

            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="h-10 w-full rounded-xl border border-border bg-white pl-9 pr-4 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring dark:bg-white dark:text-slate-700 dark:focus:bg-white"
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:scale-110 hover:text-primary active:scale-90"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="fade-in hidden items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary transition-all duration-150 hover:scale-105 hover:bg-primary/20 active:scale-95 dark:bg-primary/20 dark:hover:bg-primary/30 sm:flex"
            >
              <X size={11} />
              Clear filters ({activeFilters})
            </button>
          )}

          <div className="hidden">
            {teammates.map((teammate) => (
              <button
                key={`filter-tm-${teammate.id}`}
                onClick={() => setFilterAssignee(filterAssignee === teammate.id ? null : teammate.id)}
                title={`Filter by ${teammate.name}`}
                className={`avatar-hover flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white transition-all duration-200 ${teammate.color} ${
                  filterAssignee === teammate.id
                    ? 'scale-110 shadow-md ring-2 ring-primary ring-offset-2 dark:ring-offset-background'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {teammate.initials}
              </button>
            ))}
          </div>

          <div className="relative" ref={tagRef}>
            <button
              onClick={() => setTagOpen((value) => !value)}
              className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                filterTag
                  ? 'border-primary bg-primary/5 text-primary shadow-sm dark:bg-primary/10'
                  : 'border-border bg-white text-muted-foreground hover:border-foreground/30 hover:text-foreground hover:shadow-sm dark:bg-card'
              }`}
            >
              {filterTag || 'Tag'}
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${tagOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {tagOpen && (
              <div className="fade-in absolute right-0 top-full z-[70] mt-3 w-[220px] rounded-[22px] border border-violet-500/20 bg-[#232139] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.35),0_0_0_1px_rgba(167,139,250,0.08)]">
                <button
                  onClick={() => {
                    setFilterTag(null);
                    setTagOpen(false);
                  }}
                  className={`mb-3 block text-left text-base font-semibold transition-colors hover:text-violet-200 ${
                    !filterTag ? 'text-violet-300' : 'text-violet-300/85'
                  }`}
                >
                  All tags
                </button>

                <div className="flex flex-col items-start gap-3">
                  {ALL_TAGS.map((tag) => (
                    <button
                      key={`tag-filter-${tag}`}
                      onClick={() => {
                        setFilterTag(tag);
                        setTagOpen(false);
                      }}
                      className={`rounded-full transition-transform duration-150 hover:translate-x-1.5 hover:scale-105 active:scale-95 ${
                        filterTag === tag ? 'ring-2 ring-violet-300/70 ring-offset-2 ring-offset-[#232139]' : ''
                      }`}
                    >
                      <span className={`rounded-full px-2 py-0.5 text-base font-semibold ${TAG_STYLES[tag]}`}>
                        {tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onToggleDark}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 ${
              isDark
                ? 'border-violet-500/50 bg-violet-500/15 text-violet-300 shadow-[0_0_12px_rgba(167,139,250,0.3)] hover:bg-violet-500/25'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
            }`}
          >
            <span
              className="absolute inset-0 flex items-center justify-center transition-all duration-300"
              style={{
                opacity: isDark ? 1 : 0,
                transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
              }}
            >
              <Moon size={16} />
            </span>

            <span
              className="absolute inset-0 flex items-center justify-center transition-all duration-300"
              style={{
                opacity: isDark ? 0 : 1,
                transform: isDark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
              }}
            >
              <Sun size={16} />
            </span>
          </button>

          <button
            onClick={onNewTask}
            className="btn-primary ripple-btn group flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold"
          >
            <Plus size={16} className="transition-transform duration-200 group-hover:rotate-90" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">New</span>
          </button>

          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserOpen((value) => !value)}
              className="avatar-hover flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white transition-all duration-200"
              aria-label="User menu"
            >
              KR
            </button>

            {userOpen && (
              <div className="fade-in absolute right-0 top-full z-[70] mt-1.5 w-48 rounded-xl border border-border bg-white py-1.5 shadow-xl dark:bg-card">
                <div className="mb-1 border-b border-border px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">Kai Reyes</p>
                  <p className="text-xs text-muted-foreground">kai@huddle.dev</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="group/logout flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-all hover:translate-x-0.5 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut size={14} className="transition-transform group-hover/logout:translate-x-0.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-border bg-muted/40 py-2 pl-8 pr-4 text-sm text-foreground transition-all placeholder:text-muted-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring dark:bg-muted/60 dark:focus:bg-card"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
