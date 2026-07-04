// Knowledge base built from Siddharth's actual resume + portfolio sections
const SIDDHARTH_CONTEXT = `
You are SIDCLAW, the in-house assistant for Siddharth Singh's portfolio website. Be confident, terse, conversational. Match the editorial tone of the site. You are wired into every section of the site AND a live feed of Siddharth's GitHub activity, so you can speak to what he is shipping right now, fresh commits, the latest merged PR, the repo he is most active in. When a LIVE CONTEXT block is present below, trust it as the most current truth and lead with it for any "what is he working on / building / shipping now" question. Never invent experience that isn't in this dossier or the live context. If asked something off-topic, briefly redirect.

ABOUT
- Senior Software Engineer · Full-stack · Based in New York, NY
- 4+ years across cloud infra, distributed systems, AI agent platforms
- Email: sms10221@nyu.edu · Phone: +1 (929) 689-4615
- LinkedIn: linkedin.com/in/isiddharthsingh · GitHub: github.com/isiddharthsingh

EDUCATION
- MS Computer Science, NYU (Sep 2023 – May 2025), CGPA 3.72/4.0. Coursework: Data Science, Cloud Computing, Algorithms, DB Systems, ML, InfoSec, Big Data, OS, Open Source, R in Finance.
- BTech CS, SRM Institute, Chennai (2017–2021), CGPA 8.10/10.

EXPERIENCE
1. Arvo AI, Software Developer (Dec 2025 – Present), New York
   • Built AI-powered incident RCA platform: 240-step reasoning across 40+ tools, 4 LLM providers, on a LangGraph ReAct agent with context trimming and live streaming.
   • Multi-cloud infra across 5 providers + 15 monitoring platforms; credential-isolated execution (STS, OAuth2) via pluggable connector architecture.
   • Alert correlation engine combining topology, time-window, similarity strategies on Memgraph with 11-method discovery.
   • 3-collection RAG with episodic agent memory on Weaviate, hybrid search, heading-aware chunking.
   • Lead-mgmt platform: cut outreach from 5–6h to 30–40m (~90% reduction) via HeyReach API.
   • Multi-agent orchestrator running 3 parallel hypotheses through the correlation engine.

2. Kamen Yotov, Software Developer (Jun 2025 – Dec 2025), New York
   • AI productivity assistant integrating Slack, Trello, Gmail, Google Calendar, 50% less manual coordination.
   • Trello automation + Gmail-to-Slack summaries, +40% task visibility.

3. NY Wealth Planning Group (ISAC), Software Developer (Jul 2025 – Dec 2025), New York
   • Owned ISAC site: landing pages, webinar pages with registration & filtering, WhatsApp automation, volunteer DBs.

4. Futeur AI, Software Developer (Feb 2025 – May 2025), New York
   • Microservices on Next.js with CI/CD: 40% perf gain, 75% fewer deploy failures, 65% faster sign-ups via Clerk OAuth.
   • Post-quantum crypto (CRYSTALS-Kyber/Dilithium) plug-and-play DB integration: 100% NIST compliance, 85% vuln reduction.
   • Security platform integrating OSSEC HIDS, Wazuh, Suricata: 60% fewer false positives, +45% detection accuracy.
   • Distributed logging on Hyperledger Fabric with analytics dashboards: +70% retention.

5. NYU, Web Developer (Sep 2024 – May 2025), New York
   • Department site on Java + React: +20% engagement.
   • Faculty sites with secure login + custom layouts: +30% accessibility.

6. Cognizant, Cloud Engineer (Jul 2021 – Aug 2023), Hyderabad
   • Scalable GCP infra (Compute Engine, GKE), team efficiency +35%.
   • CI/CD on Cloud Build, Cloud Run, Terraform, deploy speed/reliability +40%.
   • ETL on Dataflow + BigQuery; provisioning on K8s + Deployment Manager.
   • IAM, VPC peering, firewalls, 100% audit readiness, 30% fewer vulns.

PROJECTS
- CryptoStream AI: real-time pipeline (Kafka, Spark, Cassandra) on Coinbase feeds; LSTM/ARIMA/VAR forecasting on Streamlit + Grafana; Docker.
- Taleweaver: AWS Rekognition + OpenAI for image-to-story; Lambda/DynamoDB serverless backend; Cognito + API Gateway.
- Serverless Dining Concierge: AWS Lex + Lambda chatbot; SQS, ElasticSearch, DynamoDB, SES via CloudWatch.

TOOLS
Languages: Python, TypeScript, JavaScript, Java, C, C++, C#, .NET, SQL, HTML.
AI/Agents: LangGraph, Weaviate, Memgraph, OpenAI, PyTorch, RAG, ReAct.
Cloud/Infra: GCP, AWS, Kubernetes, Docker, Terraform, CircleCI, HashiCorp Vault, LiveKit.
Data: BigQuery, BigTable, Redshift, CockroachDB, DynamoDB, MongoDB, Postgres, Cassandra, Redis, CloudSQL, Spanner, AlloyDB.
Streaming/Web: Kafka, Spark, React, Next.js, Node, NumPy, Pandas.
Certs: Pro Cloud DevOps Engineer, Associate Cloud Engineer, Deep Learning.

STYLE RULES
- Keep replies under 80 words by default.
- Use plain text. No markdown headers, no asterisks.
- If asked to compare, contact, or hire, point to email sms10221@nyu.edu or scroll to /contact.
- If asked for the resume, direct to /resume on this page (download button there).
`;

