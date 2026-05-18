# **Project OmniWallet: Intelligence-Driven Personal Finance**

## **1\. Executive Summary**

**OmniWallet** is a high-performance, full-stack financial management ecosystem designed to move beyond passive expense tracking. It focuses on **Proactive Financial Intelligence**, allowing users to not only record the past but simulate the future. By contrasting fixed commitments against desired purchases and leveraging AI-driven analysis, OmniWallet provides a "Safe-to-Spend" clarity that standard banking apps lack.

## **2\. Core Purpose & Vision**

The primary goal is to eliminate financial "guesswork." Most users know their current balance but struggle to visualize their true liquidity after accounting for subscriptions, rent, and savings goals. OmniWallet bridges this gap by creating a digital twin of a user's financial life, categorized by wallets (origins) and refined by AI insights.

## **3\. Target Audience**

- **The Tech-Savvy Professional:** Users who manage multiple accounts, currencies, and investments and require a centralized, high-fidelity dashboard.
- **The Proactive Planner:** Individuals looking to save for specific goals while maintaining a lifestyle, needing a tool to calculate purchase viability.
- **The AI Enthusiast:** Users who want their data to work for them through predictive trends and automated anomaly detection.

## **4\. Key Pillars & Functional Features**

### **A. Dynamic Wallet Ecosystem**

- **Origin Management:** Create unlimited wallets representing physical cash, bank accounts, credit lines, or investment portfolios.
- **Multi-Currency Support:** Native support for global currencies with real-time exchange rate synchronization.
- **Custom Taxonomy:** Hierarchical categories and flexible tagging systems that the user can evolve over time.

### **B. Proactive Planning Engine (The "Differentiator")**

- **Fixed vs. Variable Contrast:** A specialized module that subtracts fixed "Vampire Expenses" (rent, subs) from total income to reveal real-time spending power.
- **Planned Purchase Module:** A simulation tool where users can add items (e.g., "New Laptop") to see how it impacts their budget across months or years.
- **Subscription Guardian:** Automated detection and tracking of recurring services to prevent forgotten charges.

### **C. Advanced Metrics & AI**

- **Temporal Reporting:** Generation of usage reports spanning months, quarters, semesters, and years.
- **AI Financial Coach:** An integrated LLM-powered agent that analyzes spending patterns, suggests budget cuts, and answers complex queries like _"Based on my last 6 months, can I afford a $2,000 trip in June?"_
- **Visual Dashboards:** High-density data visualizations including heatmaps, trend lines, and category donut charts.

## **5\. Technical Ecosystem**

Designed with a "Scale-First" mindset, utilizing modern paradigms that deviate from standard MERN stacks to ensure maximum performance and type safety.

- **Frontend (The Interface):** Built with **SvelteKit**. Utilizing a compiled approach (No Virtual DOM) for instantaneous UI responses, Tailwind CSS for a premium design, and Vitest/Playwright for a rigorous testing suite.
- **Backend (The Core):** Developed in **Go (Golang)**. Leverages high-concurrency patterns and a modular internal architecture to handle complex financial logic with sub-millisecond latency.
- **Persistence:** **PostgreSQL** serves as the relational backbone, ensuring ACID compliance—critical for financial transaction integrity.
- **Infrastructure:** Containerized via **Docker** and orchestrated on a private VPS using **Dokploy**, ensuring full ownership of sensitive financial data.

## **6\. Security & Privacy**

- **Privacy Mode:** A UI-level toggle to blur sensitive balances for use in public environments.
- **Local-First Mentality:** While cloud-synced, the architecture is designed to prioritize data privacy and encryption at rest.
- **Audit Logs:** Every balance change is tracked via a transaction history, ensuring no "missing cents."

## **7\. Future Impact**

OmniWallet aims to evolve into a fully autonomous financial advisor that can eventually predict market fluctuations or suggest better credit options, turning a simple "tracker" into a comprehensive "wealth management" platform.
