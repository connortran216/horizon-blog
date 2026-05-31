# Quickstart: Verify CV Achievement Rewrite

## Source Review

```bash
sed -n '1,260p' src/features/cv/cv.data.ts
```

Confirm the experience bullets emphasize outcomes, enabled capabilities, improved systems, or team value.

## Guardrail Checks

```bash
rg -n "increased|reduced|saved|revenue|\\d+%|\\$|million|thousand|award" src/features/cv/cv.data.ts
```

Expected result: no newly invented metric-style claims in experience bullets.

```bash
rg -n "company:|role:|period:|productionUrl:|stack:" src/features/cv/cv.data.ts
```

Expected result: existing employers, roles, dates, links, and stacks remain present.

## Repo Validation

Use Node `v22.18.0` because previous repo validation found the default Node runtime can fail before ESLint.

```bash
PATH=/Users/trantuancanh/.nvm/versions/node/v22.18.0/bin:$PATH rtk yarn lint
```
