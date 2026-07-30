// Actual service time varies too much per client (e.g. a haircut on long
// hair vs. short hair) for a single provider-set estimate to be meaningful,
// so every booking uses one fixed slot length instead of a per-service
// duration.
export const SERVICE_DURATION_MINUTES = 30
