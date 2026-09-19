const Module = require("node:module");
const path = require("node:path");

// TypeScript paths resolve types but leave @/ imports in the emitted CommonJS.
// Scope the alias to this test process and its compiled output only.
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...options) {
  const resolved =
    request.startsWith("@/") ?
      path.resolve(__dirname, "../.cache/hanoi-tests", request.slice(2))
    : request;
  return resolveFilename.call(this, resolved, parent, ...options);
};
