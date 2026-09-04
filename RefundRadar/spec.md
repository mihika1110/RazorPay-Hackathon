Razorpay AI Buildathon 2026 — Project Specification
1. Hackathon Context
I am participating in the Razorpay AI Buildathon 2026.
The hackathon has multiple tracks. I have selected:
Track 2 — AI Risk Manager
Track description:
“Stop the merchant losing money to fraud, returns and chargebacks.”
The track asks participants to build a working detector, verifier, or auto-responder for one specific loss class, with measured precision/recall on a held-out test set.
The evaluation emphasizes:
Problem taste
Build quality
AI judgment
Failure recovery
Real working product rather than just an idea
The project should therefore be a real, demonstrable risk-management product, not merely an ML notebook.

2. Project Idea
Project Name
RefundShield — AI-Powered Coordinated Refund Abuse Investigator
You may suggest a better professional name if appropriate, but keep the core idea unchanged.
One-line description
Build an AI-powered system that helps merchants detect coordinated refund/return abuse across multiple accounts and orders by combining machine-learning risk scoring, relationship/graph analysis, and an AI investigation agent.

3. The Real-World Problem
Merchants can lose significant money not only because of payment fraud, but also because customers abuse legitimate refund/return policies.
One possible abuse pattern is:
A person creates or controls multiple accounts and places orders through them. The individual orders may look legitimate when examined separately.
For example:
Account A → Order 101 → Product X → RefundAccount B → Order 205 → Product X → RefundAccount C → Order 317 → Product X → RefundAccount D → Order 402 → Product Y → Refund
Individually, these orders may not look suspicious.
However, when analyzed together, the system may discover signals such as:
Multiple accounts sharing a device
Multiple accounts sharing an address
Similar order behavior
Accounts created around the same time
High order velocity
Repeated refunds
Unusually high refund rate
Repeated ordering and returning of the same products
Similar payment/order patterns
Strong relationships between apparently unrelated accounts
The important point is:
Multiple accounts alone should NOT be considered fraudulent.
Families, roommates, offices, and legitimate users can share devices or addresses.
The system must combine multiple signals and identify patterns of coordinated refund/return abuse.

4. Important Problem Definition
Do NOT build a generic:
“Fraud detection system”
and do NOT make the project primarily about:
“Suspicious payment transactions.”
The focus should be:
Order-level coordinated refund/return abuse.
A transaction/payment can be one signal, but it should not be the core object being classified.
The primary question is:
“Does this order, or this group of related orders, show strong evidence of coordinated refund/return abuse?”
The system should NOT claim:
“This person is definitely fraudulent.”
Instead, it should say:
“These orders/accounts exhibit multiple indicators consistent with coordinated refund abuse and should be investigated.”
This distinction is important for reducing false positives and making the product realistic.

5. Core Product
Build an end-to-end web application where a merchant/risk analyst can:
View their order/risk dashboard.
Upload or load synthetic merchant data.
Run risk analysis.
Identify suspicious orders.
Identify clusters of connected orders/accounts.
View why a cluster was flagged.
Ask an AI investigator to investigate a suspicious cluster.
Receive an evidence-backed investigation report.
See the recommended next action.
Review model performance metrics.
See false-positive examples/failure cases.
View an audit trail of investigations and decisions.
The application should feel like a real merchant risk-management product, not a college ML demo.

6. High-Level Architecture
Build the system using these major components:
                    MERCHANT DATA                         |                         v              +----------------------+              | Data Processing Layer|              +----------------------+                         |                         v              +----------------------+              | Feature Engineering  |              +----------------------+                         |              +----------+-----------+              |                      |              v                      v       ML Risk Scoring        Relationship Graph              |                      |              |                      v              |              Cluster Detection              |                      |              +----------+-----------+                         |                         v              Suspicious Order/Cluster                         |                         v              +----------------------+              |   AI Investigator    |              |      Agent            |              +----------------------+                         |                         v              Evidence-Based Report                         |                         v              Human Review / Action                         |                         v                    Audit Log

