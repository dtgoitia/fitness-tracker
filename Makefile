WEBAPP_NAME:=fitness-tracker-webapp
LOCAL_STATIC_WEB_SERVER_PORT:=8083

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

remove-development-environment:
	@echo ""
	@echo Uninstalling git hooks...
	make uninstall-dev-tools

	@echo ""
	@echo Uninstalling NPM dependencies outside of the container
	#rm -rf webapp/node_modules

	@echo ""
	@echo Removing docker containers and images
	docker compose down
	docker image rm $(WEBAPP_NAME) || (echo "No $(WEBAPP_NAME) found, all good."; exit 0)

serve-webapp-ngrok:
	docker compose run --rm $(WEBAPP_NAME)-ngrok \
		http \
		--domain=sawfish-fitting-tadpole.ngrok-free.app \
		$(LOCAL_STATIC_WEB_SERVER_PORT)

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

build-webapp-for-ngrok:
	scripts/build_webapp.sh
	scripts/move_webapp_build_to_ngrok_dist_dir.sh $(LOCAL_STATIC_WEB_SERVER_PORT)
