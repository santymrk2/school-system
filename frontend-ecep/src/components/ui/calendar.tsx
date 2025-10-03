'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { es } from 'date-fns/locale';
import type { CaptionProps } from 'react-day-picker';
import { DayPicker, useDayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type DayPickerProps = React.ComponentProps<typeof DayPicker>;

export type CalendarProps = DayPickerProps & {
  disableMonthDropdown?: boolean;
  disableYearDropdown?: boolean;
};

type CalendarCaptionProps = CaptionProps & {
  minDate?: Date;
  maxDate?: Date;
  disableMonthDropdown?: boolean;
  disableYearDropdown?: boolean;
  onMonthChange?: (month: Date) => void;
};

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

function CalendarCaption({
  displayMonth,
  locale,
  goToMonth,
  onMonthChange,
  minDate,
  maxDate,
  disableMonthDropdown,
  disableYearDropdown,
}: CalendarCaptionProps) {
  const { goToMonth: contextGoToMonth } = useDayPicker();
  const currentMonth = displayMonth.getMonth();
  const currentYear = displayMonth.getFullYear();
  const currentMonthStart = React.useMemo(
    () => monthStart(displayMonth),
    [displayMonth]
  );

  const minMonth = React.useMemo(
    () => (minDate ? monthStart(minDate) : undefined),
    [minDate]
  );
  const maxMonth = React.useMemo(
    () => (maxDate ? monthStart(maxDate) : undefined),
    [maxDate]
  );

  const clampMonth = React.useCallback(
    (date: Date) => {
      if (minMonth && date < minMonth) return minMonth;
      if (maxMonth && date > maxMonth) return maxMonth;
      return date;
    },
    [maxMonth, minMonth]
  );

  const monthFormatter = React.useCallback(
    (monthIndex: number) => {
      if (locale?.localize?.month) {
        return locale.localize.month(monthIndex, { width: 'wide' });
      }

      return new Date(currentYear, monthIndex, 1).toLocaleString(
        locale?.code,
        { month: 'long' }
      );
    },
    [currentYear, locale]
  );

  const months = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const dateForMonth = monthStart(new Date(currentYear, index, 1));
      const disabled = Boolean(
        (minMonth && dateForMonth < minMonth) ||
          (maxMonth && dateForMonth > maxMonth)
      );

      return {
        label: monthFormatter(index),
        value: String(index),
        disabled,
      };
    });
  }, [currentYear, maxMonth, minMonth, monthFormatter]);

  const years = React.useMemo(() => {
    const today = new Date();
    const fallbackMinYear = currentYear - 100;
    const fallbackMaxYear = currentYear + 50;

    const resolvedMinYear = minMonth
      ? Math.min(minMonth.getFullYear(), currentYear)
      : Math.min(fallbackMinYear, currentYear);
    const resolvedMaxYear = maxMonth
      ? Math.max(maxMonth.getFullYear(), currentYear)
      : Math.max(fallbackMaxYear, currentYear, today.getFullYear());

    const startYear = Math.min(resolvedMinYear, resolvedMaxYear);
    const endYear = Math.max(resolvedMinYear, resolvedMaxYear);

    return Array.from({ length: endYear - startYear + 1 }, (_, index) =>
      String(startYear + index)
    );
  }, [currentYear, maxMonth, minMonth]);

  const canNavigate = React.useMemo(
    () => Boolean(goToMonth ?? contextGoToMonth ?? onMonthChange),
    [contextGoToMonth, goToMonth, onMonthChange]
  );

  const navigateToMonth = React.useCallback(
    (nextDate: Date) => {
      const targetDate = clampMonth(nextDate);

      if (typeof goToMonth === 'function') {
        goToMonth(targetDate);
      } else if (typeof contextGoToMonth === 'function') {
        contextGoToMonth(targetDate);
      }

      if (typeof onMonthChange === 'function') {
        onMonthChange(targetDate);
      }
    },
    [clampMonth, contextGoToMonth, goToMonth, onMonthChange]
  );

  const handleMonthChange = React.useCallback(
    (value: string) => {
      const monthIndex = Number.parseInt(value, 10);
      if (Number.isNaN(monthIndex)) return;

      navigateToMonth(monthStart(new Date(currentYear, monthIndex, 1)));
    },
    [currentYear, navigateToMonth]
  );

  const handleYearChange = React.useCallback(
    (value: string) => {
      const year = Number.parseInt(value, 10);
      if (Number.isNaN(year)) return;

      navigateToMonth(monthStart(new Date(year, currentMonth, 1)));
    },
    [currentMonth, navigateToMonth]
  );

  const previousMonth = React.useMemo(
    () => monthStart(new Date(currentYear, currentMonth - 1, 1)),
    [currentMonth, currentYear]
  );
  const nextMonth = React.useMemo(
    () => monthStart(new Date(currentYear, currentMonth + 1, 1)),
    [currentMonth, currentYear]
  );

  const isPreviousDisabled = React.useMemo(() => {
    return Boolean(minMonth && currentMonthStart <= minMonth);
  }, [currentMonthStart, minMonth]);

  const isNextDisabled = React.useMemo(() => {
    return Boolean(maxMonth && currentMonthStart >= maxMonth);
  }, [currentMonthStart, maxMonth]);

  const navButtonClassName = React.useMemo(
    () =>
      cn(
        buttonVariants({ variant: 'outline' }),
        'h-8 w-8 bg-transparent p-0 disabled:pointer-events-none disabled:opacity-50'
      ),
    []
  );

  const handlePreviousMonth = React.useCallback(() => {
    if (isPreviousDisabled) return;
    navigateToMonth(previousMonth);
  }, [isPreviousDisabled, navigateToMonth, previousMonth]);

  const handleNextMonth = React.useCallback(() => {
    if (isNextDisabled) return;
    navigateToMonth(nextMonth);
  }, [isNextDisabled, navigateToMonth, nextMonth]);

  const renderMonthLabel = () => (
    <span className="h-8 w-[140px] text-sm font-medium capitalize text-center">
      {monthFormatter(currentMonth)}
    </span>
  );

  const renderYearLabel = () => (
    <span className="h-8 w-[112px] text-sm font-medium text-center">
      {currentYear}
    </span>
  );

  return (
    <div className="grid grid-cols-[auto_auto_auto] items-center justify-center gap-2">
      <button
        type="button"
        className={cn(navButtonClassName, 'justify-self-end')}
        onClick={handlePreviousMonth}
        aria-label="Mes anterior"
        disabled={isPreviousDisabled || !canNavigate}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex flex-col items-center gap-2 justify-self-center sm:flex-row">
        {disableMonthDropdown ? (
          renderMonthLabel()
        ) : (
          <Select
            value={String(currentMonth)}
            onValueChange={handleMonthChange}
            disabled={!canNavigate || months.every((month) => month.disabled)}
          >
            <SelectTrigger
              className="h-8 w-[140px] bg-transparent text-sm font-medium justify-center text-center"
              aria-label="Seleccionar mes"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {months.map((month) => (
                <SelectItem
                  key={month.value}
                  value={month.value}
                  disabled={month.disabled}
                  className="capitalize"
                >
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {disableYearDropdown ? (
          renderYearLabel()
        ) : (
          <Select
            value={String(currentYear)}
            onValueChange={handleYearChange}
            disabled={!canNavigate}
          >
            <SelectTrigger
              className="h-8 w-[112px] bg-transparent text-sm font-medium justify-center text-center"
              aria-label="Seleccionar año"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <button
        type="button"
        className={cn(navButtonClassName, 'justify-self-start')}
        onClick={handleNextMonth}
        aria-label="Mes siguiente"
        disabled={isNextDisabled || !canNavigate}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components,
  disableMonthDropdown = false,
  disableYearDropdown = false,
  locale,
  ...props
}: CalendarProps) {
  const minDate =
    props.fromDate ??
    props.fromMonth ??
    (typeof props.fromYear === 'number'
      ? new Date(props.fromYear, 0, 1)
      : undefined);
  const maxDate =
    props.toDate ??
    props.toMonth ??
    (typeof props.toYear === 'number'
      ? new Date(props.toYear, 11, 31)
      : undefined);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale ?? es}
      className={cn('p-3 flex flex-col items-center gap-4', className)}
      classNames={{
        months:
          'flex flex-col items-center sm:flex-row sm:items-start sm:justify-center space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'flex flex-col items-center space-y-4',
        caption: 'flex items-center justify-center gap-2 pt-1',
        caption_label: 'text-sm font-medium',
        nav: 'hidden',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex justify-center',
        head_cell:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2 justify-center',
        cell:
          'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        Caption: (captionProps) => (
          <CalendarCaption
            {...captionProps}
            minDate={minDate}
            maxDate={maxDate}
            disableMonthDropdown={disableMonthDropdown}
            disableYearDropdown={disableYearDropdown}
            onMonthChange={props.onMonthChange}
          />
        ),
        ...components,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
