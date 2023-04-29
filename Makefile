.DEFAULT_GOAL := help

NPM := npm
NPM_RUN := ${NPM} run
NPX := npx

DOCKER_COMPOSE := docker compose

help: # Show this help
	@egrep -h '\s#\s' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?# "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: # Install dependencies
	@${NPM} install
	@${NPX} husky install

run: # Run dev server
	@${NPM_RUN} dev

lint: # Run linters
	@${NPM_RUN} lint:prisma
	@${NPM_RUN} lint

fix: # Run automatically fixes
	@${NPM_RUN} lint-fix
	@${NPX} prettier -w .

db-start: # Start dockerized database only
	@${DOCKER_COMPOSE} up -d db

db-stop: # Stop dockerized database only
	@${DOCKER_COMPOSE} stop db

db-migrate: # Apply available migrations
	@${NPM_RUN} db:migrate

db-seed: # Seed database
	@${NPM_RUN} db:seed

#
# Test environment
#

test: # Run test
	@${NPM_RUN} test:db:prepare
	@${NPM_RUN} test

test-db-start: # Up test database
	@${DOCKER_COMPOSE} -f docker-compose.test.yml up

test-db-stop: # Stop dockerized database only
	@${DOCKER_COMPOSE} -f docker-compose.test.yml stop test_db

#
# Production environment
#

prod-docker-build: # Build Docker image
	@${DOCKER_COMPOSE} build

prod-docker-start: # Run Docker container
	@${DOCKER_COMPOSE} up -d

prod-docker-stop: # Stop Docker container
	@${DOCKER_COMPOSE} down

prod-docker-db-migrate: # Apply available migrations on Dockerized database
	@${DOCKER_COMPOSE} exec app npm run db:migrate

prod-docker-db-seed: # Seed Dockerized database
	@${DOCKER_COMPOSE} exec app npm run db:seed

prod-docker-db-cli: # Attach to Docker container
	@${DOCKER_COMPOSE} exec db bash
