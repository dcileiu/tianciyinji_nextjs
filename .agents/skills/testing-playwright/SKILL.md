---
name: testing-playwright
description: Use this skill when writing end-to-end tests with Playwright. Focus on critical user flows, resilient selectors, and practical browser automation coverage.
---

# Playwright Testing

Use this skill for end-to-end browser testing.

## Rules

1. Test critical user journeys first.
2. Use stable selectors such as role, label, placeholder, and test ids when needed.
3. Avoid brittle selectors based on visual structure only.
4. Keep each test focused on one scenario.
5. Use helper functions for repeated flows.
6. Cover success states and essential failure states.
7. Do not overtest trivial UI details.
8. Wait for meaningful states, not arbitrary timeouts.
9. Keep tests deterministic and CI-friendly.
10. Write tests that help catch real regressions.

## Output expectations

- Tests should reflect real user interactions.
- Selectors should be resilient.
- Coverage should prioritize business-critical flows.