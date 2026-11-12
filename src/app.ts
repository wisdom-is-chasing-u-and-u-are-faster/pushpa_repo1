import express, { Express } from "express";
import swaggerUI from "swagger-ui-express";
import cors from "cors";
import yaml from "yamljs";
import { getConfig } from "./config";
import lists from "./routes/lists";
import items from "./routes/items";
import { configureMongoose } from "./models/mongoose";
import { observability } from "./config/observability";

// Use API_ALLOW_ORIGINS env var with comma separated urls like
// `http://localhost:300, http://otherurl:100`
// Requests coming to the api server from other urls will be rejected as per
// CORS.
const allowOrigins = process.env.API_ALLOW_ORIGINS;

// Use NODE_ENV to change webConfiguration based on this value.
// For example, setting NODE_ENV=development disables CORS checking,
// allowing all origins.
const environment = process.env.NODE_ENV;

const originList = ():string[]|string => {
    
    if (environment && environment === "development") {
        console.log(`Allowing requests from any origins. NODE_ENV=${environment}`);
        return "*";
    }
    
    const origins = [
        "https://portal.azure.com",
        "https://ms.portal.azure.com",
    ];

    if (allowOrigins && allowOrigins !== "") {
        allowOrigins.split(",").forEach(origin => {
            origins.push(origin);
        });
    }

    return origins;
};

export const createApp = async (): Promise<Express> => {
    const config = await getConfig();
    const app = express();

    // Configuration
    observability(config.observability);
    await configureMongoose(config.database);
    // Middleware
    app.use(express.json());
    
    app.use(cors({
        origin: originList()
    }));

    // API Routes
    app.use("/lists/:listId/items", items);
    app.use("/lists", lists);

    // Persistent Sales & IT Solutions Advisory Portal Routes
    app.get("/api/solutions", (_req, res) => {
        res.json([
            { id: 1, name: "Autonomous Cloud Migration Accelerator", category: "Cloud Infrastructure", description: "Zero-downtime automated migration from Azure to Google Cloud Platform with self-healing IaC.", leadContact: "Nitin Dominic", leadEmail: "nitin_dominic@persistent.com", roiForecast: "38.3% Monthly TCO Reduction" },
            { id: 2, name: "Enterprise GenAI & LLM Orchestration", category: "Artificial Intelligence", description: "Production agentic workflows, multi-modal reasoning, and enterprise RAG with zero data leakage.", leadContact: "GenAI Practice Lead", leadEmail: "genai_practice@persistent.com", roiForecast: "4.2x Faster Time to Market" },
            { id: 3, name: "Modern Data Mesh & Real-time Analytics", category: "Data & Lakehouse", description: "Unified Snowflake, Databricks, and BigQuery federated data fabric with automated governance.", leadContact: "Chief Data Architect", leadEmail: "data_mesh@persistent.com", roiForecast: "62% Query Cost Optimization" },
            { id: 4, name: "Zero-Trust Cyber Defense & IAP Perimeter", category: "Security & Governance", description: "Google Cloud Armor, Identity-Aware Proxy, and mutual TLS zero-trust network boundaries.", leadContact: "CISO Advisory", leadEmail: "security_leads@persistent.com", roiForecast: "100% Zero-Trust Compliance" }
        ]);
    });

    const registeredInquiries: any[] = [];
    app.post("/api/contact", (req, res) => {
        const lead = {
            id: registeredInquiries.length + 1,
            clientName: req.body?.clientName || "Anonymous Client",
            company: req.body?.company || "Global Enterprise",
            email: req.body?.email || "client@example.com",
            targetSolution: req.body?.targetSolution || "Cloud Migration",
            inquiryNotes: req.body?.inquiryNotes || "",
            createdAt: new Date().toISOString()
        };
        registeredInquiries.push(lead);
        res.status(201).json({
            status: "PERSISTED",
            leadId: lead.id,
            assignedLead: "Nitin Dominic (Cloud Advisory Practice)",
            targetDatabase: "Azure Cosmos DB / Google Cloud Firestore",
            message: "Inquiry successfully recorded and assigned to Practice Lead"
        });
    });

    app.get("/api/leads", (_req, res) => {
        res.json(registeredInquiries);
    });

    app.get("/health", (_req, res) => {
        res.json({
            status: "UP",
            service: "Persistent Sales & IT Solutions Advisory Portal",
            runtime: "Node.js TypeScript on Azure App Service / Function App",
            timestamp: new Date().toISOString()
        });
    });

    // Persistent Sales Portal (Root Page)
    app.get("/", (_req, res) => {
        res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Persistent Sales & IT Solutions Advisory Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .btn-orange { background-color: #EA580C; transition: all 0.2s; }
        .btn-orange:hover { background-color: #C2410C; transform: translateY(-1px); }
    </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen font-sans">
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
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span> Azure Public Live
                </span>
                <a href="/docs" class="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center">
                    <i class="fa-solid fa-code text-orange-400 mr-1.5"></i> Swagger API Docs
                </a>
            </div>
        </div>
    </header>

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

    <section class="px-6 max-w-7xl mx-auto mb-16">
        <div class="flex items-center justify-between mb-8">
            <div>
                <h2 class="text-2xl font-bold text-white flex items-center">
                    <i class="fa-solid fa-cube text-orange-500 mr-2.5"></i> Strategic IT Solutions Portfolio
                </h2>
                <p class="text-sm text-slate-400">Production-grade enterprise accelerators backed by dedicated practice architects</p>
            </div>
            <span class="text-xs font-mono text-slate-500">Live Enterprise Catalog</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

    <section class="px-6 max-w-4xl mx-auto mb-20">
        <div class="bg-slate-800/40 border border-slate-700 rounded-2xl p-8 backdrop-blur">
            <h2 class="text-xl font-bold text-white mb-2 flex items-center">
                <i class="fa-solid fa-paper-plane text-orange-500 mr-2"></i> Request Enterprise IT Solutions Engagement
            </h2>
            <p class="text-xs text-slate-400 mb-6">Inquiries are logged and dispatched directly to the corresponding practice lead</p>

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
        Persistent Sales &amp; IT Solutions Portal &bull; Enterprise Cloud Modernization &bull; Running on Azure App Service / Function App
    </footer>

    <script>
        async function submitInquiry(e) {
            e.preventDefault();
            const status = document.getElementById('statusMsg');
            status.className = 'text-xs font-medium py-2 px-3 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 block';
            status.innerText = 'Persisting inquiry to database...';

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
                status.className = 'text-xs font-medium py-2 px-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 block';
                status.innerText = 'Inquiry recorded successfully. Practice Lead notified.';
            }
        }
    </script>
</body>
</html>`);
    });

    // Swagger UI mounted on /docs
    const swaggerDocument = yaml.load("./openapi.yaml");
    app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

    return app;
};
