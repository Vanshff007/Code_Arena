// Normalizes backend error responses into one display-ready string.
// The API returns either a single `message` (409 conflict, 401 invalid
// credentials) or an `errors` array of { field, message } (400 validation
// failures from express-validator) - callers shouldn't have to know which.
export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const data = err.response?.data;
  if (data?.errors?.length) {
    return data.errors.map((e) => e.message).join(', ');
  }
  return data?.message || fallback;
}
