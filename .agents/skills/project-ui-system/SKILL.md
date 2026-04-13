---
name: project-ui-system
description: Use this skill when building UI for this project. Enforce a clean, modern SaaS/fintech style with consistent spacing, typography, layout, and component patterns. Avoid messy UI and ensure a professional product-grade look.
---

# Project UI System (Fintech / SaaS)

Use this skill whenever generating or modifying UI.

## 🎯 Design Goals

- Clean, modern, professional fintech UI
- SaaS dashboard style
- High readability and clear hierarchy
- Consistent spacing and alignment
- Not flashy, not messy, not overly decorative

---

## 🎨 Visual Style Rules

1. Use a neutral base (white / gray) with 1 primary brand color.
2. Avoid too many colors. Keep palette minimal.
3. Prefer soft shadows and subtle borders.
4. Use rounded corners consistently (recommended: `rounded-2xl`).
5. Avoid heavy gradients unless explicitly required.
6. Keep UI airy — do not make it dense or cramped.

---

## 📏 Spacing System

1. Use consistent spacing scale: 4 / 8 / 12 / 16 / 24 / 32
2. Sections should have clear vertical spacing (`py-10` / `py-12`)
3. Use `gap` instead of random margins for layout spacing
4. Avoid inconsistent padding values
5. Maintain visual rhythm across components

---

## 🧱 Layout Patterns

1. Prefer container-centered layouts:
   - `max-w-7xl mx-auto px-4`
2. Use grid or flex with `gap` for structure
3. Avoid deeply nested layout wrappers
4. Keep page structure predictable:
   - Header
   - Content
   - Section blocks

---

## 🧩 Component Patterns

### Cards

- Use for grouping content
- Style:
  - `rounded-2xl border bg-white shadow-sm p-6`
- Keep padding consistent

### Buttons

- Primary:
  - Solid background
- Secondary:
  - Outline or ghost
- Rules:
  - Do not create too many button styles
  - Keep sizes consistent

### Forms

- Always include:
  - Label
  - Input
  - Helper/Error text
- Use vertical spacing between fields
- Inputs should be aligned and consistent

### Tables

- Clean and readable
- Avoid overcrowding
- Use hover states
- Keep column spacing balanced

---

## 🧠 UX Rules

1. Always include:
   - loading state
   - empty state
   - error state
2. Make interactive elements obvious
3. Avoid unclear clickable areas
4. Keep user flow simple
5. Reduce cognitive load

---

## 📱 Responsive Rules

1. Mobile-first approach
2. Stack layout on small screens
3. Avoid horizontal scroll
4. Maintain spacing consistency across breakpoints

---

## 🧼 Code Style Rules (VERY IMPORTANT)

1. Do NOT generate messy Tailwind class strings
2. Group class names logically
3. Extract reusable components when repeated
4. Do NOT create huge monolithic components
5. Keep JSX readable and structured
6. Prefer clean and maintainable code over clever tricks

---

## 🚫 Avoid

- Over-designed UI
- Random spacing
- Too many colors
- Inconsistent radius/shadows
- Huge components with mixed responsibilities
- Inline styles unless necessary

---

## ✅ Output Expectations

- UI should look like a real SaaS product (Stripe / Linear style)
- Clean, consistent, scalable design
- Production-ready quality
- Easy to extend and maintain