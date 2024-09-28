import { useCallback, useRef, useState } from "react";

export const useInfiniteScroll = (
  loadMore: () => Promise<void>,
  hasMoreProducts: boolean
) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreProducts) {
          setIsLoading(true);
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMoreProducts, loadMore]
  );

  return { lastProductRef, isLoading };
};
