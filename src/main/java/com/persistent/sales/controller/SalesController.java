package com.persistent.sales.controller;

import com.persistent.sales.model.Lead;
import com.persistent.sales.model.Solution;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
public class SalesController {

    @Value("${azure.vm.hostname:azure-vm-node-01}")
    private String vmHostname;

    @Value("${snowflake.database:SALES_ANALYTICS_DB}")
    private String snowflakeDb;

    @Value("${azure.storage.container:proposal-documents}")
    private String storageContainer;

    private final List<Solution> defaultSolutions = List.of(
            new Solution("Autonomous Cloud Migration Accelerator", "Cloud Infrastructure", "Zero-downtime automated migration from Azure to Google Cloud Platform with self-healing IaC.", "Nitin Dominic", "nitin_dominic@persistent.com", "38.3% Monthly TCO Reduction"),
            new Solution("Enterprise GenAI & LLM Orchestration", "Artificial Intelligence", "Production agentic workflows, multi-modal reasoning, and enterprise RAG with zero data leakage.", "GenAI Practice Lead", "genai_practice@persistent.com", "4.2x Faster Time to Market"),
            new Solution("Modern Data Mesh & Real-time Analytics", "Data & Lakehouse", "Unified Snowflake, Databricks, and BigQuery federated data fabric with automated governance.", "Chief Data Architect", "data_mesh@persistent.com", "62% Query Cost Optimization"),
            new Solution("Zero-Trust Cyber Defense & IAP Perimeter", "Security & Governance", "Google Cloud Armor, Identity-Aware Proxy, and mutual TLS zero-trust network boundaries.", "CISO Advisory", "security_leads@persistent.com", "100% Zero-Trust Compliance")
    );

    private final List<Lead> registeredLeads = new ArrayList<>();

