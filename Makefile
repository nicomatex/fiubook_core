SHELL := /bin/bash
PWD := $(shell pwd)

default: build

all:

transpile:
	npx tsc
.PHONY: transpile

build-image: transpile 
	docker build -t fiubook_core .
.PHONY: build-image