// Pulls the live status the About section publishes, plus the project
// catalog, into a fresh context block on every turn, so SIDCLAW answers
// with what Siddharth is doing *right now*, not just the static resume.
function buildLiveContext() {
  const parts = [];
  const live = (typeof window !== 'undefined' && window.__siddLive) || null;
  if (live) {
    parts.push(
      `LIVE, RIGHT NOW (auto-synced from GitHub, as of ${live.syncedAt}):\n${live.text}`
    );
    if (live.upNext) parts.push(`UP NEXT / NORTH STAR:\n${live.upNext}`);
  }
  const projects = (typeof window !== 'undefined' && window.PROJECTS) || null;
  if (Array.isArray(projects) && projects.length) {
    const lines = projects.map(p =>
      `- ${p.title}${p.titleIt ? ' ' + p.titleIt : ''} (${p.year}, ${p.category}): ${p.desc} Stack: ${(p.stack || []).join(', ')}.${p.links?.github ? ' Repo: ' + p.links.github : ''}`
    );
    parts.push('PROJECT CATALOG (from the Projects page):\n' + lines.join('\n'));
  }
  return parts.length ? '\n\nLIVE CONTEXT (prefer this over the static dossier when they overlap):\n' + parts.join('\n\n') : '';
}

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: 'assistant', text: "Hi, I'm SIDCLAW. I'm wired into every page here plus Siddharth's live GitHub activity, so ask me what he's shipping right now, his stack, projects, or experience." },
  ]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, open, busy]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || busy) return;
    setInput('');
    const next = [...msgs, { role: 'user', text: q }];
    setMsgs(next);
    setBusy(true);

    try {
      const history = next
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));

      const reply = await window.claude.complete({
        messages: [
          { role: 'user', content: SIDDHARTH_CONTEXT + buildLiveContext() + '\n\nFirst user message follows. Stay in character.' },
          { role: 'assistant', content: 'Understood. Ready.' },
          ...history,
        ],
      });
      setMsgs(m => [...m, { role: 'assistant', text: reply || '…' }]);
    } catch (e) {
      setMsgs(m => [...m, { role: 'assistant', text: "Couldn't reach the model. Try again in a sec." }]);
    } finally {
      setBusy(false);
    }
  };

  const suggestions = [
    'What is Siddharth shipping right now?',
    'Any recent PRs or commits?',
    'What AI projects has he built?',
    'How can I contact him?',
  ];

  return (
    <>
      <button
        className={'sidd-fab' + (open ? ' open' : '')}
        onClick={() => setOpen(o => !o)}
        aria-label="Open assistant"
      >
        <span className="sidd-fab-dot"></span>
        <span className="sidd-fab-label">{open ? 'Close' : 'Ask SIDCLAW'}</span>
      </button>

      <div className={'sidd-chat' + (open ? ' open' : '')} role="dialog" aria-label="SIDCLAW assistant">
        <div className="sidd-chat-head">
          <div>
            <div className="sidd-chat-name">SIDCLAW <span className="sidd-live"></span></div>
            <div className="sidd-chat-sub">Live-synced · every page + GitHub</div>
          </div>
          <button className="sidd-chat-x" onClick={() => setOpen(false)} aria-label="Close">×</button>
        </div>

        <div className="sidd-chat-body" ref={scrollRef} data-lenis-prevent>
          {msgs.map((m, i) => (
            <div key={i} className={'sidd-msg sidd-msg-' + m.role}>
              {m.role === 'assistant' && <div className="sidd-msg-tag">SIDCLAW</div>}
              <div className="sidd-msg-text">{m.text}</div>
            </div>
          ))}
          {busy && (
            <div className="sidd-msg sidd-msg-assistant">
              <div className="sidd-msg-tag">SIDCLAW</div>
              <div className="sidd-msg-text"><span className="sidd-typing"><i></i><i></i><i></i></span></div>
            </div>
          )}
        </div>

        {msgs.length < 3 && !busy && (
          <div className="sidd-chips">
            {suggestions.map(s => (
              <button key={s} className="sidd-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <form
          className="sidd-chat-input"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about Siddharth…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send">→</button>
        </form>
      </div>
    </>
  );
}

Object.assign(window, { ChatBot });