7. Data
Because real merchant data containing confirmed abuse labels will not be available, create a realistic synthetic dataset.
The dataset should contain both:
Normal behavior
Examples:
Normal customers
Occasional refunds
Shared household addresses
Multiple legitimate users
Normal purchasing frequency
Abusive behavior
Generate realistic coordinated abuse scenarios such as:
Multiple accounts controlled by the same abuse group
Repeated refunds
High refund ratio
Similar products repeatedly purchased and returned
Multiple accounts sharing devices
Multiple accounts sharing addresses
Accounts created close together
Abnormally high order frequency
Repeated refund activity across related accounts
Do not create an unrealistically easy dataset where every abusive order has one obvious feature.
There should be ambiguous cases and legitimate edge cases.

8. Suggested Data Model
Create synthetic entities such as:
Customer / Account
account_idaccount_creation_dateaccount_age_daysdevice_idaddress_idpayment_identifiertotal_orderstotal_refundsrefund_rate
Order
order_idaccount_idtimestampproduct_idcategoryamountpayment_methoddevice_idaddress_idorder_statusrefund_requestedrefund_amountrefund_timestamp
Device
device_idnumber_of_accounts
Address
address_idnumber_of_accounts
Refund
refund_idorder_idaccount_idrefund_amountrefund_reasonrefund_timestamp
Add other useful fields where appropriate.
Make sure the dataset is internally consistent.

9. Ground-Truth Labels
Since this is a machine-learning evaluation project, create ground-truth labels during synthetic data generation.
For example:
abuse_label = 0 → normalabuse_label = 1 → coordinated refund/return abuse
Do NOT leak the label directly into the model features.
Create the data so that:
Training set contains labeled examples.
Validation set is separate.
Test set is held out.
The test set must not be used for tuning.
The system must report honest test-set performance.

10. Machine Learning Component
Build an ML model that produces an order-level risk score.
Possible baseline models:
Logistic Regression
Random Forest
XGBoost
Prefer a strong tabular model such as XGBoost or Random Forest if the environment supports it.
Useful features include:
Behavioral features
Orders per day/week
Refund count
Refund rate
Average order value
Average refund value
Time between orders
Time between account creation and first order
Number of products repeatedly returned
Account-level features
Account age
Number of accounts associated with device
Number of accounts associated with address
Previous refund behavior
Relationship features
Number of related accounts
Number of related orders
Shared device count
Shared address count
Cluster size
Temporal features
Burst ordering
Accounts created within a short period
Multiple refunds within a short period
The model should output something like:
Order O1023Risk Score: 0.91Risk Level: HIGH

11. Graph / Relationship Analysis
This is an important differentiating component.
Represent relationships between entities as a graph.
For example:
          Device D17          /    |    \         /     |     \      A101    A204    A319       |       |       |     O1001   O1052   O1120       |       |       |    Refund  Refund  Refund
Nodes can represent:
Accounts
Orders
Devices
Addresses
Products
Edges can represent:
Account → Order
Account → Device
Account → Address
Order → Product
Order → Refund
Use graph analysis to identify related clusters.
A simple implementation using NetworkX is acceptable.
Do not over-engineer this into a research-grade graph neural network unless there is a strong reason.
The goal is a reliable hackathon product.

12. Cluster-Level Risk
An important feature should be cluster-level investigation.
Example:
Cluster #178 accounts23 orders₹42,800 total order value₹31,200 refunded
The system should calculate aggregate indicators such as:
Number of accounts
Number of orders
Total order value
Total refunded value
Refund rate
Shared devices
Shared addresses
Repeated products
Account creation time similarity
Order velocity
Then assign a cluster risk level.

