'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sun, Moon, Trash2, StickyNote, X } from 'lucide-react';
import clsx from 'clsx';

// ── Types ──────────────────────────────────────────────────────────────────────
interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface Note {
  id: string;
  text: string;
  range: DateRange;
  createdAt: number;
}

interface MonthData {
  image: string;
  location: string;
  palette: { accent: string; accentLight: string; accentDark: string };
}

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTHS: MonthData[] = [
  { image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80', location: 'Patagonia, Argentina', palette: { accent: '#1B8FD2', accentLight: '#5BB8F5', accentDark: '#0F5F8A' } },
  { image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80', location: 'Swiss Alps, Switzerland', palette: { accent: '#2E86AB', accentLight: '#74C2E1', accentDark: '#1A5276' } },
  { image: 'https://images.unsplash.com/photo-1490750967868-88df5691cc8a?w=900&q=80', location: 'Kyoto, Japan', palette: { accent: '#E07B54', accentLight: '#F0A882', accentDark: '#A0522D' } },
  { image: 'https://images.unsplash.com/photo-1471115853179-bb1d604434e0?w=900&q=80', location: 'Scottish Highlands, UK', palette: { accent: '#4CAF7D', accentLight: '#81C995', accentDark: '#2E7D52' } },
  { image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80', location: 'Tuscany, Italy', palette: { accent: '#D4A843', accentLight: '#F0C96A', accentDark: '#9A7A28' } },
  { image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80', location: 'Maldives', palette: { accent: '#00B4D8', accentLight: '#48CAE4', accentDark: '#0077B6' } },
  { image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=900&q=80', location: 'Banff, Canada', palette: { accent: '#7B68EE', accentLight: '#A89AEF', accentDark: '#5A4DBB' } },
  { image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=900&q=80', location: 'Sahara Desert, Morocco', palette: { accent: '#E55B3C', accentLight: '#F08070', accentDark: '#B03020' } },
  { image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=900&q=80', location: 'Santorini, Greece', palette: { accent: '#3D85C8', accentLight: '#74B0E0', accentDark: '#1E5F8A' } },
  { image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&q=80', location: 'New York City, USA', palette: { accent: '#FF6B6B', accentLight: '#FF9A9A', accentDark: '#CC3333' } },
  { image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=900&q=80', location: 'Iceland', palette: { accent: '#48C9B0', accentLight: '#7DDBCA', accentDark: '#2E9B8A' } },
  { image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=900&q=80', location: 'Lapland, Finland', palette: { accent: '#8A6FD4', accentLight: '#B59AE8', accentDark: '#5A45A8' } },
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const HOLIDAYS: Record<string, string> = {
  '1-1': "New Year's Day",
  '2-14': "Valentine's Day",
  '3-17': "St. Patrick's Day",
  '4-1': "April Fools' Day",
  '5-1': "Labour Day",
  '6-21': "Summer Solstice",
  '7-4': "Independence Day",
  '8-15': "Assumption Day",
  '9-22': "Autumn Equinox",
  '10-31': "Halloween",
  '11-11': "Veterans Day",
  '12-25': "Christmas Day",
  '12-31': "New Year's Eve",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  // Monday-indexed
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(date: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const t = date.getTime();
  return t > start.getTime() && t < end.getTime();
}

function formatDate(date: Date) {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SpiralBinding() {
  return (
    <div className="spiral-binding" aria-hidden="true">
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="spiral-dot" />
      ))}
    </div>
  );
}

interface DayCellProps {
  date: Date | null;
  isOtherMonth?: boolean;
  isToday?: boolean;
  isStart?: boolean;
  isEnd?: boolean;
  isInRangeFlag?: boolean;
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
  isSat?: boolean;
  isSun?: boolean;
  holidayName?: string;
  hasNote?: boolean;
  accent: string;
  accentLight: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onMouseEnter?: () => void;
}

function DayCell({
  date, isOtherMonth, isToday, isStart, isEnd, isInRangeFlag,
  isRangeStart, isRangeEnd, isSat, isSun, holidayName, hasNote,
  accent, accentLight, onClick, onDoubleClick, onMouseEnter,
}: DayCellProps) {
  if (!date) return <div className="aspect-square" />;

  const baseText = isOtherMonth ? '#CBD5E1' : isSun ? '#E85C3A' : isSat ? accent : 'inherit';

  const wrapperClass = clsx(
    'day-wrapper relative flex items-center justify-center',
    isInRangeFlag && !isStart && !isEnd && 'in-range',
    isStart && isInRangeFlag && 'range-start',
    isEnd && isInRangeFlag && 'range-end',
  );

  const cellClass = clsx(
    'day-cell',
    isToday && !isStart && !isEnd && 'day-today',
    isStart && 'day-start',
    isEnd && 'day-end',
    isOtherMonth && 'day-other-month opacity-30 cursor-default pointer-events-none',
  );

  const cellStyle: React.CSSProperties = {};
  if (isStart || isEnd) {
    cellStyle.background = accent;
    cellStyle.color = 'white';
  } else if (!isOtherMonth) {
    cellStyle.color = baseText;
  }

  return (
    <div
      className={wrapperClass}
      style={isInRangeFlag && !isStart && !isEnd ? { background: `${accentLight}22` } : undefined}
    >
      <button
        className={cellClass}
        style={cellStyle}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseEnter={onMouseEnter}
        title={holidayName || undefined}
        aria-label={date ? `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}${holidayName ? `, ${holidayName}` : ''}` : undefined}
      >
        {date.getDate()}
        {holidayName && !isStart && !isEnd && (
          <span className="holiday-dot" style={{ background: isInRangeFlag ? accent : '#E85C3A' }} />
        )}
        {hasNote && !isStart && !isEnd && (
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: accent, opacity: 0.85 }} />
        )}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function WallCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<'next' | 'prev'>('next');
  const [showNotePanel, setShowNotePanel] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activeNotes, setActiveNotes] = useState<Note[]>([]);
  const [clickedDate, setClickedDate] = useState<Date | null>(null);
  const [yearInput, setYearInput] = useState(viewYear.toString());
  const calendarRef = useRef<HTMLDivElement>(null);

  const monthData = MONTHS[viewMonth];
  const { accent, accentLight, accentDark } = monthData.palette;

  // Load persisted data
  useEffect(() => {
    const savedNotes = loadStorage<any[]>('cal_notes', []);
    const migratedNotes = savedNotes.map(n => {
      if (n.dateKey && !n.range) {
        const parts = n.dateKey.split('→');
        const [year, month, day] = parts[0].split('-').map(Number);
        const start = new Date(year, month, day);
        let end = null;
        if (parts[1]) {
          const [endYear, endMonth, endDay] = parts[1].split('-').map(Number);
          end = new Date(endYear, endMonth, endDay);
        }
        return { ...n, range: { start, end }, dateKey: undefined };
      }
      // New notes might have string dates, convert them back to Date objects
      if (n.range && typeof n.range.start === 'string') {
        n.range.start = new Date(n.range.start);
      }
      if (n.range && n.range.end && typeof n.range.end === 'string') {
        n.range.end = new Date(n.range.end);
      }
      return n;
    });
    setNotes(migratedNotes);
    setDarkMode(loadStorage<boolean>('cal_dark', false));
  }, []);

  useEffect(() => { saveStorage('cal_notes', notes); }, [notes]);
  useEffect(() => { saveStorage('cal_dark', darkMode); }, [darkMode]);

  // Update year input when viewYear changes
  useEffect(() => {
    setYearInput(viewYear.toString());
  }, [viewYear]);

  // Reset image loaded state on month change
  useEffect(() => { setImgLoaded(false); }, [viewMonth]);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const navigate = useCallback((dir: 'next' | 'prev') => {
    if (isFlipping) return;
    setFlipDir(dir);
    setIsFlipping(true);
    setTimeout(() => {
      setViewMonth(m => {
        if (dir === 'next') {
          if (m === 11) { setViewYear(y => y + 1); return 0; }
          return m + 1;
        } else {
          if (m === 0) { setViewYear(y => y - 1); return 11; }
          return m - 1;
        }
      });
      setIsFlipping(false);
    }, 450);
  }, [isFlipping]);

  const navigateYear = (dir: 'next' | 'prev') => {
    if (isFlipping) return;
    setViewYear(y => y + (dir === 'next' ? 1 : -1));
  };

  const handleYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newYear = parseInt(yearInput, 10);
    if (!isNaN(newYear) && newYear > 1000 && newYear < 3000) {
      setViewYear(newYear);
    } else {
      setYearInput(viewYear.toString()); // reset if invalid
    }
  };

  // ── Calendar grid ───────────────────────────────────────────────────────────
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);

  const cells: (Date | null)[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(viewYear, viewMonth === 0 ? viewMonth - 1 : viewMonth - 1, prevMonthDays - i);
    cells.push(d);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewYear, viewMonth, d));
  }
  const trailing = 7 - (cells.length % 7);
  if (trailing < 7) {
    for (let d = 1; d <= trailing; d++) {
      cells.push(new Date(viewYear, viewMonth + 1, d));
    }
  }

  // ── Range selection ─────────────────────────────────────────────────────────
  const handleDayClick = (date: Date) => {
    if (!selecting || !range.start) {
      setRange({ start: date, end: null });
      setSelecting(true);
    } else {
      if (date < range.start) {
        setRange({ start: date, end: range.start });
      } else {
        setRange({ start: range.start, end: date });
      }
      setSelecting(false);
      setHoverDate(null);
      setShowNotePanel(true);
    }
  };

  const clearRange = () => {
    setRange({ start: null, end: null });
    setSelecting(false);
    setHoverDate(null);
  };

  const effectiveEnd = selecting && hoverDate ? hoverDate : range.end;
  const rangeStart = effectiveEnd && range.start && effectiveEnd < range.start ? effectiveEnd : range.start;
  const rangeEnd = effectiveEnd && range.start && effectiveEnd < range.start ? range.start : effectiveEnd;

  // ── Notes ───────────────────────────────────────────────────────────────────
  const addNote = () => {
    if (!noteInput.trim() || !range.start) return;
    const note: Note = {
      id: `${Date.now()}`,
      text: noteInput.trim(),
      range: { start: range.start, end: range.end },
      createdAt: Date.now(),
    };
    setNotes(prev => [note, ...prev]);
    setNoteInput('');
    clearRange();
  };

  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  const monthNotes = notes.filter(n => {
    if (!n.range.start) return false;
    const noteStartYear = n.range.start.getFullYear();
    const noteStartMonth = n.range.start.getMonth();
    if (noteStartYear === viewYear && noteStartMonth === viewMonth) return true;
    if (n.range.end) {
      const noteEndYear = n.range.end.getFullYear();
      const noteEndMonth = n.range.end.getMonth();
      if (viewYear >= noteStartYear && viewYear <= noteEndYear) {
        if (viewYear === noteStartYear && viewMonth >= noteStartMonth) return true;
        if (viewYear === noteEndYear && viewMonth <= noteEndMonth) return true;
        if (viewYear > noteStartYear && viewYear < noteEndYear) return true;
      }
    }
    return false;
  });

  const handleDayDoubleClick = (date: Date) => {
    const clickedTime = date.getTime();
    const notesForDay: Note[] = [];
    for (const note of notes) {
      if (note.range.start) {
        const startTime = new Date(note.range.start).setHours(0, 0, 0, 0);
        const endTime = note.range.end ? new Date(note.range.end).setHours(23, 59, 59, 999) : startTime;
        if (clickedTime >= startTime && clickedTime <= endTime) {
          notesForDay.push(note);
        }
      }
    }
    setActiveNotes(notesForDay);
    setClickedDate(date);
  };

  // ── Holiday check ────────────────────────────────────────────────────────────
  const getHoliday = (date: Date) => {
    const key = `${date.getMonth() + 1}-${date.getDate()}`;
    return HOLIDAYS[key] || null;
  };

  const notesByDate: Record<string, boolean> = {};
  notes.forEach(n => {
    if (n.range.start) {
      let currentDate = new Date(n.range.start);
      const endDate = n.range.end || n.range.start;
      while (currentDate <= endDate) {
        notesByDate[dateKey(currentDate)] = true;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="w-full max-w-4xl mx-auto"
      style={darkMode ? { '--bg': '#111318', '--calendar-bg': '#1E2028', '--text': '#F0EEE8', '--subtext': '#9CA3AF', '--border-color': '#2E3038' } as React.CSSProperties : {}}
    >
      {/* Header: Controls */}
      <div className="flex justify-between items-center mb-3">
        {/* Year Navigation */}
        <form onSubmit={handleYearSubmit} className="flex items-center gap-2">
          <label htmlFor="year-input" className="text-sm font-medium" style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>Year:</label>
          <input
            id="year-input"
            type="number"
            value={yearInput}
            onChange={e => setYearInput(e.target.value)}
            className="w-20 px-2 py-1 rounded-md text-sm"
            style={{
              background: darkMode ? '#2E3038' : 'white',
              color: darkMode ? '#F0EEE8' : '#1A1A2E',
              border: `1px solid ${darkMode ? '#4B5563' : '#D1D5DB'}`,
            }}
          />
          <button type="submit" className="px-3 py-1 text-xs font-semibold rounded-md" style={{ background: accent, color: 'white' }}>Go</button>
        </form>

        {/* Theme toggle */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDarkMode(d => !d)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: darkMode ? '#2E3038' : 'rgba(255,255,255,0.7)',
              color: darkMode ? '#F0EEE8' : '#1A1A2E',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {darkMode ? <Sun size={13} /> : <Moon size={13} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Calendar card */}
      <div
        ref={calendarRef}
        className="rounded-2xl overflow-hidden"
        style={{
          background: darkMode ? '#1E2028' : '#FAFAF8',
          boxShadow: '0 24px 64px rgba(0,0,0,0.20), 0 4px 16px rgba(0,0,0,0.10)',
          perspective: '1200px',
        }}
      >
        {/* Spiral */}
        <div style={{ background: darkMode ? '#16181F' : '#E8E6E2', paddingTop: 4, paddingBottom: 4 }}>
          <SpiralBinding />
        </div>

        {/* Main content */}
        <div
          className={clsx('transition-all duration-500', isFlipping && (flipDir === 'next' ? 'flip-enter' : 'flip-enter'))}
          style={{ transformOrigin: 'top center' }}
        >
          {/* Hero image */}
          <div className="relative overflow-hidden" style={{ height: 'clamp(180px, 35vw, 320px)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={monthData.image}
              alt={monthData.location}
              onLoad={() => setImgLoaded(true)}
              className="w-full h-full object-cover transition-all duration-700"
              style={{ opacity: imgLoaded ? 1 : 0, transform: imgLoaded ? 'scale(1)' : 'scale(1.04)' }}
            />
            {/* Skeleton */}
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse" style={{ background: darkMode ? '#2A2D38' : '#E5E5E0' }} />
            )}

            {/* Decorative diagonal overlay */}
            <div className="absolute inset-0" style={{
              background: `linear-gradient(135deg, transparent 55%, ${accent}CC 55%, ${accent}EE 100%)`,
            }} />

            {/* Month title */}
            <div className="absolute bottom-0 right-0 p-5 text-right">
              <div className="font-mono text-white text-sm tracking-widest opacity-90 mb-0.5">{viewYear}</div>
              <div className="text-white font-bold tracking-wider uppercase" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {MONTH_NAMES[viewMonth]}
              </div>
            </div>

            {/* Location tag */}
            <div className="absolute top-3 left-3">
              <span className="text-white text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', letterSpacing: '0.03em' }}>
                📍 {monthData.location}
              </span>
            </div>

            {/* Nav buttons */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => navigate('prev')}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', color: 'white' }}
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => navigate('next')}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', color: 'white' }}
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Bottom section: grid + notes side by side on desktop */}
          <div className="flex flex-col lg:flex-row">
            {/* Calendar grid */}
            <div className="flex-1 p-4 sm:p-6">
              {/* Range selection hint */}
              {(range.start || selecting) && (
                <div
                  className="mb-3 flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium animate-fade-in"
                  style={{ background: `${accent}18`, color: accentDark, border: `1px solid ${accent}30` }}
                >
                  <span>
                    {selecting ? (
                      <>📅 Click to set end date · Start: <strong>{range.start ? formatDate(range.start) : '—'}</strong></>
                    ) : (
                      <>{formatDate(range.start!)} → {range.end ? formatDate(range.end) : '…'}</>
                    )}
                  </span>
                  <button onClick={clearRange} className="ml-2 hover:opacity-70 transition-opacity" aria-label="Clear selection">
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map((d, i) => (
                  <div
                    key={d}
                    className="text-center text-xs font-semibold py-1.5 tracking-wider"
                    style={{
                      color: i === 5 ? accent : i === 6 ? '#E85C3A' : darkMode ? '#9CA3AF' : '#9CA3AF',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((date, i) => {
                  if (!date) return <div key={i} className="aspect-square" />;
                  const isOtherMonth = date.getMonth() !== viewMonth;
                  const isToday = isSameDay(date, today);
                  const isStart = !!range.start && isSameDay(date, range.start);
                  const isEnd = !!range.end && isSameDay(date, range.end);
                  const inRange = isInRange(date, rangeStart ?? null, rangeEnd ?? null);
                  const holiday = getHoliday(date);
                  const dayOfWeek = (i % 7); // 0=Mon
                  const hasNote = !isOtherMonth && notesByDate[dateKey(date)];

                  return (
                    <DayCell
                      key={i}
                      date={date}
                      isOtherMonth={isOtherMonth}
                      isToday={isToday}
                      isStart={isStart}
                      isEnd={isEnd}
                      isInRangeFlag={inRange || isStart || isEnd}
                      isRangeStart={isStart}
                      isRangeEnd={isEnd}
                      isSat={dayOfWeek === 5}
                      isSun={dayOfWeek === 6}
                      holidayName={holiday || undefined}
                      hasNote={hasNote}
                      accent={accent}
                      accentLight={accentLight}
                      onClick={() => !isOtherMonth && handleDayClick(date)}
                      onDoubleClick={() => !isOtherMonth && handleDayDoubleClick(date)}
                      onMouseEnter={() => selecting && setHoverDate(date)}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-3 text-xs" style={{ color: darkMode ? '#9CA3AF' : '#9CA3AF' }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: accent }} />
                  Selected Range
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block border-2" style={{ borderColor: accent }} />
                  Today
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#E85C3A' }} />
                  Holiday
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: accent, opacity: 0.8 }} />
                  Has Note
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="lg:w-px my-0 mx-4 lg:mx-0 lg:my-6" style={{ background: darkMode ? '#2E3038' : '#E5E5E0' }} />

            {/* Notes panel */}
            <div
              className="w-full lg:w-72 xl:w-80 p-4 sm:p-6 flex flex-col gap-4"
              style={{ minWidth: 0 }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2"
                  style={{ color: darkMode ? '#F0EEE8' : '#1A1A2E', fontFamily: 'var(--font-display)' }}>
                  <StickyNote size={15} style={{ color: accent }} />
                  Notes
                </h3>
                {range.start && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${accent}20`, color: accentDark }}>
                    {range.end ? 'Range' : 'Single Day'}
                  </span>
                )}
              </div>

              {/* Note input */}
              <div className="flex flex-col gap-2">
                <textarea
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  placeholder={range.start ? `Add note for ${formatDate(range.start)}${range.end && !isSameDay(range.start, range.end) ? ' → ' + formatDate(range.end) : ''}…` : 'Select a date, then add a note…'}
                  rows={3}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote(); } }}
                  className="w-full rounded-lg px-3 py-2.5 text-sm resize-none outline-none transition-all"
                  style={{
                    background: darkMode ? '#252830' : '#F3F3F0',
                    border: `1.5px solid ${noteInput ? accent : darkMode ? '#2E3038' : '#E5E5E0'}`,
                    color: darkMode ? '#F0EEE8' : '#1A1A2E',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1.6,
                  }}
                />
                <button
                  onClick={addNote}
                  disabled={!noteInput.trim()}
                  className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-all"
                  style={{
                    background: noteInput.trim() ? accent : darkMode ? '#2E3038' : '#D1D5DB',
                    cursor: noteInput.trim() ? 'pointer' : 'not-allowed',
                    letterSpacing: '0.02em',
                  }}
                >
                  Add Note
                </button>
              </div>

              {/* Notes list */}
              <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 260 }}>
                {monthNotes.length === 0 ? (
                  <div className="text-xs text-center py-6 opacity-50" style={{ color: darkMode ? '#9CA3AF' : '#9CA3AF' }}>
                    No notes yet for {MONTH_NAMES[viewMonth]}
                  </div>
                ) : (
                  monthNotes.map(note => (
                    <div
                      key={note.id}
                      className="flex gap-2 p-2.5 rounded-lg group animate-fade-in"
                      style={{
                        background: darkMode ? '#252830' : '#F3F3F0',
                        border: `1px solid ${darkMode ? '#2E3038' : '#E5E5E0'}`,
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        {note.range.start && (
                          <div className="text-xs mb-0.5 font-medium truncate" style={{ color: accent }}>
                            📅 {note.range.end && !isSameDay(note.range.start!, note.range.end)
                              ? `${formatDate(note.range.start!)} → ${formatDate(note.range.end)}`
                              : 'Single Day'}
                          </div>
                        )}
                        <p className="text-xs leading-relaxed" style={{ color: darkMode ? '#D1D5DB' : '#374151', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {note.text}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                        style={{ color: '#E85C3A' }}
                        aria-label="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Note lines decoration (physical calendar feel) */}
              <div className="mt-auto pt-2 hidden lg:flex flex-col gap-2" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="notes-line" style={{ borderColor: darkMode ? '#2E3038' : '#E5E5E0' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeNotes.length > 0 && clickedDate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setActiveNotes([])}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full text-black"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-lg mb-4">
              Notes for {formatDate(clickedDate)}
            </h3>
            <div className="max-h-60 overflow-y-auto pr-2">
              {activeNotes.map(note => (
                <div key={note.id} className="mb-4 border-b pb-2">
                  <p className="text-sm">{note.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {note.range.end && !isSameDay(note.range.start!, note.range.end)
                      ? `${formatDate(note.range.start!)} → ${formatDate(note.range.end)}`
                      : 'Single Day'}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveNotes([])}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-4 text-xs" style={{ color: darkMode ? '#6B7280' : '#9CA3AF', fontFamily: 'var(--font-mono)' }}>
        Click a day to start selection · Click again to complete range
      </div>
    </div>
  );
}
