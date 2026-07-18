/*
  Shared across every page: auth modal wiring, XP/level/streak/badge
  display, and the leaderboard. Puzzle pages call
  GreenLabGame.recordCompletion(puzzleKey, xp) after a perfect solve.
*/
(function () {
  const $ = x => document.getElementById(x);
  const ONE_DAY = 86400000;

  let client;
  try {
    client = supabase.createClient(GREENLAB_AUTH.supabaseUrl, GREENLAB_AUTH.supabasePublishableKey);
  } catch (e) {}

  const BADGES = [
    { key: 'network', icon: '🌐', name: 'Network Defender' },
    { key: 'soc', icon: '🔎', name: 'SOC Analyst' },
    { key: 'cloud', icon: '☁️', name: 'Cloud Guardian' },
    { key: 'ai', icon: '🤖', name: 'AI Sentinel' },
    { key: 'dev', icon: '⚙️', name: 'DevSecOps Engineer' }
  ];

  const levelFor = xp => Math.floor(xp / 100) + 1;
  const dateKey = d => new Date(d).toISOString().slice(0, 10);

  function computeStreak(dateSet) {
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!dateSet.has(dateKey(cursor))) cursor = new Date(cursor.getTime() - ONE_DAY);
    let streak = 0;
    while (dateSet.has(dateKey(cursor))) {
      streak++;
      cursor = new Date(cursor.getTime() - ONE_DAY);
    }
    return streak;
  }

  async function refreshGamebar() {
    const bar = $('gamebar');
    if (!bar || !client) return;

    const { data: { session } } = await client.auth.getSession();
    if (!session) { bar.innerHTML = ''; return; }

    const { data: completions, error } = await client
      .from('puzzle_completions')
      .select('puzzle_key, xp_awarded, completed_at')
      .eq('user_id', session.user.id);
    if (error || !completions) { bar.innerHTML = ''; return; }

    const totalXp = completions.reduce((sum, c) => sum + c.xp_awarded, 0);
    const earnedKeys = new Set(completions.map(c => c.puzzle_key));
    const dateSet = new Set(completions.map(c => dateKey(c.completed_at)));
    const streak = computeStreak(dateSet);

    const badgesHtml = BADGES.map(b =>
      '<span class="badge' + (earnedKeys.has(b.key) ? ' earned' : '') + '" title="' + b.name + '">' + b.icon + '</span>'
    ).join('');

    bar.innerHTML =
      '<div class="panel gamebar">' +
        '<div class="gstat"><b>Level ' + levelFor(totalXp) + '</b><small>' + totalXp + ' XP</small></div>' +
        '<div class="gstat"><b>' + streak + ' 🔥</b><small>day streak</small></div>' +
        '<div class="gbadges">' + badgesHtml + '</div>' +
      '</div>';
  }

  async function refreshLeaderboard() {
    const el = $('leaderboard');
    if (!el || !client) return;

    const { data: { session } } = await client.auth.getSession();
    if (!session) { el.innerHTML = '<p class="status">Sign in to see the leaderboard.</p>'; return; }

    const { data, error } = await client.from('leaderboard').select('*').limit(10);
    if (error || !data) { el.innerHTML = ''; return; }

    el.innerHTML = '<ol class="leaderboard-list">' +
      data.map(r => '<li><span>' + r.display_name + '</span><b>' + r.total_xp + ' XP</b></li>').join('') +
      '</ol>';
  }

  function wireAuthUI() {
    if (!client) return;
    if ($('login')) $('login').onclick = () => $('modal').classList.add('show');
    if ($('close')) $('close').onclick = () => $('modal').classList.remove('show');

    if ($('emailLogin')) $('emailLogin').onclick = async () => {
      const r = await client.auth.signInWithOtp({
        email: $('email').value,
        options: { emailRedirectTo: location.origin + location.pathname }
      });
      $('status').textContent = r.error ? r.error.message : 'Check your email for your sign-in link.';
    };

    if ($('googleLogin')) $('googleLogin').onclick = async () => {
      const r = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: location.origin + location.pathname }
      });
      if (r.error) $('status').textContent = r.error.message;
    };
  }

  async function recordCompletion(puzzleKey, xp) {
    if (!client) return;
    const { data: { session } } = await client.auth.getSession();
    if (!session) return;
    await client.from('puzzle_completions').insert({
      user_id: session.user.id,
      puzzle_key: puzzleKey,
      xp_awarded: xp
    });
    refreshGamebar();
    refreshLeaderboard();
  }

  document.addEventListener('DOMContentLoaded', () => {
    wireAuthUI();
    refreshGamebar();
    refreshLeaderboard();
  });

  if (client) {
    client.auth.onAuthStateChange(() => {
      refreshGamebar();
      refreshLeaderboard();
      if ($('modal')) $('modal').classList.remove('show');
    });
  }

  window.GreenLabGame = { client, recordCompletion };
})();