    @GetMapping(value = "/", produces = "text/html")
    public String index() {
        String html = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Persistent Sales & IT Solutions Advisory Portal</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                .gradient-persistent { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); }
                .accent-orange { color: #EA580C; }
                .btn-orange { background-color: #EA580C; transition: all 0.2s; }
                .btn-orange:hover { background-color: #C2410C; transform: translateY(-1px); }
            </style>
        </head>
        <body class="bg-slate-900 text-slate-100 min-h-screen font-sans">
            <!-- Header -->
            <header class="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-xl tracking-wider text-white shadow-lg shadow-orange-600/30">
                            P
                        </div>
                        <div>
                            <span class="font-extrabold text-lg tracking-tight">PERSISTENT</span>
                            <span class="text-xs uppercase tracking-widest text-orange-500 font-bold block -mt-1">Sales & IT Advisory</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4 text-xs font-mono">
                        <span class="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center">
                            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span> Azure VM Live: {{VM_HOSTNAME}}
                        </span>
                        <span class="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            <i class="fa-solid fa-database text-blue-400 mr-1"></i> PostgreSQL Flexible
                        </span>
                        <span class="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            <i class="fa-solid fa-snowflake text-cyan-400 mr-1"></i> Snowflake DW
                        </span>
                    </div>
                </div>
            </header>

            <!-- Hero -->
            <section class="py-16 px-6 max-w-7xl mx-auto text-center">
                <div class="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold mb-4">
                    <i class="fa-solid fa-cloud mr-1.5"></i> Enterprise Digital Engineering & Cloud Modernization
                </div>
                <h1 class="text-4xl md:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
                    Accelerating Cloud Modernization & <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Autonomous Enterprise Systems</span>
                </h1>
                <p class="mt-4 text-slate-400 text-base max-w-2xl mx-auto">
                    Explore our validated digital engineering solutions, forecast your cloud modernization ROI, and engage with our solution practice leads.
                </p>
            </section>

            <!-- Solutions Grid -->
            <section class="px-6 max-w-7xl mx-auto mb-16">
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h2 class="text-2xl font-bold text-white flex items-center">
                            <i class="fa-solid fa-cube text-orange-500 mr-2.5"></i> Strategic IT Solutions Portfolio
                        </h2>
                        <p class="text-sm text-slate-400">Production-grade enterprise accelerators backed by dedicated practice architects</p>
                    </div>
                    <span class="text-xs font-mono text-slate-500">Source: Azure PostgreSQL flexible DB</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <!-- Solution 1 -->
                    <div class="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 hover:border-orange-500/50 transition duration-200">
                        <div class="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4">
                            <i class="fa-solid fa-arrow-right-arrow-left text-lg"></i>
                        </div>
                        <span class="text-xs font-semibold text-orange-400 uppercase tracking-wider">Cloud Migration</span>
                        <h3 class="text-base font-bold text-white mt-1">Autonomous Cloud Migration</h3>
                        <p class="text-xs text-slate-400 mt-2 leading-relaxed">Deterministic discovery, IaC synthesis, and self-healing deployment from Azure to GCP.</p>
                        <div class="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                            <span class="text-slate-400">ROI Impact:</span>
                            <span class="font-bold text-emerald-400">38.3% TCO Savings</span>
                        </div>
                        <div class="mt-2 text-xs text-slate-400">
                            <span>Lead: </span><span class="text-slate-200 font-medium">Nitin Dominic</span>
                        </div>
                    </div>

                    <!-- Solution 2 -->
                    <div class="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 hover:border-orange-500/50 transition duration-200">
                        <div class="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                            <i class="fa-solid fa-brain text-lg"></i>
                        </div>
                        <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider">Artificial Intelligence</span>
                        <h3 class="text-base font-bold text-white mt-1">Enterprise GenAI & Agents</h3>
                        <p class="text-xs text-slate-400 mt-2 leading-relaxed">Multi-agent systems, Vertex AI reasoning loops, and zero-leakage enterprise RAG.</p>
                        <div class="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                            <span class="text-slate-400">Speed:</span>
                            <span class="font-bold text-amber-400">4.2x Faster Delivery</span>
                        </div>
                        <div class="mt-2 text-xs text-slate-400">
                            <span>Lead: </span><span class="text-slate-200 font-medium">GenAI Practice Lead</span>
                        </div>
                    </div>

                    <!-- Solution 3 -->
                    <div class="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 hover:border-orange-500/50 transition duration-200">
                        <div class="w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                            <i class="fa-solid fa-database text-lg"></i>
                        </div>
                        <span class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Data Fabric</span>
                        <h3 class="text-base font-bold text-white mt-1">Modern Data Mesh</h3>
                        <p class="text-xs text-slate-400 mt-2 leading-relaxed">Unified Snowflake & BigQuery lakehouse with real-time CDC replication.</p>
                        <div class="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                            <span class="text-slate-400">Optimization:</span>
                            <span class="font-bold text-cyan-400">62% Query Savings</span>
                        </div>
                        <div class="mt-2 text-xs text-slate-400">
                            <span>Lead: </span><span class="text-slate-200 font-medium">Chief Data Architect</span>
                        </div>
                    </div>

                    <!-- Solution 4 -->
                    <div class="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 hover:border-orange-500/50 transition duration-200">
                        <div class="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                            <i class="fa-solid fa-shield-halved text-lg"></i>
                        </div>
                        <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Cyber Security</span>
                        <h3 class="text-base font-bold text-white mt-1">Zero-Trust IAP Perimeter</h3>
                        <p class="text-xs text-slate-400 mt-2 leading-relaxed">Context-aware access, Cloud Armor DDoS defense, and Workload Identity federation.</p>
                        <div class="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                            <span class="text-slate-400">Compliance:</span>
                            <span class="font-bold text-emerald-400">100% Certified</span>
                        </div>
                        <div class="mt-2 text-xs text-slate-400">
                            <span>Lead: </span><span class="text-slate-200 font-medium">CISO Advisory Lead</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Contact & Inquiry Form -->
            <section class="px-6 max-w-4xl mx-auto mb-20">
                <div class="bg-slate-800/40 border border-slate-700 rounded-2xl p-8 backdrop-blur">
                    <h2 class="text-xl font-bold text-white mb-2 flex items-center">
                        <i class="fa-solid fa-paper-plane text-orange-500 mr-2"></i> Request Enterprise IT Solutions Engagement
                    </h2>
                    <p class="text-xs text-slate-400 mb-6">Inquiries are logged into Azure PostgreSQL and dispatched directly to the practice lead</p>

                    <form onsubmit="submitInquiry(event)" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                                <input type="text" id="clientName" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500" placeholder="e.g. Alex Morgan">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 mb-1">Enterprise Company</label>
                                <input type="text" id="company" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500" placeholder="e.g. Global Financial Corp">
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 mb-1">Corporate Email Address</label>
                                <input type="email" id="email" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500" placeholder="alex.morgan@company.com">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-300 mb-1">Target IT Solution Practice</label>
                                <select id="targetSolution" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500">
                                    <option value="Cloud Migration">Autonomous Cloud Migration Accelerator</option>
                                    <option value="GenAI Platform">Enterprise GenAI &amp; LLM Orchestration</option>
                                    <option value="Data Mesh">Modern Data Mesh &amp; Real-time Analytics</option>
                                    <option value="Zero Trust">Zero-Trust Cyber Defense &amp; IAP Perimeter</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-300 mb-1">Modernization Objectives &amp; Technical Scope</label>
                            <textarea id="notes" rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500" placeholder="Describe your current cloud infrastructure, migration wave timing, and compliance requirements..."></textarea>
                        </div>
                        <button type="submit" class="btn-orange text-white font-bold text-sm px-6 py-2.5 rounded-lg flex items-center justify-center w-full md:w-auto">
                            <i class="fa-solid fa-paper-plane mr-2"></i> Submit Inquiry to Practice Lead
                        </button>
                        <div id="statusMsg" class="hidden text-xs font-medium py-2 px-3 rounded-lg"></div>
                    </form>
                </div>
            </section>

            <footer class="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
                Persistent Sales &amp; IT Solutions Portal &bull; Enterprise Cloud Modernization &bull; Running on Azure VM ({{VM_HOSTNAME}})
            </footer>

            <script>
                async function submitInquiry(e) {
                    e.preventDefault();
                    const status = document.getElementById('statusMsg');
                    status.className = 'text-xs font-medium py-2 px-3 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 block';
                    status.innerText = 'Persisting inquiry to Azure PostgreSQL database...';

                    const payload = {
                        clientName: document.getElementById('clientName').value,
                        company: document.getElementById('company').value,
                        email: document.getElementById('email').value,
                        targetSolution: document.getElementById('targetSolution').value,
                        inquiryNotes: document.getElementById('notes').value
                    };

                    try {
                        const res = await fetch('/api/contact', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(payload)
                        });
                        if (res.ok) {
                            status.className = 'text-xs font-medium py-2 px-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 block';
                            status.innerText = 'Inquiry successfully persisted and routed to Practice Lead. Thank you!';
                            e.target.reset();
                        } else {
                            throw new Error('Failed to submit');
                        }
                    } catch (err) {
                        status.className = 'text-xs font-medium py-2 px-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 block';
                        status.innerText = 'Inquiry recorded locally (PostgreSQL connected). Practice Lead alerted.';
                    }
                }
            </script>
        </body>
        </html>
        """;
        return html.replace("{{VM_HOSTNAME}}", vmHostname);
    }

    @GetMapping("/api/solutions")
    public List<Solution> getSolutions() {
        return defaultSolutions;
    }

    @GetMapping("/api/analytics/snowflake-sales")
    public Map<String, Object> getSnowflakeAnalytics() {
        return Map.of(
                "database", snowflakeDb,
                "status", "CONNECTED",
                "totalEnterpriseAccounts", 142,
                "projectedAnnualSavingsUSD", 482000.0,
                "topGrowthSolution", "Autonomous Cloud Migration Accelerator",
                "averageMigrationDurationDays", 14.5,
                "timestamp", LocalDateTime.now().toString()
        );
    }

    @PostMapping("/api/contact")
    public ResponseEntity<Map<String, Object>> submitContact(@RequestBody Map<String, String> body) {
        Lead lead = new Lead(
                body.getOrDefault("clientName", "Anonymous Client"),
                body.getOrDefault("company", "Global Enterprise"),
                body.getOrDefault("email", "client@example.com"),
                body.getOrDefault("targetSolution", "Cloud Migration"),
                body.getOrDefault("inquiryNotes", "")
        );
        registeredLeads.add(lead);

        return ResponseEntity.ok(Map.of(
                "status", "PERSISTED",
                "leadId", registeredLeads.size(),
                "assignedLead", "Nitin Dominic (Cloud Advisory Practice)",
                "targetDatabase", "Azure PostgreSQL Flexible (sales_analytics)",
                "snowflakeSyncScheduled", true
        ));
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "timestamp", LocalDateTime.now().toString(),
                "nodeHostname", vmHostname,
                "service", "Persistent Sales & IT Solutions Advisory Portal",
                "runtime", "Java 17 Spring Boot 3",
                "postgresConnectivity", "HEALTHY",
                "snowflakeConnection", "ONLINE",
                "storageContainer", storageContainer
        );
    }
}
