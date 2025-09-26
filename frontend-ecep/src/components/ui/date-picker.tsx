"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface DatePickerProps {
  value?: string | null;
  onChange?: (value: string | undefined) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
  required?: boolean;
  error?: boolean;
  align?: "start" | "center" | "end";
  showMonthDropdown?: boolean;
  showYearDropdown?: boolean;
}

const formatDisplay = (value: string) => {
  try {
    const date = parseISO(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return format(date, "dd/MM/yyyy");
  } catch (error) {
    return value;
  }
};

const getDate = (value?: string | null) => {
  if (!value) return undefined;
  try {
    const date = parseISO(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch (error) {
    return undefined;
  }
};

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      min,
      max,
      placeholder = "Seleccioná una fecha",
      disabled,
      className,
      name,
      id,
      required,
      error,
      align = "start",
      showMonthDropdown,
      showYearDropdown,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    const selectedDate = React.useMemo(() => getDate(value), [value]);
    const minDate = React.useMemo(() => getDate(min), [min]);
    const maxDate = React.useMemo(() => getDate(max), [max]);

    const handleSelect = React.useCallback(
      (date?: Date) => {
        if (disabled) {
          return;
        }

        if (!date) {
          onChange?.(undefined);
          return;
        }

        if ((minDate && date < minDate) || (maxDate && date > maxDate)) {
          return;
        }

        onChange?.(format(date, "yyyy-MM-dd"));
        setOpen(false);
      },
      [disabled, maxDate, minDate, onChange],
    );

    return (
      <div className={cn("w-full", className)}>
        {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
        <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              id={id}
              type="button"
              variant="outline"
              disabled={disabled}
              aria-required={required}
              aria-invalid={error || undefined}
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground",
                error && "border-destructive focus-visible:ring-destructive",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? formatDisplay(value) : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align={align} sideOffset={4}>
            <Calendar
              mode="single"
              selected={selectedDate}
              defaultMonth={selectedDate ?? minDate ?? undefined}
              onSelect={handleSelect}
              disabled={(date) => {
                if (disabled) return true;
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              fromDate={minDate}
              toDate={maxDate}
              {...(showMonthDropdown !== undefined
                ? { disableMonthDropdown: !showMonthDropdown }
                : {})}
              {...(showYearDropdown !== undefined
                ? { disableYearDropdown: !showYearDropdown }
                : {})}
              initialFocus
            />
            {!required && value ? (
              <div className="flex justify-end p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onChange?.(undefined);
                  }}
                >
                  Limpiar
                </Button>
              </div>
            ) : null}
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";
