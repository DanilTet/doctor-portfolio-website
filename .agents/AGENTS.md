

> **Rule: Backward-Compatible Data Migrations**
> When updating local JSON databases or file-based storage schemas (e.g., analytics.json), always use backwards-compatible schema extensions. Do not change primary keys or overall array structures that would invalidate old records. Instead, add new optional nested fields (e.g., an hours object within a daily entry). All reading and rendering logic must gracefully handle legacy records where these new fields are undefined.
