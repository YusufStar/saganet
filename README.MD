# Saganet

Production-grade event-driven commerce engine using Saga pattern, Kafka, and self-healing mechanisms.

---

# 🚀 Quick Start

```bash
docker-compose up --build
```

Access:

* API Gateway: [http://localhost:3000](http://localhost:3000)
* Jaeger: [http://localhost:16686](http://localhost:16686)
* Grafana: [http://localhost:3001](http://localhost:3001)

---

# 🧠 Architecture Overview

Saganet is built on:

* Event-driven microservices
* Kafka as message broker
* Saga pattern for distributed transactions
* Outbox pattern for consistency

## Flow

1. Order Created
2. Inventory Reserved
3. Payment Processed
4. Order Completed / Failed (compensation)

---

# 🔄 Core Concepts

## Saga Pattern

Handles distributed transactions via events.

## Outbox Pattern

Ensures DB + event consistency.

## Idempotency

Prevents duplicate processing.

## Self-Healing

Retry + DLQ + health checks.

---

# 🔥 Chaos Mode

```bash
npm run chaos
```

Simulates:

* Service crashes
* Network delays
* Message failures

---

# 📁 Project Structure

```
/apps
  /api-gateway
  /auth-service
  /catalog-service
  /inventory-service
  /order-service
  /payment-service
  /notification-service

/packages
  /common
  /kafka
  /db
  /observability

/infra
  /docker
  /k8s

/docs
```

---

# 🧪 Example API

## Create Order

POST /orders

```json
{
  "userId": "1",
  "items": [
    { "productId": "1", "quantity": 2 }
  ]
}
```

---

# 📊 Observability

* Tracing: Jaeger
* Metrics: Prometheus + Grafana
* Logs: Structured logs (JSON)

---

# 🤝 Contributing

## Branch Strategy

* main → production-ready
* develop → integration branch
* feature/* → new features
* fix/* → bug fixes

---

## Commit Convention (Conventional Commits)

Examples:

```
feat(order): implement order creation saga
fix(inventory): handle race condition on stock
chore(kafka): add retry mechanism
```

---

## PR Flow

1. Create branch from develop
2. Implement feature
3. Add tests
4. Open PR → develop
5. Review + merge

---

# 🎯 Roadmap

* [ ] Basic saga flow
* [ ] Observability
* [ ] Chaos mode
* [ ] UI dashboard
* [ ] Multi-region support

---

# 🧲 Philosophy

> Break the system — it heals itself.

---

# 📜 License

MIT