13. AI Investigation Agent
The LLM should NOT replace the ML model.
Instead, the LLM acts as an investigator/reasoning layer on top of structured risk signals.
The agent should have controlled tools/functions such as:
get_order(order_id)get_account(account_id)get_related_accounts(account_id)get_related_orders(account_id)get_refund_history(account_id)get_device_accounts(device_id)get_address_accounts(address_id)get_cluster(cluster_id)get_model_score(order_id)
The agent should use these tools to investigate a flagged case.
Example workflow:
User:"Investigate Cluster #17"Agent:1. Fetch cluster2. Inspect accounts3. Inspect orders4. Inspect refund history5. Check shared devices6. Check shared addresses7. Check temporal patterns8. Compare against normal behavior9. Build evidence10. Produce investigation report

14. AI Investigation Report
The agent should generate a structured report like:
REFUND ABUSE INVESTIGATIONCluster: #17Risk Level: HIGHAccounts: 8Orders: 23Total Order Value: ₹42,800Total Refunded: ₹31,200Key Evidence:1. 6 of 8 accounts are associated with the same device.2. 5 accounts share the same delivery address.3. 19 of 23 orders resulted in refunds.4. Several accounts were created within a short time period.5. Similar products were repeatedly purchased and refunded.6. Order activity shows unusually high velocity.Assessment:The cluster contains multiple independent indicatorsconsistent with coordinated refund/return abuse.Confidence: 87%Recommended Action:Send the cluster for manual investigation.Do NOT automatically block the accounts.
The exact numbers above are only examples. The application must calculate actual values from the generated dataset.

15. Explainability
Every risk decision must be explainable.
For each flagged order/cluster show:
Why was this flagged?✓ High refund frequency✓ Multiple related accounts✓ Shared device✓ Shared address✓ Similar order behavior✓ Unusual order velocity
Avoid black-box:
Risk = 0.93
without explanation.

16. Human-in-the-Loop
Do NOT automatically ban users.
Possible actions:
LOW RISK→ AllowMEDIUM RISK→ Monitor / additional verificationHIGH RISK→ Manual investigationCRITICAL / strong evidence→ Escalate according to merchant policy
The AI should recommend an action, while the merchant/risk analyst makes the final decision.

17. Metrics
The hackathon specifically requires measured performance.
Implement a proper evaluation page.
At minimum report:
Precision
Recall
F1 Score
Confusion Matrix
False Positive Rate
False Negative Rate
Also calculate the cost of false positives.
For example, define a configurable review cost:
False Positive Cost = cost of unnecessarily reviewing/holding a legitimate order
And potentially estimate:
Potential Loss PreventedPotential Loss InvestigatedRefund Value Associated With Flagged Orders
Do not fabricate financial performance.
Clearly distinguish:
Model metrics measured on held-out synthetic test data
Simulated financial impact
Production claims

18. Held-Out Test Set
The dashboard must explicitly show:
MODEL EVALUATIONTraining Records: XXXXXValidation Records: XXXXXHeld-Out Test Records: XXXXXPrecision: XX.X%Recall: XX.X%F1: XX.X%False Positive Rate: XX.X%
The test data must not be used to tune the model.
The goal is to demonstrate that the model actually works rather than cherry-picking examples.

19. Failure Recovery
The hackathon evaluation specifically cares about failure recovery.
Build a visible failure/edge-case workflow.
For example:
Scenario
A legitimate family has:
Multiple accounts
Same home address
Same Wi-Fi/device occasionally
Different purchasing behavior
Normal refund behavior
The system may initially flag the cluster because of shared attributes.
But after deeper investigation, the agent should recognize:
Shared address/device:YESHigh refund rate:NOUnusual order velocity:NORepeated refund pattern:NOStrong coordinated-abuse evidence:NO
Therefore:
Downgrade to MEDIUM/LOW risk and recommend no blocking.
This demonstrates that the system understands that one suspicious signal does not equal fraud.

20. Audit Trail
Every investigation should be logged.
Example:
Audit Log10:42 — Cluster #17 detected10:43 — Risk model generated score 0.9110:43 — Graph relationships calculated10:44 — AI investigation started10:44 — Evidence collected10:45 — Investigation report generated10:45 — Recommended manual review10:46 — Analyst decision: REVIEW
This is important because financial risk systems need traceability.

