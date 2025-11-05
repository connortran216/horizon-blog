/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BE_HOST: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
