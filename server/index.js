import assets from './assets.mjs';
import { rounds, savedRounds, roundKey, selectRound } from './rounds.mjs';

const questionTimeMs = 30_000;
const cookieName = '__Host-rttf-guest';
const normalize = (value) => value.normalize('NFD').replace(/\p{M}/gu, '')
  .toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

function identity(request) {
  const member = request.headers.get('oai-authenticated-user-id');
  if (member) return { member, actor: 'u:' + member };
  const saved = request.headers.get('cookie')?.split(';').map(part => part.trim())
    .find(part => part.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  if (saved && /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/.test(saved)) return { actor: 'g:' + saved };
  const guest = crypto.randomUUID();
  return { actor: 'g:' + guest, cookie: cookieName + '=' + guest + '; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=604800' };
}

function json(data, status = 200, cookie) {
  const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store',
    'x-content-type-options': 'nosniff' };
  if (cookie) headers['set-cookie'] = cookie;
  return new Response(JSON.stringify(data), { status, headers });
}

function questionView(question) {
  return { category: question.category, kind: question.kind, prompt: question.prompt, difficulty: question.difficulty };
}

function describeRound(round) {
  return { id: round.id, date: round.date, number: round.number, goal: round.goal, stadium: round.stadium,
    questionCount: round.questions.length, difficulty:round.difficulty };
}

function runView(row, round, now) {
  if (!row) return null;
  const entries = JSON.parse(row.answers);
  const active = row.ready_at === null ? Math.max(0, entries.length - 1) : entries.length;
  const revealAnswers = round.date < new Date(now).toISOString().slice(0, 10);
  return {
    id: row.run_id, mode: row.mode, entries, active, ready: row.ready_at !== null,
    remainingMs: row.ready_at !== null && row.timer_ms !== null
      ? Math.max(0, row.ready_at + row.timer_ms - now) : null,
    completed: row.completed_at !== null, distance: row.distance, correct: row.correct,
    answerMs: row.answer_ms,
    question: row.completed_at === null ? questionView(round.questions[active]) : null,
    review: row.completed_at === null ? null : round.questions.map((question) => ({
      ...questionView(question), ...(revealAnswers ? {
        source: question.source, sourceName: question.sourceName,
        answers: question.answers.map((answer) => answer[1]),
        allAnswers: question.answers.map(([points, name]) => ({name, points}))
          .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name)),
      } : {}),
    })),
  };
}

function getProfile(db, member) {
  return member ? db.prepare('SELECT handle, created_at AS joinedAt FROM profiles WHERE user_id = ?')
    .bind(member).first() : null;
}

function getRun(db, actor, date, mode) {
  return db.prepare('SELECT * FROM attempts WHERE actor = ? AND round_date = ? AND mode = ?')
    .bind(actor, date, mode).first();
}

function chooseMode(profile, round, requestedMode, now) {
  const today = new Date(now).toISOString().slice(0, 10);
  return profile && round.date === today && requestedMode !== 'practice' ? 'ranked' : 'practice';
}

async function register(db, player, body) {
  if (!player.member) return json({ error: 'Log in before creating your game profile.' }, 401);
  const handle = typeof body.handle === 'string' ? body.handle.trim() : '';
  if (!/^[A-Za-z0-9_]{3,20}$/.test(handle)) {
    return json({ error: 'Use 3–20 letters, numbers or underscores.' }, 400);
  }
  await db.prepare('INSERT OR IGNORE INTO profiles (user_id, handle, created_at) VALUES (?, ?, ?)')
    .bind(player.member, handle, Date.now()).run();
  const profile = await getProfile(db, player.member);
  return profile ? json({ profile }) : json({ error: 'That username is already taken.' }, 409);
}

const dayMs = 86_400_000;

function streak(dates, now) {
  let best = 0;
  let current = 0;
  let previous = -Infinity;
  for (const { date } of dates) {
    const day = Date.parse(date) / dayMs;
    current = day === previous + 1 ? current + 1 : 1;
    best = Math.max(best, current);
    previous = day;
  }
  return { current: previous >= Math.floor(now / dayMs) - 1 ? current : 0, best };
}

