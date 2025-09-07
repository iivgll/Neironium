import { useCallback } from "react";

export const useAssetPath = () => {
  const basePath = process.env.NODE_ENV === "production" ? "/Neironium" : "";

  const getAssetPath = useCallback(
    (path: string) => {
      // Remove leading slash if present to avoid double slashes
      const cleanPath = path.startsWith("/") ? path.slice(1) : path;
      return `${basePath}/${cleanPath}`;
    },
    [basePath],
  );

  return { getAssetPath };
};
