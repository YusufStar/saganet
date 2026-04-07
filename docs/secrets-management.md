# Secrets Management Strategy

## Development

Use `.env` file at the root (copy from `.env.example`). Never commit `.env`.

## Staging / Production

Recommended approaches:

### Option A: Docker Secrets (Swarm)
```yaml
secrets:
  jwt_secret:
    external: true
services:
  auth-service:
    secrets:
      - jwt_secret
```

### Option B: Kubernetes Secrets
```bash
kubectl create secret generic saganet-secrets \
  --from-literal=JWT_SECRET=$(openssl rand -hex 32) \
  --from-literal=INTERNAL_SECRET=$(openssl rand -hex 32)
```

### Option C: HashiCorp Vault
Use Vault Agent to inject secrets as env vars at container startup.

### Option D: AWS Secrets Manager / GCP Secret Manager
Use cloud-native secret management with IAM roles for service-level access.

## Required Secrets

| Variable | Description |
|----------|-------------|
| JWT_SECRET | JWT signing key (min 32 chars) |
| INTERNAL_SECRET | Service-to-service auth header |
| DB_PASSWORD | PostgreSQL password |
| REDIS_URL | Redis connection string |
| SMTP_PASSWORD | Email provider password |
| MINIO_SECRET_KEY | MinIO/S3 access secret |
| ADMIN_PASSWORD | Initial admin user password |