async function friendResult(db, id, round, actor) {
  if (!/^[a-f0-9-]{36}$/.test(id ?? '')) return null;
  const entry = await db.prepare(`SELECT p.handle, a.actor, a.distance, a.correct, a.answer_ms AS answerMs
    FROM attempts a JOIN profiles p ON a.actor = 'u:' || p.user_id
    WHERE a.run_id = ? AND a.round_date = ? AND a.mode = 'ranked' AND a.completed_at IS NOT NULL`)
    .bind(id, roundKey(round)).first();
  if (!entry) return null;
  const { actor: owner, ...result } = entry;
  return { ...result, isOwn: owner === actor };
}

async function profileStats(db, player, profile, now) {
  if (!profile) return json({ error: 'Create a profile to see your stats.' }, 401);
  const [totals, timing, history, dates] = await Promise.all([
    db.prepare(`SELECT COUNT(*) AS rounds, COALESCE(SUM(distance),0) AS distance,
      COALESCE(SUM(correct),0) AS correct, COALESCE(SUM(answer_count),0) AS questions,
      COALESCE(MAX(distance),0) AS best, SUM(CASE WHEN distance >= 400 THEN 1 ELSE 0 END) AS finals
      FROM attempts WHERE actor = ? AND completed_at IS NOT NULL`).bind(player.actor).first(),
    db.prepare(`SELECT COUNT(*) AS submitted, COALESCE(AVG(json_extract(j.value,'$.elapsedMs')),0) AS averageMs,
      MIN(CASE WHEN json_extract(j.value,'$.points') > 0 THEN json_extract(j.value,'$.elapsedMs') END) AS fastestMs
      FROM attempts a, json_each(a.answers) j WHERE a.actor = ? AND a.completed_at IS NOT NULL
      AND json_extract(j.value,'$.skipped') = 0`).bind(player.actor).first(),
    db.prepare(`SELECT round_date AS date, mode, distance, correct, answer_ms AS answerMs, answers
      FROM attempts WHERE actor = ? AND completed_at IS NOT NULL ORDER BY round_date DESC, completed_at DESC LIMIT 25`)
      .bind(player.actor).all(),
    db.prepare(`SELECT DISTINCT substr(round_date,1,10) AS date FROM attempts WHERE actor = ? AND mode = 'ranked'
      AND completed_at IS NOT NULL ORDER BY date`).bind(player.actor).all(),
  ]);
  return json({ profile, streak: streak(dates.results, now), totals: { ...totals, ...timing }, history: history.results.map((item) => {
    const round = savedRounds.find((candidate) => roundKey(candidate) === item.date);
    return { ...item, date:round?.date || item.date.slice(0,10), edition:round?.difficulty || 'Original challenge', answers: JSON.parse(item.answers).map((answer, index) => ({
      ...answer, prompt: round?.questions[index]?.prompt,
    })) };
  }) });
}

async function leaderboard(db, url, round) {
  const allTime = url.searchParams.get('scope') === 'overall';
  const stmt = allTime
    ? db.prepare(`SELECT p.handle, SUM(a.distance) AS distance, SUM(a.correct) AS correct,
        SUM(a.answer_ms) AS answerMs, COUNT(*) AS rounds
      FROM attempts a JOIN profiles p ON a.actor = 'u:' || p.user_id
      WHERE a.mode = 'ranked' AND a.completed_at IS NOT NULL
      GROUP BY p.user_id ORDER BY distance DESC, correct DESC, answerMs, p.handle COLLATE NOCASE LIMIT 50`)
    : db.prepare(`SELECT p.handle, a.distance, a.correct, a.answer_ms AS answerMs, 1 AS rounds
      FROM attempts a JOIN profiles p ON a.actor = 'u:' || p.user_id
      WHERE a.mode = 'ranked' AND a.completed_at IS NOT NULL AND a.round_date = ?
      ORDER BY a.distance DESC, a.correct DESC, a.answer_ms, p.handle COLLATE NOCASE LIMIT 50`).bind(roundKey(round));
  return json({ date: round.date, rows: (await stmt.all()).results });
}

