---
name: database-architect
description: Use this skill when designing database schema, Prisma models, relations, migrations, and data access patterns. Prioritize clarity, integrity, performance, and maintainability.
---

# Database Architect

Use this skill when working on schema design and data modeling.

## Rules

1. Model entities and relations clearly.
2. Choose field names that are descriptive and consistent.
3. Prefer explicit relations and constraints.
4. Add indexes for common query paths where justified.
5. Avoid premature optimization, but do not ignore obvious performance issues.
6. Keep Prisma schema readable and organized.
7. Use enums where they improve clarity.
8. Separate data access logic from UI and routing layers.
9. Avoid duplicated fields and ambiguous relationships.
10. Think about deletion behavior, nullability, and uniqueness.
11. Prefer safe migrations.
12. Design with future maintainability in mind.

## Output expectations

- Schema should be easy to understand.
- Queries should be structured and reusable.
- Data integrity and developer experience should both be considered.