21. Razorpay Integration
The project is being built specifically for the Razorpay AI Buildathon.
Where appropriate, integrate Razorpay’s test-mode APIs to demonstrate that the system is relevant to a merchant/payment ecosystem.
Do NOT make the project dependent on unavailable production data.
Use Razorpay test-mode capabilities for the parts that are realistically available.
For data that Razorpay test mode does not provide, use clearly labeled synthetic merchant/order/refund data.
The architecture should make this distinction clear:
Razorpay Test Data / APIs          +Synthetic Merchant Abuse Dataset          ↓Risk Engine          ↓Investigation System
Do not pretend that synthetic data came from Razorpay.

22. Technology Stack
Prefer a practical stack.
Backend
Python + FastAPI
ML
Python
pandas
scikit-learn
XGBoost if available
Graph
NetworkX
AI Agent
Use an appropriate LLM API available in the development environment.
The LLM should be used for:
Investigation
Evidence synthesis
Natural-language explanations
Structured report generation
Do NOT use an LLM for basic numerical calculations that can be performed deterministically by Python.
Frontend
Use a modern but simple web frontend.
Preferred:
React
Vite
Tailwind CSS
If setup complexity becomes a problem, use another lightweight frontend approach that can produce a polished dashboard.
Database
Use SQLite/PostgreSQL depending on project complexity.
SQLite is acceptable for the hackathon MVP.

23. Dashboard Pages
Build at least these views:
Dashboard
Show:
Total orders
Orders analyzed
Flagged orders
Suspicious clusters
Potential refund exposure
High-risk cases
Model metrics
Orders
Table containing:
Order IDAccountAmountRefund StatusRisk ScoreRisk Level
Allow filtering by risk.
Suspicious Clusters
Show:
Cluster IDAccountsOrdersRefund RateRefund ValueRisk
Investigation
When a cluster is selected:
Relationship graph
Timeline
Risk signals
Related accounts
Related orders
Refund history
AI investigation report
Recommended action
Model Performance
Show:
Precision
Recall
F1
Confusion matrix
False-positive cost
Audit Log
Show all important system actions.

24. UI/UX Requirements
The application should look like a professional merchant risk dashboard.
Avoid making it look like a generic student ML project.
Use:
Clean dashboard
Professional typography
Clear risk levels
Charts where useful
Interactive tables
Investigation workflow
Graph visualization
Timeline
Evidence cards
The user should immediately understand:
What is happening? Why was something flagged? What should I do?

25. Important Product Principles
Follow these principles throughout implementation:
Principle 1 — Suspicious does not mean fraudulent
Never make definitive accusations.
Principle 2 — Multiple accounts are not inherently suspicious
Use account relationships as one signal among many.
Principle 3 — Explain every decision
Every risk score must have understandable contributing factors.
Principle 4 — Human review for important actions
Do not automatically block users.
Principle 5 — AI should have a meaningful role
The LLM must actually investigate and reason over structured evidence.
Principle 6 — Use deterministic code for deterministic work
Do not ask an LLM to calculate metrics or perform simple database operations.
Principle 7 — Honest evaluation
Never fabricate precision, recall, recovered money, or other metrics.
Principle 8 — Failure handling matters
Show how the system behaves when evidence is ambiguous or when a legitimate customer resembles an abuse pattern.

26. What Makes This Different
The project should NOT be presented as:
“We trained a fraud classifier.”
Instead:
“We built an AI investigation system that combines order-level ML risk scoring, relationship analysis, and an AI agent to uncover coordinated refund abuse that is difficult to detect by looking at individual orders.”
The core innovation is the combination:
Individual Order Risk        +Cross-Account Relationships        +Behavioral Patterns        +Graph Analysis        +AI Investigation        =Coordinated Refund Abuse Detection

