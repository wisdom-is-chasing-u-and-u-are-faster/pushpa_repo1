// server.js — Persistent Sales & IT Solutions Advisory Portal
// Lightweight, container-native microservice ready for Azure Function/App Service & Google Cloud Run.
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = parseInt(process.env.PORT || process.env.WEBSITES_PORT || process.env.FUNCTIONS_CUSTOMHANDLER_PORT || '8080', 10);
const host = '0.0.0.0';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Detect Cloud Platform
const isGcp = Boolean(
  process.env.K_SERVICE || 
  process.env.K_REVISION || 
  process.env.GCP_PROJECT || 
  process.env.GOOGLE_CLOUD_PROJECT
);

// Database Connection Management
let mongoClient = null;
let db = null;
let leadsCollection = null;
let dbConnected = false;
let dbError = null;

const dbUri = process.env.MONGODB_URI || 
              process.env.AZURE_COSMOS_CONNECTION_STRING || 
              process.env.DATABASE_URL || 
              '';

const DB_NAME = process.env.AZURE_COSMOS_DATABASE_NAME || 'PersistentSalesDB';
const COLLECTION_NAME = 'SalesLeads';

// In-Memory resilient fallback store
let inMemoryLeads = [
  {
    id: 1,
    clientName: "Global FinTech Enterprise",
    company: "Apex Financial Group",
    email: "cto@apexfinancial.example.com",
    targetSolution: "Autonomous Cloud Migration Accelerator",
    inquiryNotes: "Migrating high-throughput transactional database and workloads from Azure to Google Cloud Run and Cloud SQL.",
    assignedLead: "Nitin Dominic (Cloud Advisory Practice)",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    clientName: "Healthcare AI Solutions",
    company: "OmniHealth Labs",
    email: "engineering@omnihealth.example.com",
    targetSolution: "Enterprise GenAI & LLM Orchestration",
    inquiryNotes: "Enterprise multi-agent reasoning system on Vertex AI with zero data leakage guarantees.",
    assignedLead: "GenAI Practice Lead",
    createdAt: new Date().toISOString()
  }
];

async function initDatabase() {
  if (!dbUri || dbUri.startsWith('@Microsoft.KeyVault')) {
    console.log('[Database] No direct MongoDB connection string supplied or KeyVault reference unresolved. Operating in Resilient In-Memory Mode.');
    return;
  }

  try {
    console.log(`[Database] Connecting to MongoDB / Cosmos DB (${DB_NAME})...`);
    let activeUri = dbUri.replace(/([?&])replicaSet=[^&]*(&|$)/, '$1').replace(/[?&]$/, '');
    const clientOptions = {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    };
    if (activeUri.includes('cosmos.azure.com') || activeUri.includes('documents.azure.com')) {
      clientOptions.tls = true;
      clientOptions.directConnection = true;
    }
    mongoClient = new MongoClient(activeUri, clientOptions);
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);
    leadsCollection = db.collection(COLLECTION_NAME);
    dbConnected = true;
    dbError = null;
    console.log(`[Database] Successfully connected to database: ${DB_NAME}`);
  } catch (err) {
    dbConnected = false;
    dbError = err.message;
    console.warn(`[Database] Connection warning: ${err.message}. Gracefully falling back to Resilient In-Memory Mode.`);
  }
}

// Strategic IT Solutions Catalog
const solutionsCatalog = [
  {
    id: 1,
    name: "Autonomous Cloud Migration Accelerator",
    category: "Cloud Infrastructure",
    description: "Zero-downtime automated migration from Azure to Google Cloud Platform with self-healing IaC.",
    leadContact: "Nitin Dominic",
    leadEmail: "nitin_dominic@persistent.com",
    roiForecast: "38.3% Monthly TCO Reduction",
    targetRuntime: "Google Cloud Run"
  },
  {
    id: 2,
    name: "Enterprise GenAI & LLM Orchestration",
    category: "Artificial Intelligence",
    description: "Production agentic workflows, multi-modal reasoning, and enterprise RAG with zero data leakage.",
    leadContact: "GenAI Practice Lead",
    leadEmail: "genai_practice@persistent.com",
    roiForecast: "4.2x Faster Time to Market",
    targetRuntime: "Vertex AI + Cloud Run"
  },
  {
    id: 3,
    name: "Modern Data Mesh & Real-time Analytics",
    category: "Data & Lakehouse",
    description: "Unified Snowflake, Databricks, and BigQuery federated data fabric with automated governance.",
    leadContact: "Chief Data Architect",
    leadEmail: "data_mesh@persistent.com",
    roiForecast: "62% Query Cost Optimization",
    targetRuntime: "BigQuery / Dataflow"
  },
  {
    id: 4,
    name: "Zero-Trust Cyber Defense & IAP Perimeter",
    category: "Security & Governance",
    description: "Google Cloud Armor, Identity-Aware Proxy, and mutual TLS zero-trust network boundaries.",
    leadContact: "CISO Advisory",
    leadEmail: "security_leads@persistent.com",
    roiForecast: "100% Zero-Trust Compliance",
    targetRuntime: "Cloud Armor + IAP"
  }
];

