# Security testing and pipeline security

Security is layered because each technique sees different risk:

- **SAST:** CodeQL analyzes code/data flow.
- **SCA:** `npm audit` reports known dependency advisories.
- **Secrets:** Gitleaks scans repository history/content.
- **Container/source:** Trivy finds OS and library vulnerabilities.
- **DAST:** ZAP baseline probes the running HTTP surface.

Critical/high findings and secrets are hard gates. Medium findings are visible warnings by default. Suppression files start empty and require owner, rationale, expiry, and review. A passing scan means only that the configured tools found no blocking result in the scanned scope—not that the system is “secure.” Threat modelling, abuse-case testing, authorization review, penetration testing, and operational controls remain necessary.

## CI/CD security

- Workflow permissions are explicit and least privilege.
- Third-party actions use versioned references; Dependabot tracks action updates. Production programs can pin immutable commit SHAs.
- Secrets belong in GitHub Environments/Secrets or Azure Key Vault, AWS Secrets Manager, or HashiCorp Vault—not source or logs.
- Forked/untrusted PRs receive no privileged deployment credentials.
- Lock files, dependency review, audit, image scanning, and minimal non-root images reduce supply-chain exposure without overclaiming provenance.
- Artifacts may contain sensitive URLs, payloads, traces, or screenshots; retention and access need governance.

The repository never includes an intentional vulnerability in its default branch.
