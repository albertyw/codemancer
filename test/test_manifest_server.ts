// Backend-only smoke test: ensure the module loads under Node.
// Run by the node runner (test/*_server.ts); skipped by the frontend wdio suite.
import '../server/manifest.js';
