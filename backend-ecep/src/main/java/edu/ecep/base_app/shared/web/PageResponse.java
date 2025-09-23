package edu.ecep.base_app.shared.web;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;

/**
 * Simplified pagination payload to keep the contract consistent across endpoints.
 * Mirrors the default Spring Data page structure so the frontend can
 * consume a uniform shape without depending on the JPA specific Page implementation.
 */
public record PageResponse<T>(
        List<T> content,
        long totalElements,
        int totalPages,
        int size,
        int number,
        boolean first,
        boolean last,
        int numberOfElements,
        boolean empty,
        SortMetadata sort,
        PageableMetadata pageable
) {

    public static <T> PageResponse<T> from(Page<T> page) {
        SortMetadata sortMetadata = SortMetadata.from(page.getSort());
        PageableMetadata pageableMetadata = PageableMetadata.from(page, sortMetadata);
        return new PageResponse<>(
                page.getContent(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getSize(),
                page.getNumber(),
                page.isFirst(),
                page.isLast(),
                page.getNumberOfElements(),
                page.isEmpty(),
                sortMetadata,
                pageableMetadata
        );
    }

    /** Lightweight representation of Spring's sort metadata. */
    public record SortMetadata(boolean empty, boolean sorted, boolean unsorted) {
        private static SortMetadata from(Sort sort) {
            if (sort == null) {
                return new SortMetadata(true, false, true);
            }
            boolean isEmpty = sort.isEmpty();
            boolean isUnsorted = sort.isUnsorted();
            boolean isSorted = !isUnsorted;
            return new SortMetadata(isEmpty, isSorted, isUnsorted);
        }
    }

    /** Metadata compatible with the default Spring "pageable" payload. */
    public record PageableMetadata(
            SortMetadata sort,
            long offset,
            int pageNumber,
            int pageSize,
            boolean paged,
            boolean unpaged
    ) {
        private static PageableMetadata from(Page<?> page, SortMetadata sortMetadata) {
            int currentSize = page.getSize();
            int currentNumber = page.getNumber();
            long offset = (long) currentNumber * currentSize;
            boolean paged = currentSize != Integer.MAX_VALUE;
            boolean unpaged = !paged;
            return new PageableMetadata(sortMetadata, offset, currentNumber, currentSize, paged, unpaged);
        }
    }
}
