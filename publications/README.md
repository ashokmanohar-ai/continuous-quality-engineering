# Technical White Papers

This directory is the publication index for technical white papers associated with **Continuous Quality Engineering** and authored by **Ashok Kumar Manohar**.

## 1. Continuous AI Quality Engineering

**Continuous AI Quality Engineering: Integrating LLM, RAG and Agent Evaluation into CI/CD Quality Gates**

- [Read the white paper](../WHITEPAPER.md)
- [Citation metadata](../CITATION.cff)
- Version: 1.0
- Published: September 2026

Focus: continuous evaluation of LLM, RAG and agentic systems; versioned evaluation datasets; deterministic-first controls; candidate-versus-baseline comparison; security gates; missing-evidence handling; performance and cost; observability; risk-based PR/nightly/release profiles; and production-to-regression learning.

---

## 2. Quality Gates for Generative AI

**Quality Gates for Generative AI: Designing Release Policies for LLM, RAG and Agentic Systems**

- [Read the white paper](QUALITY_GATES_FOR_GENERATIVE_AI.md)
- [Citation metadata](CITATION_QUALITY_GATES_FOR_GENERATIVE_AI.cff)
- Version: 1.0
- Published: September 2026

Focus: the policy and decision layer for Generative AI release governance—mandatory evidence, hard gates, warning gates, advisory metrics, missing-evidence semantics, deterministic-first evaluation, LLM/RAG/agent/MCP gates, security and authorization, human approval, judge governance, baseline comparison, regression budgets, performance and cost, observability, human exceptions, threshold governance and risk-based CI/CD profiles.

> **Release-governance paper:** this publication separates evidence collection from policy enforcement and defines how heterogeneous AI-quality signals become explainable `PASS`, `CONDITIONAL_PASS`, `FAIL`, or infrastructure-error outcomes.

---

## Reference Implementations

The primary [Continuous Quality Engineering](https://github.com/ashokmanohar-ai/continuous-quality-engineering) repository demonstrates normalized evidence, mandatory-report handling, hard gates, warning thresholds, a transparent quality score that cannot override blockers, change-impact analysis, and separate PR, nightly, security, performance and release workflows.

Related repositories extend this evidence-and-gate model to [LLM evaluation](https://github.com/ashokmanohar-ai/llm-quality-evaluation-harness), [RAG evaluation](https://github.com/ashokmanohar-ai/rag-llm-evaluation-lab), [AI agent evaluation](https://github.com/ashokmanohar-ai/ai-agent-evaluation-framework), [enterprise AI QE](https://github.com/ashokmanohar-ai/enterprise-ai-quality-engineering-platform), [prompt testing](https://github.com/ashokmanohar-ai/promptfoo-llm-testing), and [AI observability](https://github.com/ashokmanohar-ai/phoenix-llm-observability).

> These are independent practitioner white papers and are not peer-reviewed academic publications, compliance certifications, security certifications, or statements of production readiness.