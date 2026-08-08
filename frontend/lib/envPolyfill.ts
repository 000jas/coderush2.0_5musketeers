// Polyfill utility to support Vite's import.meta.env syntax inside the Next.js runtime environment.
if (typeof globalThis !== 'undefined') {
  const meta = import.meta as any;
  if (!meta.env) {
    Object.defineProperty(meta, 'env', {
      value: {
        VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'https://stellx.onrender.com',
      },
      writable: true,
      configurable: true,
    });
  }
}

export {};
