SHELL=/bin/bash
.PHONY: diff


ifndef HFL_ENV
$(error FATAL ERROR: HFL_ENV is not set. Please set it by dot-sourcing from protected/main.sh and supplying HFL_ENV)
endif

diff:
	helmfile -e ${HFL_ENV} diff


apply:
	helmfile -e ${HFL_ENV} apply

prephelm:
	cd helm/packages/ && \
		helm package ../charts/helperChart/ && \
		helm repo index . --url https://github.com/k0eff/helmfile-home-lab/raw/main/helm/packages/

prepdocker:
	$(eval url=https://raw.githubusercontent.com/nextcloud/docker/master/.examples/dockerfiles/full/fpm-alpine/)
	$(eval dir=./docker/nextcloud-full/)
	$(eval dockerCredsDir=./protected/docker/)
	$(eval dockerUsername=$(shell cat $(dockerCredsDir)user.creds))
	$(eval dockerPassword=$(shell cat $(dockerCredsDir)pass.creds))
	$(shell for EACH in "Dockerfile" "supervisord.conf"; do curl $(url)$$EACH --output ${dir}$$EACH; done)
	echo $(dockerPassword) | docker login -u $(dockerUsername) --password-stdin
	docker build -t $(dockerUsername)/nextcloud-full:full ./docker/nextcloud-full/
	docker push $(dockerUsername)/nextcloud-full:full

