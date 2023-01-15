SHELL := /bin/bash
PWD := $(shell pwd)

default: push

all:

transpile:
	npx tsc
	npx tsc-alias
.PHONY: transpile

build-image: transpile 
	docker build -t fiubook_core .
.PHONY: build-image

push: build-image
	docker tag fiubook_core:latest nicomatex/fiubook_core:latest
	docker push nicomatex/fiubook_core:latest
.PHONY: push

bootstrap_cluster:
	@echo "Creating physical volume for database"
	kubectl apply -f ./kube_templates/db-pv.yml
	@echo "Creating database config"
	kubectl apply -f ./kube_templates/postgres-config.yml
	@echo "Deploying database"
	kubectl apply -f ./kube_templates/core-db.yml
	@echo "Creating core service config"
	kubectl apply -f ./kube_templates/core-config.yml
	@echo "Deploying core service"
	kubectl apply -f ./kube_templates/core-deployment.yml
.PHONY: bootstrap_cluster

logs:
	kubectl logs -f -l app=fiubook-core --follow
.PHONY: logs

reload: push
	kubectl rollout restart deployment fiubook-core-deployment
.PHONY: reload

restart: 
	kubectl rollout restart deployment fiubook-core-deployment
.PHONY: restart

reload_config:
	@echo "Reapplying core config"
	kubectl apply -f ./kube_templates/core-config.yml
	kubectl rollout restart deployment fiubook-core-deployment
.PHONY: reload_config