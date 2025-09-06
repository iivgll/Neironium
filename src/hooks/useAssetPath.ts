export const useAssetPath = () => {
  const basePath = process.env.NODE_ENV === "production" ? "/Neironium" : "";

  const getAssetPath = (path: string) => {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${basePath}/${cleanPath}`;
  };

  return { getAssetPath };
};
