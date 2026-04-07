# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| main    | ✅        |
| develop | ✅        |
| Others  | ❌        |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

To report a security vulnerability, open a [GitHub Security Advisory](https://github.com/YusufStar/saganet/security/advisories/new) in this repository.

Include as much detail as possible:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive a response within **72 hours**. If the issue is confirmed, a fix will be prioritized and a patch released as soon as possible.

## Scope

The following are **in scope**:

- Authentication & authorization bypass
- Injection vulnerabilities (SQL, command, etc.)
- Sensitive data exposure
- Kafka message tampering
- Saga state manipulation

The following are **out of scope**:

- Denial of service attacks
- Social engineering
- Issues in third-party dependencies (report directly to them)
