COMPOSE = docker compose -f infra/docker-compose.yml
export DATABASE_URL ?= postgres://valence:valence@localhost:5432/valence?sslmode=disable
export REDIS_URL ?= redis://localhost:6379

.PHONY: up down migrate test demo logs

up:
	$(COMPOSE) up -d postgres redis

migrate: up
	$(COMPOSE) run --rm migrate

down:
	$(COMPOSE) down

test: migrate
	pnpm --filter @valence/api test
	pnpm --filter @valence/orchestrator test

demo: migrate
	$(COMPOSE) up -d --build api
	@echo "waiting for api health..."
	@for i in $$(seq 1 30); do \
		if curl -sf http://localhost:8080/health > /dev/null; then \
			echo "PASS: api is healthy"; \
			curl -s http://localhost:8080/health; \
			echo ""; \
			break; \
		fi; \
		if [ "$$i" = "30" ]; then \
			echo "FAIL: api did not become healthy in time"; \
			$(COMPOSE) logs api; \
			exit 1; \
		fi; \
		sleep 1; \
	done
	@echo "running Phase 1 sandbox demo (pinned-commit clone + hardened build + determinism check)..."
	pnpm --filter @valence/orchestrator demo

logs:
	$(COMPOSE) logs -f
