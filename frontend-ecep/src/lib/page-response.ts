import type { PageResponse } from "@/types/pagination";

type PageLike<T> = PageResponse<T> | { content?: T[] } | T[] | null | undefined;

export function pageContent<T>(data: PageLike<T>): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    const maybeContent = (data as PageResponse<T>).content;
    if (Array.isArray(maybeContent)) {
      return maybeContent;
    }
  }

  return [];
}

export function hasPageContent<T>(data: PageLike<T>): data is PageResponse<T> {
  return !!data && typeof data === "object" && Array.isArray((data as PageResponse<T>).content);
}