async function play(db, player, profile, round, action, body, now) {
  const mode = body.mode === 'practice' ? 'practice' : body.mode === 'ranked' ? 'ranked' : chooseMode(profile, round, null, now);
  if (mode === 'ranked' && !profile) return json({ error: 'Create a profile to play a ranked round.' }, 401);
  if (action === 'start') {
    const existing = await getRun(db, player.actor, roundKey(round), mode);
    if (existing) return json({ run: runView(existing, round, now) }, 200, player.cookie);
    if (mode === 'ranked' && chooseMode(profile, round, null, now) !== 'ranked') {
      return json({ error: 'This round is now available in practice.' }, 409);
    }
    await db.prepare(`INSERT OR IGNORE INTO attempts (actor, round_date, mode, run_id, started_at, ready_at, timer_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(player.actor, roundKey(round), mode, crypto.randomUUID(), now, now, questionTimeMs).run();
    return json({ run: runView(await getRun(db, player.actor, roundKey(round), mode), round, now) }, 200, player.cookie);
  }

  const row = await getRun(db, player.actor, roundKey(round), mode);
  if (!row || row.run_id !== body.id) return json({ error: 'Open the current round and try again.' }, 409);
  if (action === 'restart') {
    // The ranked row stays untouched. A single upsert replaces only this player's practice attempt.
    await db.prepare(`INSERT INTO attempts
      (actor, round_date, mode, run_id, started_at, ready_at, timer_ms)
      VALUES (?, ?, 'practice', ?, ?, ?, ?)
      ON CONFLICT(actor, round_date, mode) DO UPDATE SET
        run_id = excluded.run_id, started_at = excluded.started_at, ready_at = excluded.ready_at,
        timer_ms = excluded.timer_ms, completed_at = NULL, answers = '[]',
        answer_count = 0, distance = 0, correct = 0, answer_ms = 0`)
      .bind(player.actor, roundKey(round), crypto.randomUUID(), now, now, questionTimeMs).run();
    return json({run:runView(await getRun(db,player.actor,roundKey(round),'practice'),round,now)},200,player.cookie);
  }
  if (action === 'reset') {
    if (mode !== 'practice' || row.completed_at === null) return json({ error: 'This run cannot be reset.' }, 409);
    await db.prepare('DELETE FROM attempts WHERE actor = ? AND round_date = ? AND mode = ? AND run_id = ?')
      .bind(player.actor, roundKey(round), mode, row.run_id).run();
    return json({ run: null });
  }
  if (row.completed_at !== null) return json({ run: runView(row, round, now) });

  if (action === 'next') {
    if (row.ready_at === null && body.index === row.answer_count - 1) {
      const finished = row.answer_count === round.questions.length;
      await db.prepare(`UPDATE attempts SET ready_at = ?, completed_at = ?
        WHERE actor = ? AND round_date = ? AND mode = ? AND run_id = ?
        AND ready_at IS NULL AND completed_at IS NULL AND answer_count = ?`)
        .bind(finished ? null : now, finished ? now : null, player.actor, roundKey(round), mode,
          row.run_id, row.answer_count).run();
    }
    return json({ run: runView(await getRun(db, player.actor, roundKey(round), mode), round, now) });
  }
  if (row.ready_at === null || row.answer_count !== body.index) return json({ run: runView(row, round, now) });

  const elapsed = Math.max(0, now - row.ready_at);
  const timedOut = row.timer_ms !== null && elapsed >= row.timer_ms;
  if (body.timeout === true && !timedOut) return json({ run: runView(row, round, now) });
  const skipped = timedOut || body.skip === true;
  const typed = typeof body.answer === 'string' ? body.answer.trim() : '';
  if (!skipped && (!typed || typed.length > 100)) return json({ error: 'Enter an answer of up to 100 characters.' }, 400);
  const question = round.questions[row.answer_count];
  const key = normalize(typed);
  if (!skipped && question.clarify && key === normalize(question.clarify.input)) {
    return json({ hint: question.clarify.hint });
  }
  const accepted = !skipped && key && question.answers.find(([, ...aliases]) => aliases.some(alias => normalize(alias) === key));
  if (!skipped && !accepted) {
    return json({hint:'Not accepted. Try another name — time is still running.',invalid:true});
  }
  const points = accepted ? accepted[0] : 0;
  const elapsedMs = timedOut ? row.timer_ms : skipped ? 0 : elapsed;
  const entry = { points, name: accepted ? accepted[1] : skipped ? '' : typed, skipped, timedOut, elapsedMs };
  await db.prepare(`UPDATE attempts SET answers = json_insert(answers, '$[#]', json(?)),
    answer_count = answer_count + 1, distance = distance + ?, correct = correct + ?,
    answer_ms = answer_ms + ?, ready_at = NULL
    WHERE actor = ? AND round_date = ? AND mode = ? AND run_id = ? AND answer_count = ? AND ready_at = ?`)
    .bind(JSON.stringify(entry), points, Number(points > 0), elapsedMs, player.actor, roundKey(round),
      mode, row.run_id, row.answer_count, row.ready_at).run();
  return json({ run: runView(await getRun(db, player.actor, roundKey(round), mode), round, now) });
}

async function api(request, db, url) {
  const player = identity(request);
  const now = Date.now();
  const date = url.searchParams.get('round');
  const { round, nextAt, archived } = selectRound(now, date);
  const live = selectRound(now).round;
  const path = url.pathname;
  if (request.method === 'GET') {
    if (path === '/api/leaderboard') return leaderboard(db, url, live);
    if (path === '/api/archive') return json({ rounds: rounds.filter(item =>
      Date.parse(item.date) < Math.floor(now / dayMs) * dayMs).map(describeRound) });
    const profile = await getProfile(db, player.member);
    if (path === '/api/profile') return profileStats(db, player, profile, now);
    if (path === '/api/state') {
      const mode = chooseMode(profile, round, url.searchParams.get('mode'), now);
      const ranked = profile && await getRun(db, player.actor, roundKey(round), 'ranked');
      const actualMode = url.searchParams.get('mode') === 'practice' ? 'practice' : ranked ? 'ranked' : mode;
      const row = ranked && actualMode === 'ranked' ? ranked : await getRun(db, player.actor, roundKey(round), actualMode);
      const friendId = url.searchParams.get('friend');
      const friend = friendId && date === round.date ? await friendResult(db, friendId, round, player.actor) : null;
      return json({ signedIn: !!player.member, profile, round: describeRound(round), nextAt, archived, mode: actualMode,
        friend, invalidFriend: !!friendId && !friend, run: runView(row, round, now) }, 200, player.cookie);
    }
  }
  if (request.method === 'POST') {
    if (request.headers.get('origin') !== url.origin) return json({ error: 'Open the site directly and try again.' }, 403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'Invalid request.' }, 415);
    const payload = await request.text();
    if (payload.length > 2048) return json({ error: 'Invalid request.' }, 413);
    let body;
    try { body = JSON.parse(payload); } catch { return json({ error: 'Invalid request.' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid request.' }, 400);
    if (path === '/api/register') return register(db, player, body);
    const actions = ['/api/start', '/api/answer', '/api/next', '/api/reset', '/api/restart'];
    if (actions.includes(path)) {
      if (date !== round.date) return json({ error: 'This round is unavailable. Refresh to load today’s challenge.' }, 409);
      return play(db, player, await getProfile(db, player.member), round, path.slice(5), body, now);
    }
  }
  return json({ error: 'Not found.' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await api(request, env.DB, url); }
      catch (error) {
        console.error('Game request failed', url.pathname, error.name);
        return json({ error: 'The game service is temporarily unavailable. Try again shortly.' }, 503);
      }
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405 });
    const entry = assets[url.pathname === '/' ? '/index.html' : url.pathname];
    if (!Array.isArray(entry)) return new Response('Not found', { status: 404 });
    const [type, encoded] = entry;
    const body = request.method === 'HEAD' ? null : Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    return new Response(body, { headers: { 'content-type': type, 'x-content-type-options': 'nosniff',
      'cache-control': url.pathname.startsWith('/assets/') ? 'public, max-age=86400' : 'no-cache' } });
  },
};
