---
name: nextjs-best-practices
description: Use this skill when building or refactoring a Next.js project. Apply clean architecture, clear App Router conventions, proper server/client boundaries, maintainable folder structure, and production-friendly code style.
---

# Next.js Best Practices

Use this skill whenever working on a Next.js full-stack project.

## Rules

1. Prefer App Router structure unless the project already uses Pages Router.
2. Separate Server Components and Client Components clearly.
3. Add `"use client"` only when necessary.
4. Keep route handlers thin. Move business logic into reusable services.
5. Avoid putting database queries directly inside UI components unless it is a simple server component case.
6. Prefer colocated files when it improves readability, but avoid deeply nested folders.
7. Use TypeScript strictly. Avoid `any` unless unavoidable.
8. Add loading, empty, and error states for important pages.
9. Prefer async server components for data fetching when suitable.
10. Reuse shared utilities for formatting, validation, and API calls.
11. Keep imports clean and grouped.
12. When editing existing code, preserve the current conventions unless they are clearly harmful.

## Output expectations

- Code should be readable and easy to extend.
- File and component names should be consistent.
- Avoid overengineering.
- Keep diffs focused and minimal.