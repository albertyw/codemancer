export interface AssetPaths {
  MAIN_JS: string;
  MAIN_CSS: string;
}

const DEFAULT_ASSET_PATHS: AssetPaths = {
  MAIN_JS: '/dist/main.js',
  MAIN_CSS: '/dist/main.css',
};

// Parse a webpack manifest into the hashed asset paths used by the index
// template. A null input (no manifest available, e.g. in development) yields the
// unhashed defaults that webpack-dev-middleware serves from memory.
export function parseManifest(content: string | null): AssetPaths {
  if (content === null) {
    return {...DEFAULT_ASSET_PATHS};
  }
  const manifest = JSON.parse(content) as Record<string, string>;
  return {
    MAIN_JS: manifest['main.js'] ?? DEFAULT_ASSET_PATHS.MAIN_JS,
    MAIN_CSS: manifest['main.css'] ?? DEFAULT_ASSET_PATHS.MAIN_CSS,
  };
}
