const TOOLS = [
  { cat: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'C', 'C++', 'C#', '.NET', 'SQL', 'HTML'] },
  { cat: 'AI & Agents', items: ['LangGraph', 'Weaviate', 'Memgraph', 'OpenAI', 'PyTorch', 'RAG', 'ReAct'] },
  { cat: 'Cloud & Infra', items: ['GCP', 'AWS', 'Kubernetes', 'Docker', 'Terraform', 'CircleCI', 'Vault', 'LiveKit'] },
  { cat: 'Data', items: ['BigQuery', 'BigTable', 'Redshift', 'CockroachDB', 'DynamoDB', 'MongoDB', 'Postgres', 'Cassandra', 'Redis', 'CloudSQL', 'Spanner', 'AlloyDB'] },
  { cat: 'Streaming & Web', items: ['Kafka', 'Spark', 'React', 'Next.js', 'Node', 'NumPy', 'Pandas'] },
  { cat: 'Certifications', items: ['Pro Cloud DevOps Engineer', 'Associate Cloud Engineer', 'Deep Learning'] },
];

function Tools() {
  const ref = useReveal();
  return (
    <section className="tools" id="tools" data-screen-label="Tools">
      <div className="section-marker"><span className="num">04</span> Toolkit</div>
      <div className="tools-head">
        <h2 className="reveal" ref={ref}>The <span className="it">workshop.</span></h2>
        <p className="lede">A working list of the languages, frameworks, and infrastructure that show up in production code.</p>
      </div>
      <div className="tools-cats">
        {TOOLS.map((c, i) => <ToolCat key={c.cat} c={c} idx={i} />)}
      </div>
    </section>
  );
}

function ToolCat({ c, idx }) {
  const ref = useReveal();
  return (
    <div className="reveal" ref={ref}>
      <div className="tools-cat-head">
        <span className="num">§ {String(idx + 1).padStart(2, '0')}</span>
        <span className="name">{c.cat}</span>
        <span className="count">{String(c.items.length).padStart(2, '0')} entries</span>
      </div>
      <div className="tools-grid">
        {c.items.map((t, i) => (
          <div className="tool-cell" key={t}>
            <span className="num">{String(idx + 1).padStart(2, '0')}.{String(i + 1).padStart(2, '0')}</span>
            <span className="name">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Tools });
