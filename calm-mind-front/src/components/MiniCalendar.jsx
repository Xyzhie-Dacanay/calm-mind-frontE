import React from "react";
import dayjs from "dayjs";
import { Calendar } from "@mantine/dates";
import { Indicator } from "@mantine/core";

/**
 * MiniCalendar
 * - Static or interactive Mantine calendar with optional dot indicators.
 *
 * Props:
 *  - value?: Date[]                // selected dates (interactive mode)
 *  - onChange?: (Date[]) => void   // selection change (interactive mode)
 *  - maxSelections?: number        // default 3 (interactive mode)
 *  - initialMonth?: Date
 *  - size?: "xs" | "sm" | "md" | "lg" | "xl"
 *  - className?: string
 *  - staticMode?: boolean          // NEW: true => static calendar (no selection)
 *  - indicators?: Date[]           // NEW: show a small dot on these exact dates
 *  - indicatorColor?: string       // NEW: Mantine color for the dot (default "red")
 */
export default function MiniCalendar({
  value = [],
  onChange,
  maxSelections = 3,
  initialMonth,
  size = "sm",
  className = "",
  staticMode = false,
  indicators = [],
  indicatorColor = "red",
}) {
  const [selected, setSelected] = React.useState(value);
  React.useEffect(() => setSelected(value), [value]);

  const toggle = (date) => {
    const exists = selected.some((d) => dayjs(d).isSame(date, "date"));
    let next;
    if (exists) {
      next = selected.filter((d) => !dayjs(d).isSame(date, "date"));
    } else {
      if (selected.length >= maxSelections) return;
      next = [...selected, date];
    }
    setSelected(next);
    onChange?.(next);
  };

  // mark dates that match any date in `indicators`
  const hasIndicator = (date) =>
    indicators.some((d) => dayjs(d).isSame(date, "date"));

  return (
    <Calendar
      className={className}
      size={size}
      initialMonth={initialMonth}
      static={staticMode}
      // show dot on marked days (works in both static & interactive modes)
      renderDay={(date) => {
        const day = dayjs(date).date();
        const dot = hasIndicator(date);
        return (
          <Indicator
            size={6}
            color={indicatorColor}
            offset={-2}
            disabled={!dot}
          >
            <div>{day}</div>
          </Indicator>
        );
      }}
      // Only wire selection if NOT static
      {...(!staticMode && {
        getDayProps: (date) => ({
          selected: selected.some((d) => dayjs(d).isSame(date, "date")),
          onClick: () => toggle(date),
        }),
      })}
    />
  );
}
