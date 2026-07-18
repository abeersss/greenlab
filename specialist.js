/*
  Data-driven room engine. Each path has a fixed diagram "type":
  - topology: a hub (cloud/platform) with 4 surrounding zones (Network, Cloud)
  - pipeline: a left-to-right flow of 4 stages (SOC, AI, DevSecOps, EDR)
  Card colors are uniform per-path (not per-answer) so solving requires
  reading the scenario, not color-matching.
*/
const PATHS = [
  {
    key: 'soc', name: 'SOC Analyst', icon: '🔎', color: '#ff5d6c', type: 'pipeline',
    rooms: [
      {
        id: 'soc-1', title: 'Incident Response', intro: 'Match each response action to the right incident.',
        zones: [
          { icon: '🚨', label: 'Suspicious alert', desc: 'Unusual location sign-in.', ans: 'Triage' },
          { icon: '🦠', label: 'Malware', desc: 'Infected workstation online.', ans: 'Contain' },
          { icon: '🧾', label: 'Evidence', desc: 'Logs are required.', ans: 'Investigate' },
          { icon: '✅', label: 'Closed incident', desc: 'Record lessons learned.', ans: 'Document' }
        ]
      },
      {
        id: 'soc-2', title: 'Alert Types', intro: 'Match each alert to the right first response.',
        zones: [
          { icon: '📧', label: 'Phishing email', desc: 'A user reported a suspicious email.', ans: 'Analyze headers' },
          { icon: '🔑', label: 'Brute-force logins', desc: 'Hundreds of failed sign-ins.', ans: 'Block IP / lock account' },
          { icon: '📤', label: 'Data exfiltration', desc: 'Large outbound transfer at 3am.', ans: 'Isolate host' },
          { icon: '❔', label: 'Noisy alert', desc: 'Same low-risk alert fires daily.', ans: 'Tune detection rule' }
        ]
      },
      {
        id: 'soc-3', title: 'SOC Tools & Metrics', intro: 'Match each situation to the right SOC practice.',
        zones: [
          { icon: '📜', label: 'Raw logs', desc: 'Thousands of events per minute.', ans: 'SIEM correlation' },
          { icon: '🔔', label: 'Duplicate alerts', desc: 'Same alert repeats 50 times.', ans: 'Suppress duplicates' },
          { icon: '🚨', label: 'Critical incident', desc: 'Confirmed breach in progress.', ans: 'Escalate to IR team' },
          { icon: '📊', label: 'Monthly review', desc: 'Leadership wants performance data.', ans: 'Track MTTD / MTTR' }
        ]
      }
    ]
  },
  {
    key: 'network', name: 'Network Security', icon: '🌐', color: '#3b82f6', type: 'topology',
    rooms: [
      {
        id: 'network-1', title: 'Perimeter Defense', intro: 'Drag each control to its best location in the network diagram.',
        hub: '☁ INTERNET',
        zones: [
          { icon: '🚪', label: 'Gateway', desc: 'Where internet traffic enters.', ans: 'Firewall' },
          { icon: '🏢', label: 'Employee network', desc: 'Staff workstations, floors 1-3.', ans: 'VLAN' },
          { icon: '🌐', label: 'Public services', desc: 'Web app reachable from the internet.', ans: 'DMZ' },
          { icon: '🛡️', label: 'Web app traffic', desc: 'Needs application-layer protection.', ans: 'WAF' }
        ]
      },
      {
        id: 'network-2', title: 'Remote Access', intro: 'Secure the connections coming from outside the office.',
        hub: '🏠 REMOTE WORKFORCE',
        zones: [
          { icon: '💻', label: 'Home worker laptop', desc: 'Connecting from a home network.', ans: 'VPN' },
          { icon: '📶', label: 'Guest visitor wifi', desc: 'Visitors need internet, not internal access.', ans: 'Guest VLAN' },
          { icon: '📷', label: 'IoT camera', desc: 'A smart device with weak security.', ans: 'Network segmentation' },
          { icon: '⚠️', label: 'Unpatched laptop', desc: 'Device fails a security health check.', ans: 'NAC (access control)' }
        ]
      },
      {
        id: 'network-3', title: 'Wireless & Hardening', intro: 'Close the gaps at the wireless and device edge.',
        hub: '📡 WIRELESS EDGE',
        zones: [
          { icon: '📶', label: 'Open wifi signal', desc: 'Broadcasting with no encryption.', ans: 'WPA3 encryption' },
          { icon: '⚙️', label: 'Router admin panel', desc: 'Still using the factory login.', ans: 'Change default password' },
          { icon: '🔌', label: 'Unused switch port', desc: 'Nobody is plugged in, but it is live.', ans: 'Disable unused ports' },
          { icon: '🚦', label: 'Border traffic', desc: 'Needs to be watched for attack patterns.', ans: 'IDS / IPS' }
        ]
      }
    ]
  },
  {
    key: 'ai', name: 'AI Security', icon: '🤖', color: '#a855f7', type: 'pipeline',
    rooms: [
      {
        id: 'ai-1', title: 'AI Pipeline Safeguards', intro: 'Match each safeguard to the AI component.',
        zones: [
          { icon: '⌨️', label: 'Input', desc: 'A learner types a prompt.', ans: 'Input guardrails' },
          { icon: '🗂️', label: 'Training data', desc: 'The dataset needs review.', ans: 'Review data' },
          { icon: '🔑', label: 'Access', desc: 'Only approved users may query the model.', ans: 'Set permissions' },
          { icon: '💬', label: 'Output', desc: 'The response needs a safety check.', ans: 'Safety filter' }
        ]
      },
      {
        id: 'ai-2', title: 'Prompt & Model Risks', intro: 'Match each risk to the right mitigation.',
        zones: [
          { icon: '💉', label: 'Prompt injection', desc: 'A user tries to override instructions.', ans: 'Input sanitization' },
          { icon: '🔓', label: 'Training data leak', desc: 'Model recites sensitive training text.', ans: 'Data minimization' },
          { icon: '⚠️', label: 'Harmful answer', desc: 'Model output could cause real harm.', ans: 'Output moderation' },
          { icon: '🔌', label: 'Unauthorized API calls', desc: 'A script is hammering the model endpoint.', ans: 'Rate limiting' }
        ]
      },
      {
        id: 'ai-3', title: 'AI Governance', intro: 'Match each situation to the right governance step.',
        zones: [
          { icon: '🆕', label: 'New AI tool requested', desc: 'A team wants to adopt a new model.', ans: 'Risk assessment' },
          { icon: '📉', label: 'Model drift', desc: 'Accuracy is slowly degrading over time.', ans: 'Continuous monitoring' },
          { icon: '🤝', label: 'Third-party AI vendor', desc: 'Sensitive data will leave the company.', ans: 'Vendor due diligence' },
          { icon: '⚖️', label: 'Disputed decision', desc: 'A user disagrees with an AI outcome.', ans: 'Human review' }
        ]
      }
    ]
  },
  {
    key: 'cloud', name: 'Cloud Security', icon: '☁️', color: '#22c1d6', type: 'topology',
    rooms: [
      {
        id: 'cloud-1', title: 'Cloud Basics', intro: 'Match each control to its cloud situation.',
        hub: '☁ CLOUD PLATFORM',
        zones: [
          { icon: '🪣', label: 'Storage bucket', desc: 'Must not be publicly reachable.', ans: 'Restrict access' },
          { icon: '👤', label: 'Admin account', desc: 'Needs stronger protection.', ans: 'Enable MFA' },
          { icon: '💾', label: 'Customer data', desc: 'Stored in the cloud.', ans: 'Encrypt data' },
          { icon: '📡', label: 'Team activity', desc: 'Needs visibility for the security team.', ans: 'Enable logging' }
        ]
      },
      {
        id: 'cloud-2', title: 'Identity & Access', intro: 'Match each identity risk to the right fix.',
        hub: '☁ IDENTITY LAYER',
        zones: [
          { icon: '🔑', label: 'Admin account', desc: 'Has no second factor.', ans: 'Enforce MFA' },
          { icon: '🎭', label: 'Over-privileged role', desc: 'Has far more access than needed.', ans: 'Least privilege' },
          { icon: '👥', label: 'Shared login', desc: 'Whole team uses one account.', ans: 'Individual accounts' },
          { icon: '🕸️', label: 'Stale account', desc: 'Belongs to someone who left months ago.', ans: 'Deprovision access' }
        ]
      },
      {
        id: 'cloud-3', title: 'Cloud Configuration', intro: 'Match each misconfiguration to the right fix.',
        hub: '☁ WORKLOAD LAYER',
        zones: [
          { icon: '🪣', label: 'Public storage bucket', desc: 'Anyone on the internet can read it.', ans: 'Restrict public access' },
          { icon: '🗄️', label: 'Unencrypted database', desc: 'Data sits in plain text at rest.', ans: 'Enable encryption at rest' },
          { icon: '🔓', label: 'Default security group', desc: 'Allows traffic from anywhere.', ans: 'Restrict inbound rules' },
          { icon: '💽', label: 'No backup policy', desc: 'A single failure could lose everything.', ans: 'Enable automated backups' }
        ]
      }
    ]
  },
  {
    key: 'devsecops', name: 'DevSecOps', icon: '⚙️', color: '#f2a93b', type: 'pipeline',
    rooms: [
      {
        id: 'devsecops-1', title: 'CI/CD Security', intro: 'Match security checks to delivery steps.',
        zones: [
          { icon: '💻', label: 'Code', desc: 'A developer pushes new code.', ans: 'Run SAST' },
          { icon: '🗝️', label: 'Secrets', desc: 'A password may have been committed.', ans: 'Scan secrets' },
          { icon: '📦', label: 'Package', desc: 'A third-party library is added.', ans: 'Check dependencies' },
          { icon: '☁️', label: 'Deploy', desc: 'Infrastructure is about to release.', ans: 'Scan IaC' }
        ]
      },
      {
        id: 'devsecops-2', title: 'Secure Build', intro: 'Match each build event to the right control.',
        zones: [
          { icon: '🔀', label: 'New pull request', desc: 'A change is ready for review.', ans: 'Code review' },
          { icon: '🐳', label: 'Container image build', desc: 'A new image is about to ship.', ans: 'Scan container image' },
          { icon: '🔑', label: 'Hardcoded API key', desc: 'Found sitting in the source code.', ans: 'Rotate & remove secret' },
          { icon: '📚', label: 'Open source library', desc: 'Pulled in from a public registry.', ans: 'Check license & CVEs' }
        ]
      },
      {
        id: 'devsecops-3', title: 'Secure Release', intro: 'Match each release event to the right practice.',
        zones: [
          { icon: '🚀', label: 'Production deploy', desc: 'Code is going live.', ans: 'Change approval' },
          { icon: '🚦', label: 'Feature rollout', desc: 'A risky new feature is launching.', ans: 'Canary release' },
          { icon: '🔥', label: 'Incident during deploy', desc: 'Something breaks right after release.', ans: 'Automated rollback' },
          { icon: '📈', label: 'Post-release', desc: 'The feature is now live.', ans: 'Monitor & alert' }
        ]
      }
    ]
  },
  {
    key: 'edr', name: 'EDR', icon: '🛡️', color: '#ec4899', type: 'pipeline',
    rooms: [
      {
        id: 'edr-1', title: 'Endpoint Basics', intro: 'Match each endpoint event to the right action.',
        zones: [
          { icon: '⚙️', label: 'Suspicious process', desc: 'Running with no known reason.', ans: 'Isolate endpoint' },
          { icon: '🦠', label: 'Known malware hash', desc: 'Matches a threat intel signature.', ans: 'Quarantine file' },
          { icon: '📡', label: 'Unusual traffic', desc: 'Endpoint is calling out to a strange IP.', ans: 'Block network connection' },
          { icon: '❔', label: 'Unknown alert', desc: 'Not yet clearly good or bad.', ans: 'Threat hunt' }
        ]
      },
      {
        id: 'edr-2', title: 'Detection & Response', intro: 'Match each incident behavior to the right response.',
        zones: [
          { icon: '🔒', label: 'Ransomware behavior', desc: 'Files are being encrypted rapidly.', ans: 'Kill process & isolate' },
          { icon: '🧠', label: 'Fileless malware', desc: 'Living only in memory, no file on disk.', ans: 'Memory forensics' },
          { icon: '↔️', label: 'Lateral movement', desc: 'Attacker is moving to other hosts.', ans: 'Segment / contain host' },
          { icon: '🔁', label: 'Repeated false positive', desc: 'Same benign alert keeps firing.', ans: 'Tune detection rule' }
        ]
      },
      {
        id: 'edr-3', title: 'Endpoint Hygiene', intro: 'Match each gap to the right fix.',
        zones: [
          { icon: '🕰️', label: 'Outdated signatures', desc: 'The EDR agent has not updated in weeks.', ans: 'Update EDR agent' },
          { icon: '🩹', label: 'Missing OS patches', desc: 'Known vulnerabilities remain open.', ans: 'Patch management' },
          { icon: '🔓', label: 'Local admin for everyone', desc: 'All users can install anything.', ans: 'Remove local admin' },
          { icon: '🙈', label: 'No endpoint visibility', desc: 'A device has no monitoring installed.', ans: 'Deploy EDR agent' }
        ]
      }
    ]
  }
];

