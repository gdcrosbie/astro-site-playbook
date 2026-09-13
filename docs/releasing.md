# Releasing Astro Site Playbook

Tagged releases provide stable points for teams creating new projects from the template. Release only from the default branch after the relevant hardening change has been reviewed and merged.

## Release readiness

- [ ] The version in `package.json` and `package-lock.json` matches the intended tag.
- [ ] `CHANGELOG.md` describes the release and its comparison links are correct.
- [ ] The playbook, starter, agent adapters, and checks agree on any changed contract.
- [ ] Launch placeholders remain intentional, documented, and discoverable through the customization guide.
- [ ] Optional providers and external requests are clearly identified as decisions rather than requirements.
- [ ] The working tree is clean and the release commit is on the current default branch.

## Automated verification

Install exactly from the lockfile and run both verification levels:

```bash
npm ci
npm test
npm run test:template
```

The normal pipeline checks every built HTML page with axe. The clean-copy test repeats installation and the complete pipeline outside the working checkout.

## Manual verification

Inspect the production build rather than the development server:

```bash
npm run build
npm run preview
```

Check at minimum:

- desktop and narrow mobile layouts, including 200% zoom and text spacing;
- keyboard order, the skip link, visible focus, required-field errors, and focus movement after enhanced validation;
- the useful no-JavaScript form path and its success/error destinations;
- reduced-motion behaviour;
- canonical URLs, article metadata, social previews, RSS, sitemap, robots, and 404 output;
- any provider-backed form path in a non-production environment when the recipe is configured.

Record any check that cannot run and its remaining risk. Automated success is not a substitute for these rendered checks.

## Publish

After the release commit is merged on the default branch:

```bash
git tag -a v1.0.0 -m "Astro Site Playbook v1.0.0"
git push origin v1.0.0
gh release create v1.0.0 --title "Astro Site Playbook v1.0.0" --notes-from-tag
```

Replace the version in these commands for later releases. Verify the GitHub release points to the intended commit and that the repository remains configured as a template.
