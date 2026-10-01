# Code Execution

This file describes the Docker sandbox judge in
`server/features/execution/`. Read it before you change how code runs, how
verdicts are computed, or which languages are supported.

## Files

| File | Job |
|---|---|
| `engine/config.js` | One entry per language: image, file name, compile and run commands, memory limit. Default time limit 5 s, compile limit 10 s. |
| `engine/workspace.js` | Creates and deletes a temporary folder per submission (`server/features/execution/tmp/`, git-ignored). |
| `engine/dockerRunner.js` | Starts the sandbox container, runs commands with `docker exec`, reads peak memory, stops the container. |
| `engine/executeCode.js` | `compile` (once per submission) and `run` (once per test case). |
| `engine/judge.js` | `runCustomInput` ("Run Code") and `judgeSubmission` ("Submit"). |
| `engine/concurrencyLimiter.js` | Limits concurrent containers. |
| `images/<lang>/Dockerfile` | Sandbox images. |
| `buildImages.js` | `npm run docker:build`. |

Sandbox images are tagged `codearena-cpp`, `codearena-java`,
`codearena-python`. The judge never builds images on demand.

## Problem formats

**Function-style (LeetCode format)** — every built-in problem. The problem
has a `signature` (function name, typed parameters, return type). The
player writes only a `Solution` class; no headers, imports or `main`.

- Starter code for each language is generated from the signature
  (`harness/starterCode.js`) and returned with the problem as
  `starterCode`.
- Test input: one JSON value per parameter, one per line, e.g.
  `[2,7,11,15]` then `9`. Expected output: the JSON of the returned value,
  e.g. `[0,1]`. Trees and linked lists are written as level-order arrays
  (`[3,9,20,null,null,15,7]`, `[1,4,5]`); an empty one is `[]`.
- `outputOrder: 'any'` accepts arrays in any order at every depth (3Sum,
  Group Anagrams). Doubles compare with a 1e-5 tolerance.

**Full-program** — a problem without a signature (older admin-made ones).
The code reads stdin and prints stdout; output is compared line by line,
ignoring trailing whitespace.

### The harness (`server/features/execution/harness/`)

| File | Job |
|---|---|
| `types.js` | Supported types and their C++/Java/Python names; `validateSignature`. |
| `starterCode.js` | Solution stubs per language. |
| `cpp.js`, `java.js`, `python.js` | Wrap the player code: a short prelude (headers, `ListNode`, `TreeNode`) before it, and a JSON reader, converters, serializer and `main` after it. |
| `protocol.js` | The harness prints the player output, then `@@CA_RESULT@@` and the result as JSON. `extractResult` splits them. |
| `compare.js` | `outputsMatch`: value comparison, optional any-order. |
| `index.js` | `buildProgram`, `remapLineNumbers` (compiler and runtime line numbers point into the player code; harness lines say `harness`). |

Supported types: `int`, `long`, `double`, `bool`, `string`, `char`,
`int[]`, `long[]`, `double[]`, `bool[]`, `string[]`, `char[]`,
`int[][]`, `char[][]`, `string[][]`, `list<int>`, `list<string>`,
`list<list<int>>`, `list<list<string>>`, `TreeNode`, `ListNode`,
`ListNode[]`. The `list<...>` forms exist for Java (`List<List<Integer>>`);
in C++ and Python they match the array forms. Every function must return a
value (no `void` / in-place problems yet).

Java details: the player's `import` lines are moved to the top of the file
(left blank in place so line numbers still match), and
`public class Solution` becomes `class Solution`. `java.util.*`,
`java.util.stream.*` and `java.io.*` are always imported. Python gets the
usual LeetCode imports (`typing`, `collections`, `heapq`, ...).

Wrong input on Run (too few lines, invalid JSON) exits with a clear message,
for example: "Input needs 2 lines, one value per parameter (nums, target)."

## Flow

1. Create a workspace and write the source file.
2. Start one container for the whole submission.
3. Compile once (skipped for Python).
4. Run each test case with `docker exec`, public cases first, then hidden.
5. Function-style: take the value after `@@CA_RESULT@@` and compare it with
   `outputsMatch`. Full-program: compare stdout after normalizing (CRLF to
   LF, trailing spaces per line removed, outer whitespace trimmed).
6. Verdict: `Accepted`, `Wrong Answer`, `Time Limit Exceeded`,
   `Runtime Error`, or `Compilation Error`. The overall verdict is the first
   failing verdict, or `Accepted` when all pass.
7. Stop the container and delete the workspace (always, in `finally`).

## Security rules

Container flags in `engine/dockerRunner.js`:

- `--network none`
- `--cap-drop=ALL`
- `--security-opt=no-new-privileges`
- `--read-only` with a 64 MB `/tmp` tmpfs
- `--pids-limit=64`
- `--cpus=0.5`
- Per-language memory limit

Do not remove or loosen these flags without owner approval.

Hidden test cases:

- Only `execution.controller.submitCode` loads `hiddenTestCases`.
- `judgeSubmission` returns input, expected and actual output only for a
  failing **public** case.
- Never put hidden test case content in a response, socket event or log.

## Concurrency

- At most `max(2, CPU count)` containers run at the same time.
- At most 20 jobs wait in the queue.
- When the queue is full, the limiter throws `JudgeQueueFullError`. The
  controller returns HTTP 503.

## Add a problem

1. Add it to `server/features/problems/seedData.js` with a `signature` and
   test cases in the format above (or create it through the admin API).
2. Add a Python reference solution to `referenceSolutions.js`.
   `seed.test.js` judges it on every test case; a wrong expected output fails
   the test.
3. `npm run seed-problems` adds it. `npm run seed-problems -- --update`
   overwrites existing built-in problems by title (ids are kept).

## Add a language

1. Add `server/features/execution/images/<lang>/Dockerfile`.
2. Add the image to the `images` list in
   `server/features/execution/buildImages.js`.
3. Add an entry to `LANGUAGES` in `engine/config.js`.
4. Add the language to `SUPPORTED_LANGUAGES` in `execution.validator.js`.
5. Add a harness builder (`harness/<lang>.js`), its type names in
   `harness/types.js`, and a stub in `harness/starterCode.js`.
6. Add it to `LANGUAGES`, `STARTER_CODE` and `MONACO_LANGUAGE` in
   `client/src/features/execution/languages.js`. A client test fails until
   the client and server lists match.
7. Add reference solutions in `referenceSolutions.js`.

## Known limitations

- Memory is the peak for the whole judging session, not per test case.
- Runtime reported is the last test case's duration.
- Full-program problems still need Java code to declare `public class Main`.
