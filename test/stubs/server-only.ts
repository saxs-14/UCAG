// Stub for the "server-only" package under Vitest. The real package
// unconditionally throws on import (see node_modules/server-only/index.js)
// -- it only becomes a no-op via Next.js's build-time bundler resolving
// its "react-server" package.json export condition for genuine server
// components. Vitest runs plain Node, not that bundler, so without this
// alias (see vitest.config.ts resolve.alias) every test that transitively
// imports a module marked "server-only" (lib/env/server.ts,
// lib/firebase/admin.ts) would fail immediately, for a reason that has
// nothing to do with the code being tested.
export {};
