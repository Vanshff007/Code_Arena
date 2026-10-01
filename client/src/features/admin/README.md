# Admin (client)

Problem management for admins (`/admin/problems`). Routes are wrapped in
`AdminRoute`; the server checks the role again on every request.

## Files

| File | Job |
|---|---|
| `AdminProblemsPage.jsx` | Problem list with edit and delete. |
| `AdminProblemEditor.jsx` | Create and edit: details, function signature builder, examples, public and hidden tests, editorial, reference solution with "Check solution". |
| `problemForm.js` | `SIGNATURE_TYPES`, `emptyDraft`, `draftFromProblem`, `validateDraft`, `buildPayload`. |
| `adminService.js` | `/problems`, `/problems/:id/admin`, `/problems/check`, create, update, delete. |
| `admin.test.js` | Service contract, form helpers, and a check that the signature types match the server harness. |

## Behavior

- Hidden tests are never sent to the browser. When editing, "Keep the N
  existing hidden test cases" sends none; unticking it and writing new ones
  replaces them.
- Saving needs a reference solution that passes every test on the judge
  when tests, signature or output order change.

## Manual test cases

1. Grant admin with `npm run make-admin -- <email>`. The Admin link shows in
   the navbar.
2. Create a problem with a wrong reference solution. Expect the verdict and
   no new problem.
3. Edit a problem, paste a correct solution, click Check solution. Expect
   Accepted with the passed count.
