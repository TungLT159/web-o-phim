import { useEffect, useState } from "react";
import tmdbApi from "../../api/tmdbApi";

export const useMovieDetail = (category, id) => {
  const [item, setItem] = useState(null);
  const [itemRouteKey, setItemRouteKey] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const routeKey = `${category}/${id}`;

  useEffect(() => {
    let isCancelled = false;

    const loadDetail = async () => {
      try {
        setLoadError(null);
        setItem(null);
        setItemRouteKey(null);
        const response = await tmdbApi.detail(category, id, { params: {} });
        if (isCancelled) return;
        setItem(response.data.item);
        setItemRouteKey(routeKey);
        window.scrollTo(0, 0);
      } catch (error) {
        if (isCancelled) return;
        console.error("Error loading movie detail:", error);
        setItem(null);
        setItemRouteKey(null);
        setLoadError(
          "Không tải được dữ liệu phim. Vui lòng kiểm tra lại đường dẫn hoặc thử lại sau.",
        );
      }
    };

    loadDetail();

    return () => {
      isCancelled = true;
    };
  }, [category, id, routeKey]);

  return { item: itemRouteKey === routeKey ? item : null, loadError };
};
