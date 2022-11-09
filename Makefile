SHELL := /bin/bash
PWD := $(shell pwd)

default: push

all:

transpile:
	npx tsc
.PHONY: transpile

build-image: transpile 
	docker build -t fiubook_core .
.PHONY: build-image

push: build-image
	docker tag fiubook_core:latest nicomatex/fiubook_core:latest && docker push nicomatex/fiubook_core:latest
.PHONY: push