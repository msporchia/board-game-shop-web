/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Browser-side base URL of the shop BFF (board-game-shop-api). */
  readonly VITE_SHOP_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
