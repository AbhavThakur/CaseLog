import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Reminder } from "@/lib/types";

interface Props {
  reminders: Reminder[];
  onDaySelect?: (date: Date) => void;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function MiniCalendar({ reminders, onDaySelect }: Props) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Build set of dates that have reminders
  const reminderDates = useMemo(() => {
    const dateSet = new Map<string, number>();
    for (const r of reminders) {
      const d = r.dueDate?.toDate?.();
      if (!d) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      dateSet.set(key, (dateSet.get(key) ?? 0) + 1);
    }
    return dateSet;
  }, [reminders]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(viewYear, viewMonth));

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const dateKey = (day: number) => `${viewYear}-${viewMonth}-${day}`;

  const handleDayClick = (day: number) => {
    const key = dateKey(day);
    setSelectedDate(selectedDate === key ? null : key);
    onDaySelect?.(new Date(viewYear, viewMonth, day));
  };

  // Reminders for selected date
  const selectedReminders = useMemo(() => {
    if (!selectedDate) return [];
    const [y, m, d] = selectedDate.split("-").map(Number);
    return reminders.filter((r) => {
      const due = r.dueDate?.toDate?.();
      if (!due) return false;
      return (
        due.getFullYear() === y && due.getMonth() === m && due.getDate() === d
      );
    });
  }, [selectedDate, reminders]);

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={prevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] text-center py-1"
          >
            {d}
          </div>
        ))}

        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const key = dateKey(day);
          const count = reminderDates.get(key) ?? 0;
          const todayCell = isToday(day);
          const selected = selectedDate === key;

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`relative h-8 w-full rounded-md text-xs font-medium transition-all
                ${todayCell ? "ring-2 ring-[hsl(var(--primary))]/50 font-bold" : ""}
                ${selected ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "hover:bg-[hsl(var(--accent))]"}
              `}
            >
              {day}
              {count > 0 && !selected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
              )}
              {count > 1 && selected && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-[8px] text-white flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date reminders */}
      {selectedReminders.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-[hsl(var(--border))]">
          <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
            Reminders
          </p>
          {selectedReminders.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 text-xs"
            >
              <Bell className="h-3 w-3 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate">{r.title}</p>
                <p className="text-[hsl(var(--muted-foreground))] truncate">
                  {r.patientName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
