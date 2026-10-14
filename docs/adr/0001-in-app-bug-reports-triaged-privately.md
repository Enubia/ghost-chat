# In-app Bug Reports are triaged in a private repo

Users submit Bug Reports from inside the app; the app posts them to a Cloudflare Worker that files them as issues in the private `Enubia/ghost-chat-reports` repo, never directly in the public tracker. Reports carry diagnostics (logs, OS, app version, optional contact email) that may leak personal data, so a maintainer reviews each one and Promotes it by hand as a redacted public issue. The Worker's source lives in that private repo too; only its endpoint URL is public, protected by rate limits and a kill switch rather than secrecy.

## Considered Options

- **Discord**: dropped; low-signal and a harassment vector. In-app reporting is one-way by design.
- **Public GitHub issues only**: requires a GitHub account, which most streamers lack, and would publish diagnostics.
- **Worker filing straight into the public repo**: no account needed, but diagnostics and contact emails would be public.
- **Automatic redaction on Promotion**: rejected; scrubbing free text and logs reliably is not achievable, so redaction stays manual.

## Consequences

- The report contract (`POST /report` payload and responses) spans two repos; changes must land in both.
- The public prefilled-issue fallback must never include logs or contact details.