const $ = x => document.getElementById(x);
const requestedPath = new URLSearchParams(location.search).get('path');
let activePath = Math.max(0, PATHS.findIndex(p => p.key === requestedPath));
let activeRoom = 0;

function shuffled(arr) {
  return arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
}

function renderTabs() {
  $('tabs').innerHTML = PATHS.map((p, i) =>
    '<button class="tab' + (i === activePath ? ' active' : '') + '" style="--c:' + p.color + '" data-i="' + i + '">' +
    p.icon + ' ' + p.name + '</button>'
  ).join('');
  document.querySelectorAll('.tab').forEach(b => {
    b.onclick = () => { activePath = +b.dataset.i; activeRoom = 0; renderAll(); };
  });
}

function renderRooms() {
  const p = PATHS[activePath];
  $('rooms').innerHTML = p.rooms.map((r, i) =>
    '<button class="room-card' + (i === activeRoom ? ' active' : '') + '" style="--c:' + p.color + '" data-i="' + i + '">' +
    '<b>' + r.title + '</b><small>' + r.intro + '</small><span class="xp-tag">+50 XP</span></button>'
  ).join('');
  document.querySelectorAll('.room-card').forEach(b => {
    b.onclick = () => { activeRoom = +b.dataset.i; renderPuzzle(); };
  });
}

