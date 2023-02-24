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
	@echo Creating development docker images...
	make rebuild-webapp

	@echo ""
	@echo ""
	@echo To start app:  make run-webapp


install-dev-tools:
	pre-commit install  # pre-commit is (default)
	pre-commit install --hook-type pre-push

uninstall-dev-tools:
	pre-commit uninstall  # pre-commit is (default)
	pre-commit uninstall --hook-type pre-push

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

# Recreate web app docker image
rebuild-api:
	docker-compose down
	docker image rm $(API_NAME) || (echo "No $(API_NAME) found, all good."; exit 0)

	docker-compose build --no-cache $(API_NAME)
