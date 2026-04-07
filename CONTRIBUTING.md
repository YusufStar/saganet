# Contributing to Saganet

Thank you for your interest in contributing! This document outlines the process for contributing to Saganet.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branch Strategy](#branch-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YusufStar/saganet.git`
3. Add the upstream remote: `git remote add upstream https://github.com/YusufStar/saganet.git`
4. Follow the [Development Setup](#development-setup) steps

---

## Development Setup

**Prerequisites:**

- Node.js >= 20
- Docker & Docker Compose
- pnpm >= 9

```bash
# Install dependencies
pnpm install

# Start infrastructure (Kafka, PostgreSQL, Redis, Jaeger, Grafana)
docker-compose up -d

# Run all services in development mode
pnpm dev
```

---

## Branch Strategy

| Branch | Purpose |
| ------ | ------- |
| `main` | Production-ready code |
| `develop` | Integration branch |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `chore/*` | Maintenance tasks |
| `docs/*` | Documentation only |

Always branch from `develop`, never from `main`.

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

---

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

**Format:** `type(scope): description`

**Types:**

- `feat` — new feature
- `fix` — bug fix
- `chore` — maintenance, dependencies
- `docs` — documentation
- `test` — adding or fixing tests
- `refactor` — code restructure without behavior change
- `perf` — performance improvement
- `ci` — CI/CD changes

**Scopes** (microservices & packages):
`api-gateway`, `auth-service`, `catalog-service`, `inventory-service`, `order-service`, `payment-service`, `notification-service`, `pkg-common`, `pkg-kafka`, `pkg-db`, `pkg-observability`, `infra`

**Examples:**

```text
feat(order): implement order creation saga
fix(inventory): handle race condition on stock reservation
chore(kafka): add retry mechanism to consumer
docs(api-gateway): update routing table in README
test(payment): add compensation flow integration test
```

---

## Pull Request Process

1. Ensure your branch is up to date with `develop`
2. Run tests and linting locally:

   ```bash
   pnpm lint
   pnpm test
   pnpm build
   ```

3. Open a PR targeting `develop` (not `main`)
4. Fill out the PR template completely
5. Link any related issues with `Closes #123`
6. Request a review from at least one maintainer
7. Address review feedback
8. A maintainer will merge once approved

**PR title** must follow the same Conventional Commits format as commit messages.

---

## Reporting Bugs

Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) issue template.

Please include:

- Steps to reproduce
- Expected vs actual behavior
- Logs / stack traces
- Environment details (OS, Node version, Docker version)

---

## Requesting Features

Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) issue template.

Describe:

- The problem you're solving
- Your proposed solution
- Alternatives you considered

---

## Questions?

Open a [Discussion](../../discussions) rather than an issue for general questions.
