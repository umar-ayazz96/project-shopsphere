# ShopSphere — 3-Tier E-Commerce Application

A realistic, portfolio-ready e-commerce platform demonstrating a full 3-tier
architecture: **React frontend**, **Node.js/Express backend API**, and a
**PostgreSQL relational database** (designed to run on **AWS RDS** in
production). Includes Docker images for every tier and Kubernetes manifests
for deployment (e.g. to Amazon EKS).

## Architecture

```
┌────────────┐      HTTPS       ┌──────────────┐     TCP/5432 (SSL)   ┌───────────────┐
│  React SPA │ ───────────────► │  Express API │ ───────────────────► │  PostgreSQL   │
│  (nginx)   │  /api proxy      │  (Node.js)   │      pg pool          │  (AWS RDS)    │
└────────────┘                  └──────────────┘                       └───────────────┘
   Tier 1: Presentation            Tier 2: Application                  Tier 3: Data
```

## Features

- JWT authentication (register/login), role-based access (customer/admin)
- Product catalog with categories, images, search, filtering, sorting, pagination
- Shopping cart, multi-step checkout, order history and order detail
- Product reviews & ratings (aggregated automatically)
- Address book per user
- Admin dashboard: create products, manage order statuses, view customers
- Transactional checkout (SQL transaction: stock decrement + order creation + cart clear)
- Kubernetes-ready: liveness/readiness probes, HPA, ConfigMaps/Secrets, Ingress (ALB)

## Tech Stack

| Layer      | Technology                                           |
|------------|-------------------------------------------------------|
| Frontend   | React 18, React Router, Vite, Tailwind CSS, Axios     |
| Backend    | Node.js, Express, JWT, bcrypt, express-validator      |
| Database   | PostgreSQL 16 (AWS RDS in production)                 |
| Container  | Docker (multi-stage builds), nginx (frontend runtime) |
| Orchestration | Kubernetes (EKS), HPA, Ingress (AWS ALB)           |

## Project Structure

```
shopsphere/
├── backend/            Node.js/Express REST API
│   ├── src/
│   │   ├── config/     DB pool + migration runner
│   │   ├── controllers/
│   │   ├── middleware/ auth, admin guard, error handling
│   │   ├── routes/
│   │   └── server.js
│   ├── Dockerfile
│   └── .env.example
├── frontend/           React SPA
│   ├── src/
│   │   ├── api/        axios client
│   │   ├── context/    Auth + Cart context providers
│   │   ├── components/
│   │   └── pages/
│   ├── Dockerfile
│   └── nginx.conf
├── database/
│   ├── schema.sql      Full relational schema (users, products, orders, etc.)
│   └── seed.sql        Sample categories/products/reviews
├── k8s/                Kubernetes manifests (namespace → ingress)
└── docker-compose.yml  Local dev stack (Postgres + backend + frontend)
```

## Running locally with Docker Compose

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Postgres: localhost:5432 (schema + seed data load automatically)

Demo accounts (after seeding): `admin@shopsphere.com` / `Admin@12345` (admin),
`jane.doe@example.com` / `Customer@12345` (customer).

## Deploying to AWS (EKS + RDS) — high level

1. **Provision RDS**: create a PostgreSQL instance (e.g. `db.t3.micro` for a
   demo), in the same VPC as your EKS cluster, with a security group that
   allows inbound 5432 from the EKS node/pod security group.
2. **Build & push images** to Amazon ECR:
   ```bash
   docker build -t <account>.dkr.ecr.<region>.amazonaws.com/shopsphere-backend:latest ./backend
   docker build -t <account>.dkr.ecr.<region>.amazonaws.com/shopsphere-frontend:latest ./frontend
   docker push <account>.dkr.ecr.<region>.amazonaws.com/shopsphere-backend:latest
   docker push <account>.dkr.ecr.<region>.amazonaws.com/shopsphere-frontend:latest
   ```
3. **Update manifests**: set the `image:` fields in
   `k8s/08-backend-deployment.yaml` and `k8s/11-frontend-deployment.yaml` to
   your ECR URIs, and set `DB_HOST`/`DB_SSL` in
   `k8s/07-backend-configmap.yaml` to your RDS endpoint (`DB_SSL: "true"`).
4. **Apply manifests**:
   ```bash
   kubectl apply -f k8s/00-namespace.yaml
   kubectl apply -f k8s/06-backend-secret.yaml -f k8s/07-backend-configmap.yaml
   kubectl apply -f k8s/08-backend-deployment.yaml -f k8s/09-backend-service.yaml -f k8s/10-backend-hpa.yaml
   kubectl apply -f k8s/11-frontend-deployment.yaml -f k8s/12-frontend-service.yaml
   kubectl apply -f k8s/13-ingress.yaml
   ```
5. **Run the migration Job once** against RDS to create the schema (and seed data):
   ```bash
   kubectl apply -f k8s/14-db-migration-job.yaml
   kubectl wait --for=condition=complete job/shopsphere-db-migrate -n shopsphere
   ```

   > If you'd rather test entirely inside the cluster without RDS, apply
   > `01`–`05` (Postgres Secret/ConfigMap/PVC/Deployment/Service) instead of
   > pointing at RDS, and leave `DB_HOST: postgres` in the ConfigMap.

6. Point your domain's DNS at the ALB address created by the Ingress, or use
   `kubectl get ingress -n shopsphere` to get the ALB hostname directly.

## Environment variables (backend)

See `backend/.env.example` — key ones: `DB_HOST`, `DB_PORT`, `DB_NAME`,
`DB_USER`, `DB_PASSWORD`, `DB_SSL`, `JWT_SECRET`, `CORS_ORIGIN`.

## Notes for your CV / portfolio

This project intentionally demonstrates: relational schema design with
foreign keys/constraints/triggers, parameterized SQL (no ORM, so the SQL is
visible and reviewable), JWT auth with role-based authorization, an ACID
transaction for checkout (stock + order consistency), multi-stage Docker
builds, and production-style Kubernetes manifests (probes, resource limits,
HPA, Secrets/ConfigMaps, Ingress). Feel free to extend it with CI/CD
(GitHub Actions → ECR → EKS), observability (Prometheus/Grafana), or a
payment gateway integration (Stripe) to go even further.
