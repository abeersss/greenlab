const P = [
  ['SOC Analyst Puzzle', 'Match each response action to the right incident.', 'soc', [
    ['🚨 Suspicious alert', 'Unusual location sign-in.', 'Triage', '#ed645d', '#fff2f1'],
    ['🦠 Malware', 'Infected workstation online.', 'Contain', '#e99a2c', '#fff8e9'],
    ['🧾 Evidence', 'Logs are required.', 'Investigate', '#2876c8', '#eef7ff'],
    ['✅ Closed incident', 'Record lessons learned.', 'Document', '#1a9b70', '#edfff8']
  ]],
  ['Cloud Security Puzzle', 'Match each control to its cloud situation.', 'cloud', [
    ['🪣 Storage', 'Bucket must not be public.', 'Restrict access', '#8052bb', '#f6efff'],
    ['👤 Account', 'Admin needs stronger protection.', 'Enable MFA', '#2876c8', '#eef7ff'],
    ['💾 Data', 'Customer data in cloud.', 'Encrypt data', '#ed645d', '#fff2f1'],
    ['📡 Activity', 'Team needs visibility.', 'Enable logging', '#1a9b70', '#edfff8']
  ]],
  ['AI Security Puzzle', 'Match each safeguard to the AI component.', 'ai', [
    ['⌨️ Input', 'Learner enters prompt.', 'Input guardrails', '#ed645d', '#fff2f1'],
    ['🗂️ Data', 'Dataset needs review.', 'Review data', '#e99a2c', '#fff8e9'],
    ['🔑 Access', 'Only approved users.', 'Set permissions', '#8052bb', '#f6efff'],
    ['💬 Output', 'Response needs checks.', 'Safety filter', '#1a9b70', '#edfff8']
  ]],
  ['DevSecOps Puzzle', 'Match security checks to delivery steps.', 'dev', [
    ['💻 Code', 'Developer pushes code.', 'Run SAST', '#2876c8', '#eef7ff'],
    ['🗝️ Secrets', 'Password may commit.', 'Scan secrets', '#ed645d', '#fff2f1'],
    ['📦 Package', 'Third-party library.', 'Check dependencies', '#e99a2c', '#fff8e9'],
    ['☁️ Deploy', 'Infrastructure release.', 'Scan IaC', '#1a9b70', '#edfff8']
  ]]
];

const $ = x => document.getElementById(x);
const PATH_INDEX = { soc: 0, cloud: 1, ai: 2, dev: 3 };
const requested = new URLSearchParams(location.search).get('path');
let n = PATH_INDEX[requested] ?? 0;

function render() {
  const p = P[n];
  $('title').textContent = p[0];
  $('intro').textContent = p[1];

  $('zones').innerHTML = p[3].map(x =>
    '<div class="zone" style="--c:' + x[3] + ';--bg:' + x[4] + '"><b>' + x[0] + '</b><p>' + x[1] +
    '</p><div class="drop" data-a="' + x[2] + '">Drop action here</div></div>'
  ).join('');

  $('cards').innerHTML = p[3].map(x =>
    '<div class="card" draggable="true" data-a="' + x[2] + '" style="--c:' + x[3] + '">' + x[2] + '</div>'
  ).join('');

  document.querySelectorAll('[data-i]').forEach(b => {
    b.classList.toggle('active', +b.dataset.i === n);
    b.onclick = () => { n = +b.dataset.i; render(); };
  });

  document.querySelectorAll('.card').forEach(c => {
    c.ondragstart = e => e.dataTransfer.setData('text/plain', c.dataset.a);
  });

  document.querySelectorAll('.drop').forEach(d => {
    d.ondragover = e => { e.preventDefault(); d.classList.add('over'); };
    d.ondragleave = () => d.classList.remove('over');
    d.ondrop = e => {
      e.preventDefault();
      d.classList.remove('over');
      const a = e.dataTransfer.getData('text/plain');
      if (d.querySelector('.placed')) return;
      d.innerHTML = '<div class="placed" data-a="' + a + '">' + a + '</div>';
      const c = document.querySelector('.card[data-a="' + a + '"]');
      if (c) c.style.display = 'none';
    };
  });

  $('feedback').textContent = '';
}
render();

$('check').onclick = () => {
  let s = 0;
  document.querySelectorAll('.drop').forEach(d => {
    d.classList.remove('correct', 'wrong');
    const z = d.querySelector('.placed');
    if (z) {
      const ok = z.dataset.a === d.dataset.a;
      d.classList.add(ok ? 'correct' : 'wrong');
      if (ok) s++;
    }
  });
  $('feedback').className = 'feedback ' + (s === 4 ? 'good' : 'bad');
  $('feedback').textContent = s === 4 ? 'Excellent! +50 XP' : s + ' of 4 are correct.';
  if (s === 4 && window.GreenLabGame) {
    window.GreenLabGame.recordCompletion(P[n][2], 50);
  }
};
