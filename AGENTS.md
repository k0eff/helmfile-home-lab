# Agent Instructions

## Security — No Secrets in This Repository

This is a **public repository**. Never store secrets, credentials, or sensitive values here.

Secrets and sensitive configuration belong exclusively in the protected repository:
**[k0eff/helmfile-home-lab-protected](https://github.com/k0eff/helmfile-home-lab-protected)**
which is checked out locally at `./protected/`.

### What must NOT be committed here

- Passwords, API keys, tokens, bearer credentials
- Kubernetes Secrets with real values (use references or sealed secrets)
- TLS private keys or certificates containing private keys
- Cloud provider credentials (Cloudflare tokens, etc.)
- Docker registry credentials
- Any value from `protected/envs/`

### Where secrets go instead

All sensitive values are stored under `protected/` in the private repo above.
Helmfile templates and values files may reference secret variables, but the
variable values themselves must never appear in this repo.

### If you are unsure

When in doubt, put the value in the `protected/` repo and reference it as a variable.
