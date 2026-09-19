const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const root = path.resolve(__dirname, "..");
const testFiles = [
  "lib/tower-of-hanoi.test",
  "lib/bi-directional-generator.test",
  "lib/hooks/useGenerator.test",
  "lib/hooks/useBidirectional.test",
  "app/_components/hanoi.actions.test",
  "app/_components/hanoi-playback.test",
];
const requestedFiles = process.argv.slice(2);
const selectedFiles =
  requestedFiles.length === 0 ?
    testFiles
  : [
      ...new Set(
        requestedFiles.map((requested) => {
          const normalized = requested
            .replaceAll("\\", "/")
            .replace(/^\.\//, "");
          const matches = testFiles.filter(
            (file) =>
              normalized === `src/${file}.ts` ||
              normalized === `${file}.ts` ||
              normalized === `${path.basename(file)}.ts`,
          );
          if (matches.length !== 1) {
            console.error(`Unknown or ambiguous test file: ${requested}`);
            console.error(
              `Available files:\n${testFiles.map((file) => `  src/${file}.ts`).join("\n")}`,
            );
            process.exit(1);
          }
          return matches[0];
        }),
      ),
    ];
const configPath = path.join(root, ".cache/hanoi-tests.tsconfig.json");
fs.mkdirSync(path.dirname(configPath), { recursive: true });
fs.writeFileSync(
  configPath,
  JSON.stringify(
    {
      compilerOptions: {
        rootDir: "../src",
        outDir: "./hanoi-tests",
        module: "commonjs",
        target: "es2019",
        jsx: "react-jsx",
        strict: true,
        skipLibCheck: true,
        sourceMap: true,
        inlineSources: true,
        noEmitOnError: true,
        baseUrl: "..",
        paths: { "@/*": ["src/*"] },
      },
      files: selectedFiles.map((file) => path.join(root, `src/${file}.ts`)),
    },
    null,
    2,
  ),
);
const compile = spawnSync(
  process.execPath,
  [require.resolve("typescript/bin/tsc"), "--project", configPath],
  { cwd: root, stdio: "inherit" },
);
if (compile.error) throw compile.error;
if (compile.status !== 0) process.exit(compile.status ?? 1);

const tests = spawnSync(
  process.execPath,
  [
    "--enable-source-maps",
    "--require",
    path.join(root, "scripts/test-aliases.cjs"),
    "--test",

    ...selectedFiles.map((file) => `.cache/hanoi-tests/${file}.js`),
  ],
  { cwd: root, stdio: "inherit" },
);

if (tests.error) throw tests.error;
process.exitCode = tests.status ?? 1;
