.PHONY: preview deploy

TARGET_NAME=homepage

preview:
	npm run build:prod
	firebase hosting:channel:deploy $(shell date "+%Y_%m_%d-%H:%M:%S") --only $(TARGET_NAME)

deploy:
	npm run build:prod
	firebase deploy --only hosting:$(TARGET_NAME)