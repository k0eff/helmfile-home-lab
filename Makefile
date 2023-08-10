SHELL=/bin/bash
.PHONY: diff


ifndef HFL_ENV
$(error FATAL ERROR: HFL_ENV is not set. Please set it by dot-sourcing from protected/main.sh and supplying HFL_ENV)
endif

diff:
	helmfile -e ${HFL_ENV} diff


apply:
	helmfile -e ${HFL_ENV} apply
