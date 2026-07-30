

> **Rule: Backward-Compatible Data Migrations**
> When updating local JSON databases or file-based storage schemas (e.g., analytics.json), always use backwards-compatible schema extensions. Do not change primary keys or overall array structures that would invalidate old records. Instead, add new optional nested fields (e.g., an hours object within a daily entry). All reading and rendering logic must gracefully handle legacy records where these new fields are undefined.


> **Rule: Local Medical SEO Standards**
> On medical/service landing pages (e.g., gastroscopy, colonoscopy):
> 1. Include explicit local keywords (city, hospital name/number) in `<title>`, `<meta name="description">`, and Open Graph tags.
> 2. Ensure localized subpages (`/ru/`, `/en/`) have all meta-tags fully translated into their target language—never leave default-language meta tags on translated routes.
> 3. Provide Schema.org `MedicalClinic` / `Physician` JSON-LD with complete address data on all service pages.

