export interface PagePaginationConfig {
  firstPageMaxItems: number;          // Capacity for page 1 (allows room for headers & QR codes)
  subsequentPageMaxItems: number;     // Capacity for middle pages 2..N-1 (compact header)
  lastPageMaxItemsWithSummary: number;// Capacity for last page (room for totals, remarks, and signature)
}

export const DEFAULT_PAGINATION_CONFIG: PagePaginationConfig = {
  firstPageMaxItems: 12,
  subsequentPageMaxItems: 18,
  lastPageMaxItemsWithSummary: 10,
};

export interface PaginatedPage<T = any> {
  pageIndex: number;
  pageNumber: number;
  totalPages: number;
  items: T[];
  isFirstPage: boolean;
  isLastPage: boolean;
  startIndex: number;
}

/**
 * Intelligently balances and splits item arrays across A4 pages
 * to ensure neither the header nor the summary totals box gets clipped.
 */
export function paginateCollection<T>(
  items: T[],
  config: Partial<PagePaginationConfig> = {}
): PaginatedPage<T>[] {
  const safeItems = items || [];
  const total = safeItems.length;

  const resolvedConfig: PagePaginationConfig = {
    firstPageMaxItems: config.firstPageMaxItems || DEFAULT_PAGINATION_CONFIG.firstPageMaxItems,
    subsequentPageMaxItems: config.subsequentPageMaxItems || DEFAULT_PAGINATION_CONFIG.subsequentPageMaxItems,
    lastPageMaxItemsWithSummary: config.lastPageMaxItemsWithSummary || DEFAULT_PAGINATION_CONFIG.lastPageMaxItemsWithSummary,
  };

  // Case 1: Empty or fits entirely on a single page with header and summary
  if (total <= resolvedConfig.lastPageMaxItemsWithSummary) {
    return [{
      pageIndex: 0,
      pageNumber: 1,
      totalPages: 1,
      items: safeItems,
      isFirstPage: true,
      isLastPage: true,
      startIndex: 0,
    }];
  }

  const rawPages: T[][] = [];

  // Case 2: Fits on 2 pages
  const twoPageMax = resolvedConfig.firstPageMaxItems + resolvedConfig.lastPageMaxItemsWithSummary;
  if (total <= twoPageMax) {
    const minOnPage2 = Math.min(3, total);
    const p1Count = Math.min(
      resolvedConfig.firstPageMaxItems,
      Math.max(1, total - Math.min(resolvedConfig.lastPageMaxItemsWithSummary, minOnPage2))
    );
    rawPages.push(safeItems.slice(0, p1Count));
    rawPages.push(safeItems.slice(p1Count));
  } else {
    // Case 3: 3 or more pages
    rawPages.push(safeItems.slice(0, resolvedConfig.firstPageMaxItems));
    let remaining = safeItems.slice(resolvedConfig.firstPageMaxItems);

    while (remaining.length > 0) {
      if (remaining.length <= resolvedConfig.lastPageMaxItemsWithSummary) {
        rawPages.push(remaining);
        break;
      }

      if (remaining.length <= resolvedConfig.subsequentPageMaxItems + resolvedConfig.lastPageMaxItemsWithSummary) {
        const nextCount = Math.min(
          resolvedConfig.subsequentPageMaxItems,
          Math.max(Math.ceil(remaining.length / 2), remaining.length - resolvedConfig.lastPageMaxItemsWithSummary)
        );
        rawPages.push(remaining.slice(0, nextCount));
        rawPages.push(remaining.slice(nextCount));
        break;
      }

      rawPages.push(remaining.slice(0, resolvedConfig.subsequentPageMaxItems));
      remaining = remaining.slice(resolvedConfig.subsequentPageMaxItems);
    }
  }

  const totalPages = rawPages.length;
  let runningIndex = 0;
  return rawPages.map((pageItems, idx) => {
    const pageStartIndex = runningIndex;
    runningIndex += pageItems.length;
    return {
      pageIndex: idx,
      pageNumber: idx + 1,
      totalPages,
      items: pageItems,
      isFirstPage: idx === 0,
      isLastPage: idx === totalPages - 1,
      startIndex: pageStartIndex,
    };
  });
}
