# Quality Gates for Generative AI

## Designing Release Policies for LLM, RAG and Agentic Systems

**Technical White Paper — Version 1.0**  
**September 2026**

**Author:** Ashok Kumar Manohar  
**GitHub:** [ashokmanohar-ai](https://github.com/ashokmanohar-ai)  
**Primary reference implementation:** [Continuous Quality Engineering](https://github.com/ashokmanohar-ai/continuous-quality-engineering)  
**Related implementations:** [Enterprise AI Quality Engineering Platform](https://github.com/ashokmanohar-ai/enterprise-ai-quality-engineering-platform), [LLM Quality Evaluation Harness](https://github.com/ashokmanohar-ai/llm-quality-evaluation-harness), [RAG & LLM Evaluation Lab](https://github.com/ashokmanohar-ai/rag-llm-evaluation-lab), [AI Agent Evaluation Framework](https://github.com/ashokmanohar-ai/ai-agent-evaluation-framework), [Promptfoo LLM Testing](https://github.com/ashokmanohar-ai/promptfoo-llm-testing), [Phoenix LLM Observability](https://github.com/ashokmanohar-ai/phoenix-llm-observability), and [Agentic Quality Engineering Platform](https://github.com/ashokmanohar-ai/agentic-quality-engineering-platform)

> **Publication note:** This is an independent practitioner white paper supported by open-source reference implementations. It is not a peer-reviewed academic publication, legal opinion, compliance certification, security certification, model-risk certification, or statement of production readiness. Thresholds, required evidence, risk tiers and approval controls must be calibrated for each organization, product, deployment environment and regulatory context.

---

## Abstract

Traditional CI/CD pipelines often answer a binary question: did the build pass? That model works when release readiness can be inferred from deterministic compilation, unit tests, integration tests, security scans and deployment checks. Generative AI changes the decision surface. A release can compile, pass all conventional tests and still regress in groundedness, retrieval quality, refusal behavior, agent tool selection, authorization, prompt-injection resistance, latency, token consumption or cost.

The central challenge is therefore not merely how to evaluate an LLM, RAG pipeline or AI agent. It is how to convert many heterogeneous evaluation signals into a **governed release decision** without allowing averages to hide critical failures, missing evidence to masquerade as success, or probabilistic judges to become unchallenged release authorities.

This white paper presents **Quality Gates for Generative AI** as a policy architecture for transforming software, AI, security, operational and governance evidence into transparent release outcomes. It proposes an **Evidence–Policy–Gate–Decision–Feedback model**. Evidence is collected from deterministic tests, AI evaluations, security checks, operational measurements and human approvals. Policy declares which evidence is mandatory, which thresholds are hard blockers, which conditions may trigger warnings, and which risks require explicit human acceptance. A gate evaluates the evidence without silently filling gaps. The resulting decision is retained with provenance and fed back into future regression suites.

The framework distinguishes **hard gates**, **warning gates**, **advisory metrics**, **missing evidence**, **infrastructure failure**, **conditional release**, and **human exception paths**. It also introduces risk-based gate profiles for pull requests, nightly evaluation, release candidates and high-impact production changes.

The central proposition is:

> **A Generative AI release should pass only when the required evidence exists, critical risks satisfy non-negotiable controls, probabilistic quality meets calibrated thresholds, regressions remain within approved budgets, and any residual uncertainty is explicitly owned rather than silently averaged away.**

---

## 1. Executive Summary

Generative AI systems combine deterministic software and probabilistic behavior.

A release may contain changes to:

- application code;
- system prompts;
- user prompt templates;
- model or deployment version;
- temperature or decoding parameters;
- retrieval logic;
- embeddings;
- chunking or indexing configuration;
- tool schemas;
- agent orchestration;
- authorization policy;
- evaluation datasets;
- judge prompts or judge models;
- safety controls;
- deployment infrastructure.

Each change can affect quality differently.

A traditional pipeline might still report:

```text
Build: PASS
Unit tests: PASS
API tests: PASS
Deployment smoke: PASS
```

while the AI system has actually regressed:

```text
Groundedness: ↓
Retrieval recall: ↓
Unsupported claims: ↑
Tool-use correctness: ↓
Prompt-injection resistance: ↓
P95 task latency: ↑
Tokens per successful task: ↑
```

This means AI release governance requires a **multi-surface quality gate**.

A practical flow is:

```text
Change
  ↓
Risk Classification
  ↓
Required Evaluation Profile
  ↓
Conventional Tests + AI Evaluations + Security + Operations
  ↓
Normalize Evidence
  ↓
Compare Against Policy + Baseline
  ↓
Hard Gates + Warning Gates + Advisory Signals
  ↓
PASS / CONDITIONAL_PASS / FAIL / INFRASTRUCTURE_ERROR
  ↓
Release, Human Review or Block
  ↓
Production Feedback → Regression Dataset
```

The architecture must satisfy five rules:

1. **Required evidence must exist.**
2. **Critical failures cannot be averaged away.**
3. **Probabilistic metrics must be calibrated and versioned.**
4. **A baseline comparison must use equivalent evaluation conditions.**
5. **Human exceptions must be explicit, bounded and auditable.**

---

## 2. Why Conventional Quality Gates Are Not Enough

Traditional gates assume that evidence is largely deterministic. A test either passed or failed. A static analyzer found a vulnerability or did not. A schema is valid or invalid.

AI systems add dimensions that are not naturally binary:

- semantic correctness;
- groundedness;
- relevance;
- completeness;
- refusal quality;
- hallucination rate;
- retrieval ranking quality;
- agent trajectory efficiency;
- judge agreement;
- repeated-run stability;
- cost efficiency.

These metrics can fluctuate and require sampling, thresholds, distributions and human calibration.

The solution is not to discard deterministic gates. It is to **layer probabilistic quality evidence around deterministic controls**.

---

## 3. The Evidence–Policy–Gate–Decision–Feedback Model

The proposed operating model has five components.

### Evidence

Measured facts from tests, evaluations, scans, traces and approvals.

### Policy

Versioned rules defining what evidence is required and how it is interpreted.

### Gate

A deterministic decision engine that evaluates evidence against policy.

### Decision

An explicit release outcome with reasons and provenance.

### Feedback

Production failures, incidents and accepted risks converted into future regression evidence.

The gate itself should be deterministic even when some of the evidence it consumes is probabilistic.

---

## 4. Quality Contracts Before Quality Gates

A gate cannot be meaningful without a quality contract.

The quality contract should define:

- supported tasks;
- expected behavior;
- prohibited behavior;
- quality dimensions;
- critical risks;
- required evidence;
- thresholds;
- baseline policy;
- approval conditions;
- release profiles;
- rollback triggers.

A quality gate enforces the contract; it does not invent one.

---

## 5. Gate Outcomes

A mature gate should return more than green or red.

Recommended outcomes are:

### PASS

All mandatory evidence exists and all hard controls pass.

### CONDITIONAL_PASS

Hard controls pass, but one or more warning thresholds require explicit attention.

### FAIL

At least one hard gate fails.

### INFRASTRUCTURE_ERROR

The quality decision could not be made because evidence, policy or gate infrastructure was malformed or unavailable.

Treating infrastructure failure as product failure can obscure the root cause. Treating it as success is worse.

---

## 6. Hard Gates

A hard gate represents a condition that must not be traded away by better scores elsewhere.

Examples include:

- critical safety failure;
- confirmed sensitive-data disclosure;
- unauthorized tool invocation;
- missing required human approval;
- cross-tenant access;
- critical structured-output violation;
- mandatory retrieval failure for a high-risk use case;
- unresolved high-severity security finding;
- missing required evaluation report;
- prohibited action executed by an agent.

A weighted quality score must never override a hard gate.

---

## 7. Warning Gates

Warning gates identify conditions that may be releasable but require attention.

Examples include:

- moderate drop in relevance;
- small latency regression;
- non-critical increase in token usage;
- borderline judge score;
- elevated retry count;
- minor completeness regression;
- reduced but still acceptable retrieval precision.

Warnings should produce `CONDITIONAL_PASS`, not silently remain invisible inside a dashboard.

---

## 8. Advisory Metrics

Not every metric should block a release.

Advisory metrics may include:

- style preferences;
- low-impact wording quality;
- cost trend below a budget threshold;
- informational drift measurements;
- exploratory evaluator outputs.

Advisory signals are useful for optimization but should not be confused with release criteria.

---

## 9. Missing Evidence Is Not Passing Evidence

One of the most dangerous CI/CD anti-patterns is treating a missing report as zero findings.

For example:

```text
Security report missing
→ vulnerabilities = 0
→ PASS
```

This is logically invalid.

The correct model is:

```text
Security report missing
→ required evidence incomplete
→ FAIL or INFRASTRUCTURE_ERROR according to policy
```

The same applies to missing AI evaluation data.

> **Not evaluated is not the same as passed.**

---

## 10. Mandatory Evidence Sets

Every gate profile should define its mandatory evidence set.

A release profile might require:

- conventional test report;
- LLM evaluation report;
- RAG evaluation report;
- agent evaluation report;
- security report;
- performance report;
- baseline comparison;
- observability metadata;
- approval evidence for high-impact tools.

If one required artifact is absent, the decision should fail closed.

---

## 11. Deterministic-First Evaluation

The gate should use deterministic evidence whenever possible.

Examples include:

- JSON Schema validity;
- exact tool name;
- tool argument types;
- forbidden tool detection;
- approval presence;
- citation source existence;
- access-control outcome;
- latency threshold;
- token count;
- retry count;
- policy version;
- dataset hash.

A language model should not judge something that software can prove directly.

---

## 12. LLM Quality Gates

LLM quality gates can cover:

- correctness;
- relevance;
- completeness;
- groundedness;
- hallucination;
- refusal quality;
- structured output;
- sensitive-information handling;
- prompt-injection behavior;
- repeated-run stability;
- latency;
- token usage;
- cost.

Different use cases require different thresholds. A customer-support assistant and a high-impact decision-support tool should not share the same policy by default.

---

## 13. RAG Quality Gates

RAG systems require stage-level evidence.

### Retrieval gates

- Recall@K;
- Precision@K;
- Hit Rate;
- MRR;
- NDCG;
- required-source presence;
- authorization filtering;
- freshness/version checks.

### Context gates

- sufficiency;
- redundancy;
- token budget;
- prohibited document inclusion;
- tenant isolation.

### Generation gates

- groundedness;
- citation validity;
- factual completeness;
- unsupported-claim rate;
- refusal when evidence is insufficient.

A good final answer should not hide a broken retriever.

---

## 14. Agent Quality Gates

Agent systems require trajectory evidence.

A gate may validate:

- correct tool selection;
- correct arguments;
- authorization outcomes;
- expected tool sequence;
- required confirmations;
- bounded retries;
- loop prevention;
- state consistency;
- final-answer consistency with tool results;
- absence of hallucinated tool use;
- absence of unauthorized side effects.

A polished final answer does not compensate for a policy-violating trajectory.

---

## 15. MCP and Tool-Connected Gates

For MCP-enabled systems, gate evidence should distinguish:

- tool discovery;
- permission;
- schema validity;
- call execution;
- business-rule outcome;
- application authorization;
- resource access;
- side effects;
- evidence retention.

Discovery is not permission.

A client seeing a tool does not prove that the underlying business action is authorized.

---

## 16. Prompt Quality Gates

Prompt changes should be versioned release artifacts.

Prompt gates may cover:

- golden-dataset regression;
- structured-output compliance;
- negative behavior;
- refusal policy;
- injection resistance;
- groundedness;
- semantic quality;
- token and latency impact;
- baseline-versus-candidate comparison.

A one-line prompt change can be a production behavior change and should be governed accordingly.

---

## 17. Security Gates

Security gates should be separate from ordinary quality scoring.

Examples include:

- direct prompt injection;
- indirect prompt injection;
- sensitive-data leakage;
- system-prompt extraction;
- cross-session leakage;
- cross-tenant access;
- excessive agency;
- unauthorized tool invocation;
- unsafe output-to-action behavior;
- tool poisoning;
- malicious retrieval content;
- insecure fallback.

A security blocker is not a low quality score. It is a release blocker.

---

## 18. Authorization Gates

Authorization must remain authoritative at the application or service boundary.

Quality gates should validate that:

- the correct identity was used;
- role and scope were correct;
- ownership rules were enforced;
- tenant boundaries were preserved;
- privileged actions required the expected approval;
- authorization failures were handled safely.

AI reasoning cannot grant authority.

---

## 19. Human-in-the-Loop Gates

Some actions require explicit human approval.

The gate should prove:

- approval was required;
- the approver was authorized;
- approval was bound to the exact action or artifact;
- the approval had not expired;
- parameters did not change after approval;
- execution occurred only after approval;
- outcome evidence was retained.

Human review becomes an engineering control only when it is observable and enforceable.

---

## 20. LLM-as-a-Judge Gates

LLM judges can support semantic metrics but should not become unvalidated release authorities.

Judge governance should include:

- fixed judge model/deployment;
- versioned judge prompt;
- structured judge output;
- calibration against human-labelled examples;
- repeated-run stability checks;
- position-bias testing;
- disagreement analysis;
- timeouts and retry budgets;
- cost tracking;
- judge change control.

A judge threshold is meaningful only when the judge itself has been evaluated.

---

## 21. Baseline Comparison

Absolute thresholds are necessary but insufficient.

A candidate can still regress while remaining above the absolute floor.

Compare candidate and baseline using equivalent:

- dataset version;
- evaluator version;
- judge model;
- judge prompt;
- retrieval configuration;
- model settings;
- environment;
- sampling policy.

Otherwise the comparison is confounded.

---

## 22. Regression Budgets

A release policy can define maximum allowed regression.

For example:

```text
Correctness drop <= 1.0 percentage point
Groundedness drop <= 1.0 percentage point
Safety regression = 0
Unauthorized tool regression = 0
P95 latency increase <= 10%
Cost per successful task increase <= 15%
```

These values are examples, not universal standards.

The important idea is that regression tolerance must be explicit.

---

## 23. Weighted Scores

Weighted scores can be useful for executive summaries and trends.

For example:

```text
Quality Score =
  20% correctness
+ 20% groundedness
+ 15% relevance
+ 15% completeness
+ 10% reliability
+ 10% performance
+ 10% cost efficiency
```

But weighted averages must remain subordinate to hard gates.

A safety failure must not be offset by excellent relevance.

---

## 24. Multi-Objective Release Decisions

AI quality is inherently multi-objective.

A release may improve:

- quality;
- latency;
- cost;
- safety;
- reliability;

while worsening another dimension.

The gate should expose the trade-off rather than collapse it into one unexplained number.

---

## 25. Risk-Based Evaluation Profiles

Not every change needs the same evaluation cost.

A risk engine can map change type to required profiles.

Examples:

| Change | Typical required evidence |
|---|---|
| Documentation only | conventional tests |
| UI copy | UI + smoke |
| Prompt change | prompt regression + semantic quality + safety |
| Model upgrade | full LLM/RAG/agent regression + performance/cost |
| Retriever change | retrieval + generation + authorization filters |
| Tool schema change | agent/MCP + authorization + side-effect tests |
| Security policy change | security regression + approval tests |
| Judge change | evaluator calibration + comparison re-run |

Risk-based gating controls cost without sacrificing critical coverage.

---

## 26. Pull-Request Profile

The PR profile should be fast and high-signal.

Typical contents:

- deterministic unit and contract tests;
- changed-area AI cases;
- safety smoke;
- prompt regression subset;
- critical RAG cases;
- critical agent/tool cases;
- schema checks;
- small baseline comparison.

The PR gate should prioritize blockers and avoid running every expensive evaluation on every edit.

---

## 27. Nightly Profile

Nightly evaluation can include:

- full golden dataset;
- repeated-run stability;
- broader RAG metrics;
- adversarial security cases;
- larger agent trajectory suites;
- cost and latency trends;
- model-judge consistency;
- cross-browser or environment coverage.

Nightly results should feed trend analysis and baseline health.

---

## 28. Release Profile

A release gate should require complete evidence for the risk class.

Typical release evidence includes:

- full functional validation;
- complete AI evaluation suite;
- baseline comparison;
- security results;
- performance/cost results;
- production-readiness evidence;
- HITL approvals where required;
- explicit release recommendation.

Release profiles should fail closed on missing evidence.

---

## 29. Model Upgrade Gates

A model upgrade is a behavioral dependency change.

A model gate should evaluate:

- quality;
- safety;
- RAG behavior;
- tool behavior;
- structured output;
- latency;
- token usage;
- cost;
- repeated-run stability;
- rollback readiness.

“Newer” is not equivalent to “better for this product.”

---

## 30. Retrieval Upgrade Gates

Changes to embeddings, chunking, reranking or indexing should trigger retrieval-specific evaluation.

Required evidence may include:

- Recall@K;
- ranking quality;
- source authorization;
- freshness;
- context size;
- downstream groundedness;
- latency;
- cost.

Do not evaluate a retrieval change only from final-answer quality.

---

## 31. Agent Upgrade Gates

Agent architecture changes should trigger:

- trajectory tests;
- tool-selection checks;
- argument validation;
- loop/retry checks;
- authorization tests;
- confirmation/HITL tests;
- cost-per-task comparison;
- end-to-end task success.

Agent quality is trajectory quality plus outcome quality.

---

## 32. Performance Gates

AI performance gates should go beyond ordinary HTTP latency.

Useful metrics include:

- time to first token;
- time per output token;
- total generation latency;
- retrieval latency;
- tool-call latency;
- end-to-end task latency;
- P95/P99;
- timeout rate;
- retry rate;
- completion rate.

Performance regressions can be release-significant even when semantic quality improves.

---

## 33. Cost Gates

Cost is a quality dimension because inefficient AI behavior can make a product operationally unsustainable.

Track:

- input tokens;
- output tokens;
- context tokens;
- model calls;
- tool calls;
- retries;
- cost per request;
- cost per successful task.

A cost gate should use real provider or application-side measurements with versioned price assumptions.

Missing cost data should not be reported as zero.

---

## 34. Reliability Gates

AI reliability includes:

- timeout behavior;
- retry behavior;
- fallback behavior;
- provider failure;
- rate limiting;
- retrieval outage;
- tool failure;
- partial dependency failure;
- state recovery;
- idempotency.

A release should prove how the system fails, not only how it succeeds.

---

## 35. Observability Gates

A release can require minimum observability evidence.

For example:

- trace ID present;
- model/deployment version captured;
- prompt version captured;
- retrieval metadata captured;
- tool calls traced;
- tokens captured;
- latency captured;
- evaluation linked to trace;
- privacy redaction policy applied.

If teams cannot diagnose production AI behavior, release confidence is incomplete.

---

## 36. Evidence Provenance

Every gate decision should record enough metadata to reproduce the context.

Recommended fields include:

```text
commit_sha
dataset_version
dataset_hash
model_deployment
prompt_version
retriever_version
embedding_version
agent_version
tool_schema_version
judge_model
judge_prompt_version
policy_version
environment
timestamp
trace_id
```

A score without provenance is weak evidence.

---

## 37. Normalized Evidence Model

Specialist tools should remain authoritative for their execution but export normalized gate evidence.

A normalized record can contain:

```json
{
  "test_id": "rag-refund-001",
  "domain": "rag",
  "metric": "groundedness",
  "value": 0.94,
  "threshold": 0.90,
  "passed": true,
  "severity": "high",
  "dataset_version": "2026.09",
  "model_version": "candidate-v3",
  "evaluator_version": "judge-v2",
  "evidence_uri": "artifact://..."
}
```

Normalization should not erase specialist detail.

---

## 38. Gate Infrastructure Failure

The gate must distinguish quality failure from gate infrastructure failure.

Examples of infrastructure failure include:

- malformed JSON evidence;
- unreadable report;
- invalid policy file;
- incompatible schema version;
- failed evidence parser;
- evaluator service unavailable when mandatory.

These cases require engineering attention and must not silently produce PASS.

---

## 39. Human Exceptions

Some organizations allow temporary exceptions.

An exception should include:

- failed control;
- business justification;
- risk owner;
- approver;
- expiry time;
- scope;
- compensating controls;
- rollback condition;
- remediation ticket.

An exception is not a threshold change.

It should be narrow, time-bound and auditable.

---

## 40. Threshold Change Governance

Thresholds should not be loosened merely because a candidate fails.

A threshold change should require:

- evidence that the old threshold is inappropriate;
- analysis of false positives/negatives;
- historical impact;
- risk-owner approval;
- policy version change;
- re-baselining where necessary.

Moving the goalposts during a release undermines the gate.

---

## 41. Evaluation Dataset Governance

Gate quality depends on dataset quality.

Datasets should be:

- representative;
- versioned;
- risk-balanced;
- stable enough for comparison;
- updated from production failures;
- privacy reviewed;
- protected from leakage into prompts or training where relevant.

A stale dataset can create false confidence.

---

## 42. Production-to-Regression Feedback

Every meaningful production failure should trigger a review:

```text
Production Failure
    ↓
Trace + Evidence Collection
    ↓
Root Cause
    ↓
Sanitized Minimal Reproduction
    ↓
Add to Versioned Evaluation Dataset
    ↓
Fix
    ↓
Verify
    ↓
Permanent Regression Gate
```

This converts incidents into durable quality intelligence.

---

## 43. Security and Governance Alignment

The gate architecture aligns conceptually with widely used AI risk and security guidance.

Useful references include:

- NIST AI Risk Management Framework: https://www.nist.gov/itl/ai-risk-management-framework
- NIST Generative AI Profile (NIST AI 600-1): https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence
- OWASP GenAI LLM Top 10 2026: https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/
- OWASP Top 10 for Agentic Applications 2026: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/

These references help inform risk coverage. They do not convert a passing internal gate into certification.

---

## 44. Reference Implementation Pattern

The companion Continuous Quality Engineering repository demonstrates the core mechanics needed for a trustworthy gate:

- specialist tools produce machine-readable evidence;
- results are normalized;
- mandatory reports are declared;
- missing required evidence fails closed;
- hard failures cannot be hidden by a weighted score;
- warnings produce a conditional outcome;
- malformed evidence/policy is classified separately;
- PR, nightly, security, performance and release workflows produce different evidence profiles.

The same pattern extends naturally to AI-specific evidence.

---

## 45. Example AI Release Policy

A simplified policy might read:

```yaml
profile: release
mandatory_reports:
  - software
  - llm
  - rag
  - agent
  - security
  - performance
  - baseline_comparison

hard_gates:
  safety_critical_failures: 0
  pii_leaks: 0
  unauthorized_tool_calls: 0
  cross_tenant_access: 0
  missing_required_approvals: 0
  structured_output_critical_failures: 0

thresholds:
  correctness_min: 0.90
  groundedness_min: 0.90
  rag_recall_at_5_min: 0.90
  agent_task_success_min: 0.95
  p95_task_latency_ms_max: 5000
  max_cost_regression_percent: 15

warnings:
  relevance_min: 0.85
  completeness_min: 0.85
```

This is an illustrative structure, not a universal policy.

---

## 46. Quality Gate KPIs

Useful governance KPIs include:

### Quality

- critical gate failure rate;
- AI regression rate;
- escaped AI defect rate;
- production failure recurrence rate;
- groundedness trend;
- agent policy-violation rate.

### Delivery

- gate execution time;
- time to diagnosis;
- percentage of PRs requiring full AI evaluation;
- exception count and age.

### Reliability

- evaluation flakiness;
- judge disagreement rate;
- missing-evidence incidents;
- gate infrastructure failures.

### Efficiency

- tokens per evaluation;
- cost per evaluated release;
- cost per successful task;
- evaluation reuse rate.

---

## 47. Anti-Patterns

Avoid these patterns:

### One overall AI score

Averages can hide critical failures.

### Treating missing reports as zero

Absence of evidence is not evidence of absence.

### LLM judge as final authority

A judge is a probabilistic measurement instrument.

### Moving thresholds after failure

This destroys governance integrity.

### Comparing incomparable baselines

Different datasets or evaluator versions invalidate many conclusions.

### Running every expensive test on every commit

Use risk-based profiles.

### Security as an advisory metric

Critical security outcomes should be hard gates.

### Ignoring operational evidence

Quality that cannot be operated reliably is incomplete.

### Retrying until an AI test passes

Retries can hide instability.

### No ownership for exceptions

Unowned residual risk becomes permanent hidden risk.

---

## 48. Enterprise Adoption Roadmap

### Stage 1 — Evidence

- version datasets;
- capture AI metrics;
- retain artifacts;
- introduce deterministic controls.

### Stage 2 — AI-Specific Gates

- add LLM/RAG/agent thresholds;
- separate hard and warning gates;
- fail on missing evidence.

### Stage 3 — Risk-Based Policy

- introduce PR/nightly/release profiles;
- baseline comparison;
- model/prompt/retrieval change classification;
- human exception workflow.

### Stage 4 — Continuous Governance

- production trace feedback;
- incident-to-regression conversion;
- trend monitoring;
- evaluator calibration;
- policy effectiveness review.

---

## 49. Role of the AI Quality Engineer

The AI Quality Engineer should not merely execute evaluations.

The role should help define:

- what evidence matters;
- which risks are non-negotiable;
- how thresholds are calibrated;
- when semantic judges are appropriate;
- which changes require broader evaluation;
- how evidence is normalized;
- what release outcomes mean;
- how production failures strengthen future gates.

The role connects evaluation science to delivery governance.

---

## 50. Conclusion

Generative AI does not eliminate the need for release gates. It makes them more important.

The core challenge is to avoid two extremes:

1. treating AI like ordinary deterministic software; or
2. replacing engineering controls with opaque model scores.

A trustworthy AI release process combines deterministic software evidence, calibrated probabilistic evaluation, security controls, authorization, operational measurements, baseline comparison and human accountability.

The goal is not to create the largest possible gate.

It is to create the **smallest defensible gate that proves the required level of quality for the risk being introduced**.

The final principle is:

> **A quality gate should make uncertainty visible, missing evidence explicit, critical risk non-negotiable, and the release decision explainable.**

---

## References

1. NIST, *Artificial Intelligence Risk Management Framework (AI RMF 1.0)*, 2023. https://www.nist.gov/itl/ai-risk-management-framework
2. NIST, *Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile (NIST AI 600-1)*, 2024; NIST page updated 2026. https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence
3. OWASP GenAI Security Project, *OWASP GenAI LLM Top 10 2026*. https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/
4. OWASP GenAI Security Project, *OWASP Top 10 for Agentic Applications 2026*. https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
5. Ashok Kumar Manohar, *Continuous AI Quality Engineering: Integrating LLM, RAG and Agent Evaluation into CI/CD Quality Gates*. https://github.com/ashokmanohar-ai/continuous-quality-engineering/blob/main/WHITEPAPER.md
6. Ashok Kumar Manohar, *Enterprise AI Quality Engineering: A Reference Architecture for Testing LLM, RAG, Agentic AI and MCP Systems*. https://github.com/ashokmanohar-ai/enterprise-ai-quality-engineering-platform/blob/main/publications/ENTERPRISE_AI_QUALITY_ENGINEERING_REFERENCE_ARCHITECTURE.md
7. Ashok Kumar Manohar, *LLM-as-a-Judge for Quality Engineering*. https://github.com/ashokmanohar-ai/llm-quality-evaluation-harness/blob/main/publications/LLM_AS_A_JUDGE_FOR_QUALITY_ENGINEERING.md
8. Ashok Kumar Manohar, *Agentic AI Security Testing*. https://github.com/ashokmanohar-ai/enterprise-ai-quality-engineering-platform/blob/main/publications/AGENTIC_AI_SECURITY_TESTING.md

---

## Citation

Citation metadata is provided in [`CITATION_QUALITY_GATES_FOR_GENERATIVE_AI.cff`](CITATION_QUALITY_GATES_FOR_GENERATIVE_AI.cff).

## License

This publication is distributed under the repository's MIT License unless otherwise noted.