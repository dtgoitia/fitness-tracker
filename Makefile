WEBAPP_NAME:=fitness-tracker-webapp
API_NAME:=fitness-tracker-api

set-up-development-environment:
	@echo ""
	@echo Installing git hooks...
	make install-dev-tools

	@echo ""
	@echo ""
	@echo Installing NPM dependencies outside of the container, to support pre-push builds...
	@# this step is necessary because otherwise docker-compose creates a node_modules
	@# folder with root permissions and outside-container build fails
	cd webapp; npm ci

	@echo ""
	@echo ""
	@echo Installing Python dependencies outside of the container, so that the IDE can detect them
	@# this step is necessary because otherwise docker compose creates a node_modules
	@# folder with root permissions and outside-container build fails
	cd api;~/.pyenv/versions/3.11.2/bin/python -m venv .venv/
	bash api/bin/dev/install_dev_deps

	@echo ""
	@echo ""
	@echo Creating development docker images...
	make rebuild_webapp
	make rebuild_api

	@echo ""
	@echo ""
	@echo To start app:  make run-webapp


install-dev-tools:
	pre-commit install  # pre-commit is (default)
	pre-commit install --hook-type pre-push

uninstall-dev-tools:
	pre-commit uninstall  # pre-commit is (default)
	pre-commit uninstall --hook-type pre-push


#===============================================================================
#
#   webapp
#
#===============================================================================

run-webapp:
	scripts/print_local_ip_via_qr.sh
	docker-compose up $(WEBAPP_NAME)

# Recreate web app docker image
rebuild-webapp:
	docker-compose down
	docker image rm $(WEBAPP_NAME) || (echo "No $(WEBAPP_NAME) found, all good."; exit 0)
	docker-compose build --no-cache $(WEBAPP_NAME)

test-dev-webapp:
	docker-compose run --rm $(WEBAPP_NAME) npm test

shell-webapp:
	docker-compose run --rm $(WEBAPP_NAME) bash

deploy-webapp-from-local:
	cd ./webapp \
		&& npm run deploy_from_local
	@# TODO: docker-compose run --rm $(WEBAPP_NAME) npm run deploy_from_local

build-webapp:
	scripts/build_webapp.sh

shell-api:
	docker-compose run --rm $(API_NAME) /bin/bash

shell-api-as-root:
	docker-compose run --rm $(API_NAME)-root /bin/bash

compile-api-dependencies:
	docker-compose run --rm $(API_NAME) ./bin/compile_development_dependencies
	@echo ""
	@echo "Remember to rebuild api to install new compiled deps"


#===============================================================================
#
#   API
#
#===============================================================================

run_api:
	# Disabled until containerization is sorted
	# docker compose up $(API_NAME)

	bash api/bin/local/run_api

compile_api_development_dependencies:
	bash api/bin/dev/compile_dev_deps

compile_api_production_dependencies:
	bash api/bin/dev/compile_prod_deps

install_api_development_dependencies:
	bash api/bin/dev/install_dev_deps

rebuild_api:
	docker compose down
	docker image rm $(API_NAME) || (echo "No $(API_NAME) found, all good."; exit 0)
	docker compose build --no-cache $(API_NAME)

shell_into_api_container:
	docker compose run --rm $(API_NAME) /bin/bash

migrate_db:
	bash api/bin/local/migrate_db

autogenerate_db_migration:
	bash api/bin/local/autogenerate_db_migration
	# docker-compose run --rm $(API_NAME) alembic revision --autogenerate

delete_local_db:
	find ./api -maxdepth 1 -type f -name $(DB_PATH) -delete
	touch ./api/$(DB_PATH)

api_test:
	bash api/bin/dev/test
