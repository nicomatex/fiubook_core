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
	@echo "Deploying database"
	kubectl apply -f ./kube_templates/core-db.yml
	@echo "Deploying core service"
	kubectl apply -f ./kube_templates/core-deployment.yml
.PHONY: bootstrap_cluster

logs:
	kubectl logs -f -l app=fiubook-core
.PHONY: logs

reload: push
	kubectl rollout restart deployment fiubook-core-deployment
.PHONY: reload