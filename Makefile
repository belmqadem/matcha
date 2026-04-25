up:
	@docker compose up -d --build

migrate:
	@docker compose exec -T matcha_server npm run db:migrate

down:
	@docker compose down

down-volumes:
	@docker compose down -v

restart: down up

restart-server:
	@docker compose restart matcha_server

logs:
	@docker compose logs -f

psql:
	@docker compose exec matcha_db sh -lc 'psql -U "$${POSTGRES_USER}" -d "$${POSTGRES_DB}"'

.PHONY: up down restart logs down-volumes restart-server psql migrate
