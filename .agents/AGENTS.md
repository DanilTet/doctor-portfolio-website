

> **Rule: Backward-Compatible Data Migrations**
> When updating local JSON databases or file-based storage schemas (e.g., analytics.json), always use backwards-compatible schema extensions. Do not change primary keys or overall array structures that would invalidate old records. Instead, add new optional nested fields (e.g., an hours object within a daily entry). All reading and rendering logic must gracefully handle legacy records where these new fields are undefined.


> **Rule: Local Medical SEO Standards**
> On medical/service landing pages (e.g., gastroscopy, colonoscopy):
> 1. Include explicit local keywords (city, hospital name/number) in `<title>`, `<meta name="description">`, and Open Graph tags.
> 2. Ensure localized subpages (`/ru/`, `/en/`) have all meta-tags fully translated into their target language—never leave default-language meta tags on translated routes.
> 3. Provide Schema.org `MedicalClinic` / `Physician` JSON-LD with complete address data on all service pages.


> **Rule: Safe Production Git Operations**
> NEVER recommend destructive Git commands like `git reset --hard`, `git clean -fd`, or `git checkout .` for production or staging servers. Assume the server might have uncommitted user-generated content (e.g., manually generated articles in `/articles`, database files, uploads). 
> Always recommend safe synchronization methods:
> 1. Use `git stash` -> `git pull` -> `git stash pop`.
> 2. Or ask the user to commit their server-side changes first.
> 3. Clearly warn the user about potential merge conflicts if they choose to stash/pop.


> **Rule: Google Search Console Instructions**
> When instructing users to submit a sitemap in Google Search Console, always explicitly provide the full absolute URL (e.g., `https://endo.kh.ua/sitemap.xml`) rather than just the relative filename (`sitemap.xml`). This prevents confusion across different GSC property types (Domain vs. URL prefix).
