---
title: "Welcome to Astro Site Playbook"
description: "A shared delivery system for accessible, high-performance Astro websites."
pubDate: 2026-09-13
order: 1
---

Welcome to your new Astro project. Astro Site Playbook combines a working starter, a human-readable methodology, and agent guidance for delivering high-performance, WCAG 2.2 AA websites.

## Key Architecture

- **Two-Tier Fluid Design Tokens**: Native OKLCH colors with viewport (`vw`) and container query (`cqi`) scales.
- **4-Tier Content Modeling**: Clean separation between Editorial Prose (Markdown), Entity Records (YAML), In-Page Repeaters (JSON), and Global Singletons.
- **Contact Form Recipe**: A documented recipe (`docs/recipes/cloudflare-mailgun-contact.md`) demonstrates how to add an accessible, progressively enhanced contact form with Cloudflare Pages Functions and Mailgun when forms are needed.
- **Automated Verification**: Automated tests for tokens, WCAG 2.2 color contrast, TypeScript checks, and `axe-core` accessibility.
