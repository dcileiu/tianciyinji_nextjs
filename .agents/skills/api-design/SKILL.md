---
name: api-design
description: Use this skill when designing or refactoring backend APIs. Create clear, consistent, secure, and maintainable endpoints with predictable request and response structures.
---

# API Design

Use this skill for route handlers, backend services, and API contracts.

## Rules

1. Design endpoints around clear resources and actions.
2. Use predictable naming conventions.
3. Keep request and response structures consistent.
4. Return useful status codes.
5. Validate input before business logic.
6. Separate validation, controller logic, service logic, and persistence logic.
7. Do not expose internal errors directly to clients.
8. Include clear success and error response shapes.
9. Prefer pagination for list endpoints when needed.
10. Keep APIs easy for frontend developers to consume.
11. Handle authentication and authorization explicitly.
12. Avoid mixing unrelated responsibilities in a single endpoint.

## Output expectations

- APIs should be easy to understand and extend.
- Error handling should be consistent.
- Contracts should feel stable and production-ready.