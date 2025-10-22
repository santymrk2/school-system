type RangeSyncResult = { start: string; end: string };

export function syncRangeOnStartChange(
  nextStart: string,
  currentEnd: string | null | undefined,
): RangeSyncResult {
  const start = nextStart;
  if (!currentEnd) {
    return { start, end: "" };
  }
  if (nextStart && currentEnd && nextStart > currentEnd) {
    return { start, end: nextStart };
  }
  return { start, end: currentEnd };
}

export function syncRangeOnEndChange(
  currentStart: string | null | undefined,
  nextEnd: string,
): RangeSyncResult {
  const end = nextEnd;
  if (!currentStart) {
    return { start: "", end };
  }
  if (currentStart && nextEnd && nextEnd < currentStart) {
    return { start: currentStart, end: currentStart };
  }
  return { start: currentStart, end };
}