// Health Check Endpoints (Crucial for Cloud Run startup/readiness probes & Azure ping)
app.get(['/health', '/healthz'], (_req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'Persistent Sales & IT Solutions Advisory Portal',
    cloud_runtime: isGcp ? 'Google Cloud Run' : 'Azure App Service / Function',
    port: port,
    database_status: dbConnected ? 'CONNECTED' : 'IN_MEMORY_FALLBACK',
    timestamp: new Date().toISOString()
  });
});

// Solutions API
app.get('/api/solutions', (_req, res) => {
  res.json(solutionsCatalog);
});

// Leads API (GET)
app.get('/api/leads', async (_req, res) => {
  try {
    if (dbConnected && leadsCollection) {
      const docs = await leadsCollection.find({}, { projection: { _id: 0 } }).limit(50).toArray();
      if (docs && docs.length > 0) {
        docs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return res.json(docs);
      }
    }
  } catch (err) {
    console.error('Error fetching leads from DB:', err.message);
  }
  return res.json(inMemoryLeads);
});

// Contact / Submit Lead API (POST)
app.post(['/api/contact', '/api/leads'], async (req, res) => {
  const newLead = {
    id: Date.now(),
    clientName: req.body?.clientName || 'Anonymous Client',
    company: req.body?.company || 'Global Enterprise',
    email: req.body?.email || 'client@example.com',
    targetSolution: req.body?.targetSolution || 'Autonomous Cloud Migration Accelerator',
    inquiryNotes: req.body?.inquiryNotes || '',
    assignedLead: 'Nitin Dominic (Cloud Advisory Practice)',
    createdAt: new Date().toISOString()
  };

  let persisted = false;
  if (dbConnected && leadsCollection) {
    try {
      await leadsCollection.insertOne(newLead);
      persisted = true;
    } catch (err) {
      console.warn('Could not insert to DB, saving to in-memory fallback:', err.message);
    }
  }

  if (!persisted) {
    inMemoryLeads.unshift(newLead);
  }

  res.status(201).json({
    status: 'PERSISTED',
    leadId: newLead.id,
    persistedTo: persisted ? 'Azure Cosmos DB / Cloud Mongo' : 'Resilient In-Memory Cache',
    assignedLead: newLead.assignedLead,
    message: 'Advisory inquiry successfully recorded.'
  });
});

// System Info
app.get('/api/info', (_req, res) => {
  res.json({
    app: 'Persistent Sales Advisory Portal',
    version: '1.0.0',
    runtime: `Node.js ${process.version} (Lightweight Microservice)`,
    cloud_runtime: isGcp ? 'Google Cloud Run' : 'Azure App Service / Function',
    cloud_provider: isGcp ? 'GCP' : 'Azure',
    database: dbConnected ? 'Connected (Cosmos DB)' : 'In-Memory Resilient Cache',
    cloud_run_ready: true,
    port: port
  });
});

