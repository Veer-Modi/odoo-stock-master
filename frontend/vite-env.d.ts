/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_VISUAL_EDITS?: string;
  // Add other Vite environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}


