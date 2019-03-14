test:
	(cd helm/discovery_service && yarn && yarn test)
	(cd helm/openehr_service && yarn && yarn test)

lint:
	(cd helm/discovery_service && yarn && yarn lint)
	(cd helm/openehr_service && yarn && yarn lint)

.PHONY: test lint