// HTML Portal Dashboard
app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Persistent — Sales & IT Solutions Advisory Portal</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        .btn-persistent { background: linear-gradient(135deg, #ea580c, #c2410c); transition: all 0.2s ease; }
        .btn-persistent:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35); }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans antialiased">
    <!-- Navigation Header -->
    <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-orange-600/30">
                    P
                </div>
                <div>
                    <span class="font-extrabold text-lg tracking-tight text-white">PERSISTENT</span>
                    <span class="text-[10px] uppercase tracking-widest text-orange-400 font-bold block -mt-1">Sales & IT Solutions Advisory</span>
                </div>
            </div>
            <div class="flex items-center space-x-3 text-xs font-mono">
                ${isGcp ? `
                <span class="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center">
                    <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse mr-2"></span>
                    <i class="fa-brands fa-google mr-1.5"></i> Google Cloud Run (Container)
                </span>
                ` : `
                <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
                    <i class="fa-brands fa-microsoft mr-1.5"></i> Azure Live App
                </span>
                `}
                <a href="/api/info" target="_blank" class="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center">
                    <i class="fa-solid fa-code text-orange-400 mr-1.5"></i> /api/info
                </a>
                <a href="/health" target="_blank" class="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center">
                    <i class="fa-solid fa-heart-pulse text-emerald-400 mr-1.5"></i> /health
                </a>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="py-14 px-6 max-w-7xl mx-auto text-center">
        <div class="inline-flex items-center px-3.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold mb-4">
            <i class="fa-solid fa-cloud-bolt mr-2"></i> Cloud Modernization & Autonomous Enterprise Migration
        </div>
        <h1 class="text-4xl md:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Persistent Advisory Portal & <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Cloud Run Ready Microservice</span>
        </h1>
        <p class="mt-4 text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Lightweight, high-performance Node.js service engineered to run seamlessly across Azure App Service, Azure Functions, and Google Cloud Run with zero architectural friction.
        </p>
    </section>

    <!-- Solutions Catalog Grid -->
    <section class="px-6 max-w-7xl mx-auto mb-14">
        <div class="flex items-center justify-between mb-6">
            <div>
                <h2 class="text-xl font-bold text-white flex items-center">
                    <i class="fa-solid fa-cubes text-orange-500 mr-2.5"></i> Strategic IT Solutions Portfolio
                </h2>
                <p class="text-xs text-slate-400 mt-1">Enterprise accelerators ready for rapid deployment and automated migration</p>
            </div>
            <span class="text-xs font-mono text-slate-500">Live Catalog</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="solutionsContainer">
            ${solutionsCatalog.map(s => `
            <div class="bg-slate-900/70 border border-slate-800 hover:border-orange-500/50 rounded-xl p-5 flex flex-col justify-between transition duration-200">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-[10px] font-bold text-orange-400 tracking-wider uppercase">${s.category}</span>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">${s.targetRuntime}</span>
                    </div>
                    <h3 class="text-sm font-bold text-white mb-1.5">${s.name}</h3>
                    <p class="text-xs text-slate-400 leading-relaxed">${s.description}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-800/80">
                    <div class="flex items-center justify-between text-xs mb-1">
                        <span class="text-slate-400 text-[11px]">ROI Impact:</span>
                        <span class="font-bold text-emerald-400 text-[11px]">${s.roiForecast}</span>
                    </div>
                    <div class="text-[11px] text-slate-400">
                        Lead: <span class="text-slate-200 font-medium">${s.leadContact}</span>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
    </section>

    <!-- Advisory Lead Capture & Live Registration -->
    <section class="px-6 max-w-7xl mx-auto mb-16">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Form -->
            <div class="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-white flex items-center mb-1">
                    <i class="fa-solid fa-paper-plane text-orange-500 mr-2"></i> Register Advisory Inquiry
                </h3>
                <p class="text-xs text-slate-400 mb-5">Submit an engagement lead. Records directly to Cosmos DB / Cloud Run store.</p>
                <form id="leadForm" class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Client Name</label>
                        <input type="text" id="clientName" required placeholder="e.g. John Doe" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Company / Enterprise</label>
                        <input type="text" id="company" required placeholder="e.g. Acme Financial" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                        <input type="email" id="email" required placeholder="j.doe@acme.com" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Target Solution</label>
                        <select id="targetSolution" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500">
                            ${solutionsCatalog.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-300 mb-1">Inquiry Notes</label>
                        <textarea id="inquiryNotes" rows="2" placeholder="Brief scope or timeline..." class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"></textarea>
                    </div>
                    <button type="submit" class="w-full py-2.5 rounded-lg btn-persistent text-white text-xs font-bold flex items-center justify-center">
                        <i class="fa-solid fa-check mr-2"></i> Submit Advisory Lead
                    </button>
                    <div id="formStatus" class="hidden text-xs text-center font-medium mt-2"></div>
                </form>
            </div>

            <!-- Live Inquiries List -->
            <div class="lg:col-span-7 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-bold text-white flex items-center">
                        <i class="fa-solid fa-list-check text-orange-500 mr-2"></i> Recent Advisory Leads
                    </h3>
                    <span class="text-[11px] font-mono text-slate-400" id="dbStatusBadge">
                        ${dbConnected ? 'Cosmos DB Connected' : 'In-Memory Resilient Store'}
                    </span>
                </div>
                <div class="space-y-3 overflow-y-auto max-h-[380px] pr-1" id="leadsList">
                    ${inMemoryLeads.map(l => `
                    <div class="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5">
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="text-xs font-bold text-white">${l.clientName} <span class="text-slate-400 font-normal">(${l.company})</span></span>
                            <span class="text-[10px] font-mono text-slate-500">${new Date(l.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div class="text-[11px] text-orange-400 font-medium mb-1">${l.targetSolution}</div>
                        <p class="text-[11px] text-slate-400 leading-snug">${l.inquiryNotes || 'No additional notes.'}</p>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-800/80 py-8 px-6 bg-slate-950 text-center text-xs text-slate-500">
        <p>Persistent Systems — Enterprise Autonomous Cloud Migration & Modernization Accelerator</p>
        <p class="mt-1 font-mono text-[11px] text-slate-600">Built for seamless zero-downtime transition from Azure Function to Google Cloud Run</p>
    </footer>

    <script>
        document.getElementById('leadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusEl = document.getElementById('formStatus');
            statusEl.className = 'text-xs text-center font-medium mt-2 text-amber-400 block';
            statusEl.innerText = 'Submitting lead...';

            const payload = {
                clientName: document.getElementById('clientName').value,
                company: document.getElementById('company').value,
                email: document.getElementById('email').value,
                targetSolution: document.getElementById('targetSolution').value,
                inquiryNotes: document.getElementById('inquiryNotes').value,
            };

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    statusEl.className = 'text-xs text-center font-medium mt-2 text-emerald-400 block';
                    statusEl.innerText = '✓ Lead recorded successfully!';
                    document.getElementById('leadForm').reset();
                    loadLeads();
                } else {
                    throw new Error('Failed to record');
                }
            } catch (err) {
                statusEl.className = 'text-xs text-center font-medium mt-2 text-red-400 block';
                statusEl.innerText = 'Error submitting lead: ' + err.message;
            }
        });

        async function loadLeads() {
            try {
                const res = await fetch('/api/leads');
                const leads = await res.json();
                const container = document.getElementById('leadsList');
                container.innerHTML = leads.map(l => \`
                    <div class="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5">
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="text-xs font-bold text-white">\${l.clientName} <span class="text-slate-400 font-normal">(\${l.company})</span></span>
                            <span class="text-[10px] font-mono text-slate-500">\${new Date(l.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div class="text-[11px] text-orange-400 font-medium mb-1">\${l.targetSolution}</div>
                        <p class="text-[11px] text-slate-400 leading-snug">\${l.inquiryNotes || 'No additional notes.'}</p>
                    </div>
                \`).join('');
            } catch (e) {}
        }
    </script>
</body>
</html>`);
});

// Graceful Shutdown for Cloud Run / Container Lifecycle
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing HTTP server and DB connections...');
  if (mongoClient) {
    try {
      await mongoClient.close();
    } catch (_) {}
  }
  process.exit(0);
});

// Start HTTP Server immediately (<10ms) so Azure / Cloud Run readiness probes succeed instantly
const server = app.listen(port, host, () => {
  console.log(`=======================================================`);
  console.log(` Persistent Sales Advisory Portal (Lightweight App)    `);
  console.log(` Listening on http://${host}:${port}                   `);
  console.log(` Cloud Platform: ${isGcp ? 'Google Cloud Run' : 'Azure App Service / Function'}`);
  console.log(` Cloud Run Ready: YES                                  `);
  console.log(`=======================================================`);
});

// Initialize database asynchronously in the background (non-blocking)
initDatabase().catch(err => {
  console.warn(`[Database] Background initialization notice: ${err.message}`);
});
