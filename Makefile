COMPOSE = docker compose -f infra/docker-compose.yml

.PHONY: up down migrate test demo logs

up:
	$(COMPOSE) up -d postgres redis

migrate: up
	$(COMPOSE) run --rm migrate

down:
	$(COMPOSE) down

test: migrate
	pnpm --filter @valence/api test

demo: migrate
	$(COMPOSE) up -d --build api
	@echo "waiting for api health..."
	@for i in $$(seq 1 30); do \
		if curl -sf http://localhost:8080/health > /dev/null; then \
			echo "PASS: api is healthy"; \
			curl -s http://localhost:8080/health; \
			echo ""; \
			exit 0; \
		fi; \
		sleep 1; \
	done; \
	echo "FAIL: api did not become healthy in time"; \
	$(COMPOSE) logs api; \
	exit 1

logs:
	$(COMPOSE) logs -f