function renderPuzzle() {
  const p = PATHS[activePath];
  const r = p.rooms[activeRoom];

  $('puzzleTitle').textContent = r.title;
  $('puzzleIntro').textContent = r.intro;

  if (p.type === 'topology') {
    $('board').innerHTML =
      '<div class="cloud">' + r.hub + '</div><div class="zones">' +
      r.zones.map(z =>
        '<div class="zone"><b>' + z.icon + ' ' + z.label + '</b><p>' + z.desc + '</p>' +
        '<div class="drop" data-a="' + z.ans + '">Drop control here</div></div>'
      ).join('') + '</div>';
  } else {
    $('board').innerHTML = '<div class="pipeline">' +
      r.zones.map((z, i) =>
        (i > 0 ? '<div class="connector">→</div>' : '') +
        '<div class="stage"><div class="stage-icon">' + z.icon + '</div><b>' + z.label + '</b><p>' + z.desc + '</p>' +
        '<div class="drop" data-a="' + z.ans + '">Drop here</div></div>'
      ).join('') + '</div>';
  }

  $('cardsPanel').style.setProperty('--c', p.color);
  $('cards').innerHTML = shuffled(r.zones.map(z => z.ans)).map(a =>
    '<div class="card" draggable="true" data-a="' + a + '">' + a + '</div>'
  ).join('');

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
  $('feedback').className = 'feedback';
}

function renderAll() {
  renderTabs();
  renderRooms();
  renderPuzzle();
}
renderAll();

$('check').onclick = () => {
  const p = PATHS[activePath];
  const r = p.rooms[activeRoom];
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
  const total = r.zones.length;
  $('feedback').className = 'feedback ' + (s === total ? 'good' : 'bad');
  $('feedback').textContent = s === total ? 'Excellent! +50 XP' : s + ' of ' + total + ' are correct.';
  if (s === total && window.GreenLabGame) window.GreenLabGame.recordCompletion(r.id, 50);
};
