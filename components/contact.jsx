function Contact() {
  // ─── To receive submissions directly in your inbox ───
  // 1. Go to https://formspree.io, sign up free, create a new form
  // 2. Replace YOUR_FORM_ID below with the ID Formspree gives you
  //    (the URL looks like https://formspree.io/f/abcdwxyz, paste 'abcdwxyz')
  // Until you do this, the form falls back to opening the user's mail client.
  const FORMSPREE_ID = 'xpqblory';
  const useFormspree = FORMSPREE_ID && FORMSPREE_ID !== 'YOUR_FORM_ID';

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errors, setErrors] = useState({});
  const [errMsg, setErrMsg] = useState('');

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';else
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Not a valid email';
    if (!form.message.trim()) e.message = 'Required';else
    if (form.message.trim().length < 10) e.message = 'A little more, please';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    setErrMsg('');

    if (useFormspree) {
      try {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            _replyto: form.email,
            subject: form.subject || `Portfolio note from ${form.name}`,
            message: form.message
          })
        });
        if (res.ok) {
          setStatus('sent');
        } else {
          const data = await res.json().catch(() => ({}));
          setErrMsg(data.error || 'Could not send. Please try the email link below.');
          setStatus('error');
        }
      } catch (err) {
        setErrMsg('Network error. Please try the email link below.');
        setStatus('error');
      }
    } else {
      // Fallback: open user's mail client pre-filled.
      const subject = encodeURIComponent(form.subject || `Message from ${form.name} via portfolio`);
      const body = encodeURIComponent(`${form.message}\n\n—\nFrom: ${form.name}\nReply: ${form.email}`);
      const mailto = `mailto:sms10221@nyu.edu?subject=${subject}&body=${body}`;
      setTimeout(() => {window.location.href = mailto;setStatus('sent');}, 400);
    }
  };

  const reset = () => {
    setForm({ name: '', email: '', subject: '', message: '' });
    setErrors({});
    setErrMsg('');
    setStatus('idle');
  };

  return (
    <section className="contact" id="contact" data-screen-label="Contact">
      <div className="section-marker"><span className="num">07</span> Correspondence</div>
      <div className="contact-inner">
        <h2 style={{ fontFamily: "\"Times New Roman\"" }}>Let's <span className="it">build</span><br />something <span className="it">considered.</span></h2>

        <div className="contact-grid">
          <div className="contact-info">
            <div className="eyebrow" style={{ marginBottom: 12, color: 'rgba(245,240,232,0.55)' }}>— Currently open to</div>
            <p>Senior full-stack and AI infra roles. Consulting on agent platforms, distributed systems, and anything that needs to stay up at three in the morning.</p>
            <div className="eyebrow" style={{ marginBottom: 12, color: 'rgba(245,240,232,0.55)' }}>— Based</div>
            <p>New York · willing to travel</p>

            <div className="contact-links">
              <a className="contact-link" href="mailto:sms10221@nyu.edu">
                <span className="ix">01</span><span>sms10221@nyu.edu</span><span className="arrow">↗</span>
              </a>
              <a className="contact-link" href="https://linkedin.com/in/isiddharthsingh" target="_blank" rel="noreferrer">
                <span className="ix">02</span><span>linkedin / isiddharthsingh</span><span className="arrow">↗</span>
              </a>
              <a className="contact-link" href="https://github.com/isiddharthsingh" target="_blank" rel="noreferrer">
                <span className="ix">03</span><span>github / isiddharthsingh</span><span className="arrow">↗</span>
              </a>
            </div>
          </div>

          <form className="contact-form" onSubmit={onSubmit} noValidate>
            <div className="cf-head">
              <span className="cf-tag">— Send a note</span>
              <span className="cf-tag-r">replies within 24h</span>
            </div>

            {status === 'sent' ?
            <div className="cf-sent">
                <div className="cf-sent-glyph">✓</div>
                <h3>{useFormspree ? 'Message sent.' : 'Your mail client is open.'}</h3>
                <p>
                  {useFormspree ?
                "Thanks, I'll get back to you within 24 hours. You can also reach me directly at " :
                "Hit send there and it'll land in my inbox. If nothing opened, copy "}
                  <a href="mailto:sms10221@nyu.edu">sms10221@nyu.edu</a>{useFormspree ? '.' : ' directly.'}
                </p>
                <button type="button" className="cf-reset" onClick={reset}>Write another →</button>
              </div> :

            <>
                <div className={'cf-row' + (errors.name ? ' err' : '')}>
                  <label>Name</label>
                  <input type="text" value={form.name} onChange={update('name')} placeholder="Your name" />
                  {errors.name && <span className="cf-err">{errors.name}</span>}
                </div>
                <div className={'cf-row' + (errors.email ? ' err' : '')}>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={update('email')} placeholder="you@domain.com" />
                  {errors.email && <span className="cf-err">{errors.email}</span>}
                </div>
                <div className="cf-row">
                  <label>Subject <span className="cf-opt">(optional)</span></label>
                  <input type="text" value={form.subject} onChange={update('subject')} placeholder="What's this about?" />
                </div>
                <div className={'cf-row' + (errors.message ? ' err' : '')}>
                  <label>Message</label>
                  <textarea rows={5} value={form.message} onChange={update('message')} placeholder="A few lines about what you're working on…"></textarea>
                  {errors.message && <span className="cf-err">{errors.message}</span>}
                </div>
                {status === 'error' &&
              <div className="cf-error-banner">
                    {errMsg}, or <a href="mailto:sms10221@nyu.edu">email directly</a>.
                  </div>
              }
                <button type="submit" className="cf-submit" disabled={status === 'sending'}>
                  <span>{status === 'sending' ? useFormspree ? 'Sending…' : 'Opening mail…' : 'Send message'}</span>
                  <span className="cf-arrow">→</span>
                </button>
                <p className="cf-fineprint">
                  {useFormspree ?
                'Your message is sent securely via Formspree and lands in my inbox. Your email is used only to reply.' :
                'Submitting opens your default mail client with the message pre-filled. To enable direct send, configure Formspree in components/contact.jsx.'}
                </p>
              </>
            }
          </form>
        </div>

        <div className="footer-big">Siddharth.</div>
        <div className="footer">
          <span>© 2026 Siddharth Singh · NYC</span>
          <span>Set in Anthropic Serif &amp; JetBrains Mono</span>
          <span>v2.0 / Anthropic edition</span>
        </div>
      </div>
    </section>);

}

Object.assign(window, { Contact });