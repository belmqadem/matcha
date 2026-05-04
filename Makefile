up:
	@docker compose up -d --build
	@docker compose exec -T matcha_server npm run db:migrate

migrate:
	@docker compose exec -T matcha_server npm run db:migrate

seed:
	@docker compose exec -T matcha_server npm run db:seed

reset:
	@printf "WARNING: This will reset the database. Are you sure? [y/N] " && read ans && [ "$${ans:-N}" = "y" ] && docker compose exec matcha_server npm run db:reset

down:
	@docker compose down

down-volumes:
	@docker compose down -v

restart:
	@docker compose down
	@docker compose up -d --build

restart-server:
	@docker compose restart matcha_server

logs:
	@docker compose logs -f

logs-server:
	@docker compose logs -f matcha_server

logs-db:
	@docker compose logs -f matcha_db

logs-client:
	@docker compose logs -f matcha_client

format-client:
	@docker compose exec -T matcha_client npm run format

format-client-check:
	@docker compose exec -T matcha_client npm run format:check

psql:
	@docker compose exec matcha_db sh -lc 'psql -U "$${POSTGRES_USER}" -d "$${POSTGRES_DB}"'

.PHONY: up down restart logs down-volumes restart-server psql migrate seed reset format-client format-client-check logs-server logs-db logs-client