27. Example End-to-End Demo
The final demo should follow this story:
Step 1
Merchant opens dashboard.
10,000 orders analyzed247 orders flagged18 suspicious clusters
Step 2
Merchant clicks:
Cluster #17
Step 3
The system displays the relationship graph.
8 Accounts23 Orders6 Shared Devices5 Shared Addresses19 Refunds
Step 4
The merchant clicks:
Investigate with AI
Step 5
The agent investigates the structured data.
Step 6
It generates an evidence-backed report.
Step 7
The merchant sees:
HIGH RISKMultiple independent indicatorsconsistent with coordinated refund abuse.Recommended action:Manual Investigation
Step 8
Show model evaluation:
Precision: ...Recall: ...F1: ...False Positive Rate: ...
Step 9
Finally demonstrate a false-positive/ambiguous case where the system avoids incorrectly accusing a legitimate customer.
This should be part of the pitch because it demonstrates AI judgment and failure recovery.

28. Development Strategy
Do NOT attempt to build the entire system at once.
Implement in stages:
Phase 1 — Project setup
Create:
Backend
Frontend
Database
Basic project structure
Phase 2 — Synthetic data
Create realistic:
Accounts
Orders
Devices
Addresses
Refunds
Abuse labels
Phase 3 — ML
Implement:
Feature engineering
Train/test split
Model training
Risk scores
Evaluation metrics
Phase 4 — Graph
Implement:
Entity relationships
Graph visualization
Connected components/clusters
Cluster-level features
Phase 5 — AI Agent
Implement:
Investigation tools
Structured tool calls
Evidence gathering
Investigation report
Phase 6 — Dashboard
Implement all major UI screens.
Phase 7 — Razorpay test-mode integration
Add appropriate Razorpay test-mode integration where useful and feasible.
Phase 8 — Failure cases
Create and demonstrate legitimate edge cases.
Phase 9 — Polish
Improve:
UI
Error handling
Loading states
Empty states
Audit logs
Documentation
Demo flow

29. Engineering Requirements
Write clean, maintainable code.
Use:
Environment variables for secrets
.env.example
Proper error handling
API validation
Logging
Modular services
Type-safe interfaces where practical
No hardcoded API keys
No fake API responses presented as real Razorpay data
Clear README
Clear setup instructions
Do not over-engineer.
A reliable working MVP is more important than unnecessary complexity.

30. Final Deliverable
Build the complete working application.
I should be able to:
Start the backend.
Start the frontend.
Load/generate the synthetic dataset.
Train or load the model.
Analyze orders.
See suspicious orders.
See suspicious clusters.
Open an investigation.
Ask the AI agent to investigate.
Receive an evidence-backed report.
View model metrics.
View false-positive/failure cases.
View audit logs.
Demonstrate Razorpay relevance through test-mode integration where applicable.
Do not stop at creating a design/mockup.
Actually implement the working product.
If something is unavailable or requires credentials, create a clean abstraction/interface and provide a local mock/synthetic implementation so the core application still runs end-to-end.

31. Success Criteria
Consider the project successful only if the final application demonstrates all of the following:
It addresses a real merchant loss problem.
It clearly fits Razorpay AI Risk Manager.
It focuses specifically on coordinated refund/return abuse.
It operates primarily at the order/account behavior level, not just individual transactions.
It combines ML with relationship/graph analysis.
AI is meaningfully used as an investigator.
The AI produces evidence rather than unsupported accusations.
Precision and recall are measured on a held-out test set.
False-positive cost is reported.
There is a clear failure/edge-case demonstration.
There is an audit trail.
Important actions remain human-gated.
The product works end-to-end.
The UI looks polished enough for a hackathon demo.
The system does not fabricate data, metrics, or Razorpay capabilities.
Most important instruction
Build the product, not just the concept.
Start by inspecting the development environment and existing files, then create the project structure and implement the MVP incrementally. Before adding unnecessary complexity, prioritize getting the complete end-to-end flow working:
synthetic data → risk model → suspicious cluster → AI investigation → evidence report → dashboard → metrics → failure case.