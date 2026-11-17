import { dropAnswer } from './dive.mjs';
const find = (id) => document.getElementById(id);
const form = find('answer-form');
const input = find('answer');
const hint = find('hint');
const stages = ['home', 'game', 'result'];
const tabs = ['play', 'archive', 'leaderboard', 'profile', 'register'];
const rarity = {25:'Common answer',45:'Less common answer',65:'Rare answer',85:'Very rare answer',100:'Exceptional answer'};
const placeholders = {player:'Player name',club:'Club name',country:'Country or team name',venue:'Stadium name',city:'City name'};
const dayFormat = new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'short',timeZone:'UTC'});
let state;
let scope = 'daily';
let boardRequest = 0;
let busy = false;
let deadline = null;
let advanceAt = null;
let retryAt = 0;
let scoreFrame;
let rejectedAnswer = null;
let animateAnswers = true;
const activeDrops = new Map();
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function api(path, body) {
  const url = new URL('/api/' + path, location.origin);
  if (state && ['start', 'answer', 'next', 'reset', 'restart'].includes(path)) url.searchParams.set('round', state.round.date);
  if (path === 'leaderboard') url.searchParams.set('scope', scope);
  if (path === 'state') {
    const params = new URL(location.href).searchParams;
    for (const key of ['round', 'mode', 'friend']) if (params.has(key)) url.searchParams.set(key, params.get(key));
  }
  return fetch(url, body === undefined ? undefined : {
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body),
  }).then(async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Something went wrong. Try again.');
    return data;
  });
}

function notice(message = '') {
  find('notice').textContent = message;
  find('notice').hidden = !message;
}

async function perform(action) {
  if (busy) return;
  busy = true;
  notice();
  try { await action(); }
  catch (error) { notice(error.message); }
  finally { busy = false; }
}

function setTab() {
  const requested = location.hash.slice(1);
  const current = tabs.includes(requested) ? requested : 'play';
  for (const tab of tabs) find(tab + '-screen').hidden = tab !== current;
  for (const link of document.querySelectorAll('[data-tab]')) {
    if (link.dataset.tab === current) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  }
  if (current === 'profile') showProfile();
  if (current === 'leaderboard') showBoard();
  if (current === 'archive') showArchive();
}

function render(previousDistance) {
  const { round, run, profile, signedIn, mode } = state;
  const view = run ? run.completed ? 'result' : 'game' : 'home';
  for (const stage of stages) find(stage).hidden = stage !== view;
  document.body.dataset.view = view;
  find('intro').hidden = view !== 'home';
  find('stadium-score').hidden = view === 'home';
  find('fixture-label').textContent = 'CHALLENGE ' + String(round.number).padStart(3,'0') + ' · ' + dayFormat.format(new Date(round.date));
  find('login').hidden = signedIn;
  find('register-tab').hidden = !!profile;
  find('register-form').hidden = !signedIn || !!profile;
  find('register-login').hidden = signedIn;
  find('register-status').textContent = profile ? 'Your profile is registered as ' + profile.handle + '.' : '';
  find('logout').hidden = !signedIn;
  find('home-description').textContent = mode === 'ranked' ? 'Ranked round · One run per player.'
    : profile ? 'Practice round · Results are saved to your profile.' : 'Practice round · Create a profile to join the leaderboard.';
  if (round.difficulty) find('home-description').textContent = round.difficulty + ' · ' + find('home-description').textContent;
  find('start').disabled = false;
  const distance = run?.distance ?? 0;
  find('scene-label').textContent = distance >= round.goal ? 'EXPEDITION TARGET REACHED' : 'YOUR EXPEDITION';
  find('ocean-board').hidden = view === 'home';
  find('ocean-inspect').hidden = view === 'home';
  if (run) renderOcean(find('ocean-board'), run.entries, {animate:previousDistance !== undefined});

  renderDistance(distance, round.goal, previousDistance);
  deadline = view === 'game' && run.ready && Number.isFinite(run.remainingMs) ? performance.now() + run.remainingMs : null;
  advanceAt = view === 'game' && !run.ready && run.entries[run.active]?.timedOut ? performance.now() + 1200 : null;
  find('question-timer').hidden = deadline === null;
  if (view === 'game') renderQuestion(run, previousDistance);
  if (view === 'result') renderResult(run);
  renderFriend(run);
  updateSchedule();
  updateQuestionTimer();
}

function renderOcean(container, entries, {compact = false, animate = false} = {}) {
  const signature = JSON.stringify([compact,entries]);
  if (container.dataset.answers === signature) return;
  container.dataset.answers = signature;
  const sinking = [];
  if (!compact) for (const cancel of [...activeDrops.values()]) cancel();
  container.replaceChildren();
  container.classList.add('depth-chart');
  container.setAttribute('role','group');
  container.setAttribute('aria-label','Answer depth: 0 at the surface, 100 at the bottom');
  const water = document.createElement('div');
  water.className = 'depth-water';
  for (const value of [0,25,50,75,100]) {
    const line = document.createElement('div');
    line.className = 'depth-line';
    line.style.top = value + '%';
    const label = document.createElement('span');
    label.textContent = value;
    line.append(label);
    water.append(line);
  }
  for (let index = 0; index < 6; index++) {
    const entry = entries[index];
    const lane = document.createElement('div');
    lane.className = 'depth-lane';
    lane.style.left = (index * 100 / 6) + '%';
    const number = document.createElement('span');
    number.className = 'lane-number';
    number.textContent = 'Q' + (index + 1);
    lane.append(number);
    if (entry) {
      const depth = Math.max(0,Math.min(100,Number(entry.points) || 0));
      const label = entry.timedOut ? 'Time’s up' : entry.skipped ? 'Skipped' : entry.name;
      const description = 'Q' + (index + 1) + ' · ' + label + ' · ' + depth + '/100 depth · +' + depth + ' km · ' + time(entry.elapsedMs);
      const token = document.createElement(compact ? 'span' : 'button');
      if (!compact) token.type = 'button';
      token.className = 'depth-token';
      token.dataset.tier = depth >= 85 ? 'exceptional' : depth >= 65 ? 'rare' : depth ? 'common' : 'missed';
      token.style.top = depth + '%';
      token.title = description;
      token.setAttribute('aria-label',description);
      const score = document.createElement('strong');
      score.textContent = depth;
      const name = document.createElement('span');
      name.textContent = label;
      token.append(score,name);
      if (!compact) token.addEventListener('click', () => {
        for (const other of container.querySelectorAll('.depth-token')) other.setAttribute('aria-pressed','false');
        token.setAttribute('aria-pressed','true');
        find('ocean-inspect').textContent = description;
      });
      if (animate && animateAnswers && index === entries.length - 1) {
        sinking.push({token,lane,depth});
      }
      lane.append(token);
    }
    water.append(lane);
  }
  container.append(water);
  // The surface frame is shown first; movement begins after the view has returned to the ocean.
  for (const item of sinking) playDrop(item);
  if (!compact) {
    const latest = entries.at(-1);
    find('ocean-inspect').textContent = latest ? 'Latest: ' + (latest.timedOut ? 'Time’s up' : latest.skipped ? 'Skipped' : latest.name) +
      ' · ' + latest.points + '/100 depth · Select a marker for details.' : 'Your answers will appear here. Rarer answers sink deeper.';
  }
}

function playDrop({token,lane,depth}) {
  activeDrops.get(token)?.();
  const ripple = document.createElement('span');
  ripple.className = 'surface-ripple';
  ripple.setAttribute('aria-hidden','true');
  lane.append(ripple);
  ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
  const bubbles = document.createElement('span');
  bubbles.className = 'token-bubbles';
  bubbles.setAttribute('aria-hidden','true');
  for (let i=0;depth>0 && i<5;i++) {
    const bubble = document.createElement('i');
    bubble.style.setProperty('--bubble-x',(15+i*14)+'%');
    bubble.style.setProperty('--bubble-delay',(600+i*140)+'ms');
    bubbles.append(bubble);
  }
  token.append(bubbles);
  token.classList.add('is-sinking');
  const cancel = dropAnswer({token,score:token.querySelector('strong'),depth,onFinish:()=>{
    token.classList.remove('is-sinking');
    bubbles.remove();
    ripple.remove();
    activeDrops.delete(token);
  }});
  activeDrops.set(token,cancel);
}

function setAnswerMotion(enabled) {
  animateAnswers = enabled;
  find('motion-toggle').setAttribute('aria-pressed',String(enabled));
  find('motion-toggle').textContent = 'Animation: ' + (enabled ? 'on' : 'off');
  if (!enabled) for (const cancel of [...activeDrops.values()]) cancel();
}

function renderDistance(distance, goal, previous) {
  cancelAnimationFrame(scoreFrame);
  const stadium = find('stadium');
  const display = find('distance');
  const gain = find('distance-gain');
  const progress = find('progress');
  const scored = previous !== undefined && distance > previous;
  const reached = scored && previous < goal && distance >= goal;
  stadium.classList.toggle('arrival', reached);
  gain.hidden = !scored;
  gain.textContent = scored ? '+' + (distance - previous) + ' KM' : '';
  find('route-target').textContent = distance >= goal ? '400 km target reached' : (goal - distance) + ' km to expedition target';
  progress.max = goal;
  function show(value) {
    display.textContent = value;
    progress.value = Math.min(value, goal);
  }
  if (!scored || reduceMotion.matches) {
    show(distance);
    return;
  }
  show(previous);
  const started = performance.now();
  function tick(now) {
    const step = Math.min(1, (now - started) / 420);
    show(Math.round(previous + (distance - previous) * (1 - (1 - step) ** 3)));
    if (step < 1) scoreFrame = requestAnimationFrame(tick);
  }
  scoreFrame = requestAnimationFrame(tick);
}

function renderQuestion(run, previousDistance) {
  const question = run.question;
  const entry = run.entries[run.active];
  find('question-count').textContent = 'QUESTION ' + (run.active + 1) + ' / ' + state.round.questionCount;
  find('category').textContent = (run.mode === 'practice' ? 'Practice · ' : '') + question.category + (question.difficulty ? ' · ' + question.difficulty : '');
  find('question').textContent = question.prompt;
  find('steps').replaceChildren(...Array.from({length:state.round.questionCount},(_, index) => {
    const step = document.createElement('span');
    const answer = run.entries[index];
    step.className = answer ? answer.points > 0 ? 'scored' : 'missed' : index === run.active ? 'current' : '';
    return step;
  }));
  form.hidden = !run.ready;
  find('feedback').hidden = run.ready;
  if (run.ready) {
    form.reset();
    rejectedAnswer = null;
    form.querySelector('button[type="submit"]').disabled = false;
    input.removeAttribute('aria-invalid');
    hint.textContent = '';
    input.placeholder = placeholders[question.kind];
    return;
  }
  find('watch-drop').hidden = entry.points <= 0;
  const { goal } = state.round;
  const clinched = previousDistance !== undefined && previousDistance < goal && run.distance >= goal;
  find('feedback').dataset.good = String(entry.points > 0);
  find('feedback').dataset.moment = clinched ? 'arrival' : entry.points >= 85 ? 'rare' : '';
  find('feedback-kicker').textContent = clinched ? 'TARGET REACHED' : entry.points ? rarity[entry.points] : 'AT THE SURFACE';
  find('feedback-title').textContent = entry.points ? '+' + entry.points + ' km'
    : entry.timedOut ? 'Time’s up' : entry.skipped ? 'Question skipped' : 'Answer not accepted';
  find('feedback-detail').textContent = entry.skipped ? '' : entry.name + ' · ' + time(entry.elapsedMs);
  const remaining = goal - run.distance;
  const left = state.round.questionCount - run.active - 1;
  find('feedback-target').textContent = clinched && left === 0 ? 'You reached the expedition target on the final question.'
    : remaining <= 0 ? 'You’ve reached the expedition target.'
    : left === 0 ? remaining + ' km short of the expedition target.' : remaining + ' km to target · ' + left + (left === 1 ? ' question left' : ' questions left');
  find('next-label').textContent = run.active + 1 === state.round.questionCount ? 'See result' : 'Next question';
}

function updateSchedule() {
  if (!state) return;
  const status = find('daily-status');
  find('today-link').hidden = !state.archived;
  if (state.archived || state.nextAt === null) {
    status.textContent = state.archived ? 'PAST CHALLENGE' : 'LATEST CHALLENGE';
    return;
  }
  const remaining = Math.max(0, Math.ceil((state.nextAt - Date.now()) / 1000));
  if (!remaining) {
    find('today-link').hidden = false;
    status.textContent = 'NEW ROUND AVAILABLE';
    return;
  }
  const clock = [Math.floor(remaining / 3600), Math.floor(remaining / 60) % 60, remaining % 60]
    .map(part => String(part).padStart(2,'0')).join(':');
  status.textContent = 'NEXT ROUND IN ' + clock;
}

function roundUrl(includeMode = false) {
  const url = new URL('./', location.href);
  url.searchParams.set('round', state.round.date);
  if (includeMode && state.run?.mode === 'practice') url.searchParams.set('mode','practice');
  const friend = new URL(location.href).searchParams.get('friend');
  if (includeMode && friend) url.searchParams.set('friend',friend);
  return url;
}

function revealPlay() {
  // Wait for the compact game layout before scrolling, including on timed-out answers.
  requestAnimationFrame(() => find('play-screen').scrollIntoView({
    block:'start', behavior:'instant',
  }));
}

async function start() {
  if (!state) return;
  const { run } = await api('start', { mode: state.mode });
  state.run = run;
  history.replaceState(null,'',roundUrl(true));
  render();
  revealPlay();
  if (run.ready) input.focus({preventScroll:true});
}

function updateQuestionTimer() {
  const now = performance.now();
  const playing = !document.hidden && !find('play-screen').hidden;
  if (deadline !== null) {
    const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
    const timer = find('question-timer');
    timer.dataset.low = String(seconds <= 5);
    find('timer-value').textContent = '0:' + String(seconds).padStart(2,'0');
    if (seconds === 0 && playing && !busy && now >= retryAt) {
      retryAt = now + 1500;
      perform(() => sendAnswer(false, true));
    }
  }
  if (advanceAt !== null && playing && !busy && now >= advanceAt && now >= retryAt) {
    retryAt = now + 1500;
    perform(next);
  }
}

async function sendAnswer(skip, timeout = false) {
  const run = state?.run;
  if (!run?.ready) return;
  if (!skip && !timeout && !input.value.trim()) {
    hint.textContent = 'Enter an answer or skip this question.';
    input.focus();
    return;
  }
  if (!skip && !timeout && input.value === rejectedAnswer) return;
  const submitted = input.value;
  const response = await api('answer', {id:run.id,mode:run.mode,index:run.active,answer:submitted,skip,timeout});
  if (response.run?.ready && response.run.id === run.id && response.run.active === run.active && timeout) {
    deadline = performance.now() + response.run.remainingMs;
    return;
  }
  if (response.hint) {
    if (input.value === submitted) {
      rejectedAnswer = submitted;
      hint.textContent = response.hint;
      input.setAttribute('aria-invalid','true');
      form.querySelector('button[type="submit"]').disabled = true;
      input.focus({preventScroll:true});
    }
    return;
  }
  state.run = response.run;
  const accepted = response.run.id === run.id && response.run.active === run.active && !response.run.ready;
  render(accepted ? run.distance : undefined);
  revealPlay();
  find('next').focus({preventScroll:true});
}

async function next() {
  const run = state?.run;
  if (!run || run.ready || run.completed) return;
  state.run = (await api('next',{id:run.id,mode:run.mode,index:run.active})).run;
  render();
  revealPlay();
  (state.run.completed ? find('share') : input).focus({preventScroll:true});
}

function time(ms) {
  if (ms === null || ms === undefined) return '—';
  return ms < 60000 ? (ms / 1000).toFixed(1) + ' s' : Math.floor(ms / 60000) + 'm ' + Math.floor(ms / 1000 % 60) + 's';
}

function renderResult(run) {
  const { round } = state;
  const reached = run.distance >= round.goal;
  find('result-heading').textContent = reached ? 'Into legendary waters.' : run.distance >= 250 ? 'A dive to remember.' : 'There’s more beneath the surface.';
  find('result-detail').textContent = run.distance + ' km · ' + run.correct + '/' + round.questionCount + ' correct' +
    (reached ? '' : ' · ' + (round.goal - run.distance) + ' km to the expedition target');
  find('result').dataset.reached = String(reached);
  find('answer-recap').replaceChildren(...run.entries.map((entry, index) => {
    const item = document.createElement('div');
    item.dataset.scored = String(entry.points > 0);
    item.textContent = 'Q' + (index + 1) + ' · ' + entry.points + ' km';
    return item;
  }));
  const best = run.entries.reduce((winner, entry, index) => entry.points > (winner?.points ?? 0) ? {...entry,index} : winner, null);
  find('dive-highlights').replaceChildren(
    stat('Deepest answer', best ? best.name + ' · ' + best.points + '/100' : 'No depth scored'),
    stat('Rare discoveries',run.entries.filter(entry => entry.points >= 65).length + '/' + round.questionCount),
    stat('Average depth',Math.round(run.distance / round.questionCount) + '/100'),
  );
  find('result-mode').textContent = (run.mode === 'ranked' ? 'Ranked round' : 'Practice round') + ' · ' + time(run.answerMs) + ' answer time';
  find('share-status').textContent = '';
  find('share-copy').hidden = true;
  find('replay').hidden = false;
  find('challenge-friend').hidden = run.mode !== 'ranked';
  find('review').open = false;
  find('review-list').replaceChildren(...run.review.map((question,index) => {
    const entry = run.entries[index];
    const item = document.createElement('li');
    const selected = document.createElement('strong');
    selected.textContent = entry.timedOut ? 'Time’s up · ' + time(entry.elapsedMs) : entry.skipped ? 'Skipped' : entry.name + ' · +' + entry.points + ' km · ' + time(entry.elapsedMs);
    item.append(question.prompt,document.createElement('br'),selected);
    const answers = document.createElement('details');
    answers.className = 'all-answers';
    const heading = document.createElement('summary');
    heading.textContent = 'All answers' + (question.allAnswers ? ' · ' + question.allAnswers.length : ' · Locked');
    answers.append(heading);
    if (question.allAnswers) {
      const list = document.createElement('div');
      list.className = 'answer-ranking';
      const best = question.allAnswers[0]?.points;
      for (const answer of question.allAnswers) {
        const row = document.createElement('div');
        row.className = 'answer-ranking-row';
        const yours = entry.points > 0 && entry.name === answer.name;
        row.classList.toggle('your-answer', yours);
        const name = document.createElement('span');
        name.textContent = answer.name;
        if (yours || answer.points === best) {
          const badge = document.createElement('small');
          badge.textContent = [yours && 'Your answer', answer.points === best && 'Best answer'].filter(Boolean).join(' · ');
          name.append(badge);
        }
        const points = document.createElement('strong');
        points.textContent = answer.points + ' km';
        row.append(name, points);
        list.append(row);
      }
      const source = document.createElement('a');
      source.textContent = 'Source: ' + question.sourceName;
      source.href = question.source;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      answers.append(list, source);
    } else {
      const note = document.createElement('p');
      note.textContent = 'Today’s answers unlock after the daily round ends at 00:00 UTC. Finish a previous day’s round to see its answers immediately.';
      answers.append(note);
    }
    item.append(answers);
    return item;
  }));
}

function renderFriend(run) {
  const { friend, invalidFriend, round } = state;
  find('friend-banner').hidden = !invalidFriend && (!friend || friend.isOwn);
  if (invalidFriend) {
    find('friend-heading').textContent = 'Challenge unavailable';
    find('friend-details').textContent = 'You can still play the round shown below.';
    find('friend-verdict').hidden = true;
    return;
  }
  if (!friend || friend.isOwn) return;
  find('friend-heading').textContent = 'Can you beat ' + friend.handle + '?';
  find('friend-details').textContent = friend.distance + ' km · ' + friend.correct + '/' + round.questionCount +
    ' correct · ' + time(friend.answerMs);
  const verdict = find('friend-verdict');
  verdict.hidden = !run?.completed;
  if (!run?.completed) return;
  const difference = run.distance - friend.distance || run.correct - friend.correct || friend.answerMs - run.answerMs;
  verdict.textContent = (difference === 0 ? 'It’s a draw.' : difference > 0 ? 'You won the challenge.' :
    friend.handle + ' won the challenge.') + ' Your run: ' + run.distance + ' km · ' + run.correct +
    '/' + round.questionCount + ' correct · ' + time(run.answerMs);
}

async function share(challenge = false) {
  const { run, round } = state;
  const url = roundUrl();
  if (challenge) url.searchParams.set('friend', run.id);
  const label = challenge ? 'Can you beat my Road to the Final score?' : 'Road to the Final · Challenge ' + round.number;
  const depths = run.entries.map(entry => entry.points >= 85 ? '🔵' : entry.points >= 65 ? '🟦' : entry.points > 0 ? '🟩' : '⬜').join('');
  const message = label + ' · Ocean edition\n' + depths + '\n' + run.distance + ' km · ' +
    run.correct + '/' + round.questionCount + ' correct\n' + url.href;
  try {
    if (navigator.share) { await navigator.share({text:message}); return; }
    await navigator.clipboard.writeText(message);
    find('share-status').textContent = challenge ? 'Challenge link copied.' : 'Result copied.';
  } catch (error) {
    if (error.name === 'AbortError') return;
    const fallback = find('share-copy');
    fallback.value = message;
    fallback.hidden = false;
    fallback.select();
  }
}

function stat(label, value) {
  const pair = document.createElement('dl');
  pair.className = 'profile-stat';
  const name = document.createElement('dt');
  const count = document.createElement('dd');
  name.textContent = label;
  count.textContent = value;
  pair.append(name,count);
  return pair;
}

async function showProfile() {
  const message = find('profile-status');
  find('profile-content').hidden = true;
  if (!state?.profile) {
    find('profile-heading').textContent = 'Profile';
    message.replaceChildren('Your stats are saved after you ',Object.assign(document.createElement('a'),{
      href:'#register',textContent:'register a profile',
    }),'.');
    return;
  }
  message.textContent = 'Loading your stats…';
  try {
    const {profile,totals,streak,history: rounds} = await api('profile');
    find('profile-heading').textContent = profile.handle;
    message.textContent = '';
    const accuracy = totals.questions ? Math.round(100 * totals.correct / totals.questions) + '%' : '—';
    find('profile-stats').replaceChildren(
      stat('Rounds played',totals.rounds),stat('Total distance',totals.distance + ' km'),
      stat('Accuracy',accuracy),stat('Best run',totals.best + ' km'),
      stat('Targets reached',totals.finals ?? 0),stat('Average answer',totals.submitted ? time(totals.averageMs) : '—'),
      stat('Fastest correct',time(totals.fastestMs)),
      stat('Current streak',streak.current + ' d'),stat('Best streak',streak.best + ' d'),
    );
    const rows = rounds.map((round) => {
      const item = document.createElement('details');
      item.className = 'history-entry';
      const heading = document.createElement('summary');
      heading.textContent = dayFormat.format(new Date(round.date)) + ' · ' + round.mode + ' · ' +
        round.distance + ' km · ' + round.correct + '/' + round.answers.length + ' correct' + (round.edition ? ' · ' + round.edition : '');
      const list = document.createElement('ol');
      for (const answer of round.answers) {
        const row = document.createElement('li');
        row.textContent = (answer.prompt ? answer.prompt + ' — ' : '') +
          (answer.timedOut ? 'Time’s up · ' + time(answer.elapsedMs) : answer.skipped ? 'Skipped' : answer.name + ' · +' + answer.points + ' km · ' + time(answer.elapsedMs));
        list.append(row);
      }
      const ocean = document.createElement('div');
      ocean.className = 'history-ocean';
      renderOcean(ocean, round.answers, {compact:true});
      item.append(heading,ocean,list);
      return item;
    });
    find('history-list').replaceChildren(...(rows.length ? rows : ['Your completed rounds will appear here.']));
    find('profile-content').hidden = false;
  } catch (error) { message.textContent = error.message; }
}

async function showArchive() {
  const message = find('archive-status');
  const list = find('archive-list');
  message.textContent = 'Loading previous rounds…';
  try {
    const { rounds } = await api('archive');
    message.textContent = rounds.length ? '' : 'Past rounds appear here after the daily round ends.';
    list.replaceChildren(...rounds.slice().reverse().map((round) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = '?round=' + round.date + '&mode=practice';
      link.textContent = 'Challenge ' + String(round.number).padStart(3, '0') + ' · ' +
        dayFormat.format(new Date(round.date)) + ' · Practice dive';
      item.append(link);
      return item;
    }));
  } catch (error) { message.textContent = error.message; }
}

async function showBoard() {
  const request = ++boardRequest;
  const message = find('board-status');
  find('board-table').hidden = true;
  message.textContent = 'Loading standings…';
  try {
    const { date, rows } = await api('leaderboard');
    if (request !== boardRequest) return;
    message.textContent = rows.length ? (scope === 'daily' ? dayFormat.format(new Date(date)) : 'All ranked rounds')
      : 'No ranked scores yet. Register a profile and finish a daily round to join.';
    find('board-rows').replaceChildren(...rows.map((entry,index) => {
      const row = document.createElement('tr');
      for (const value of [index + 1,entry.handle,entry.distance + ' km',entry.correct,time(entry.answerMs)]) {
        const cell = document.createElement('td');
        cell.textContent = value;
        row.append(cell);
      }
      return row;
    }));
    find('board-table').hidden = !rows.length;
  } catch (error) { if (request === boardRequest) message.textContent = error.message; }
}

find('motion-toggle').addEventListener('click',()=>setAnswerMotion(!animateAnswers));
find('watch-drop').addEventListener('click',()=>{
  const token = Array.from(find('ocean-board').querySelectorAll('.depth-token')).at(-1);
  const entry = state?.run?.entries.at(-1);
  if (!token || !entry) return;
  setAnswerMotion(true);
  revealPlay();
  playDrop({token,lane:token.parentElement,depth:entry.points});
});
find('start').disabled = true;
find('help').addEventListener('click',() => find('rules').showModal());
find('start').addEventListener('click',() => perform(start));
find('skip').addEventListener('click',() => perform(() => sendAnswer(true)));
find('next').addEventListener('click',() => perform(next));
find('share').addEventListener('click',() => share());
find('challenge-friend').addEventListener('click',() => share(true));
async function restartRound() {
  const run = state?.run;
  if (!run) return;
  const response = await api('restart',{id:run.id,mode:run.mode});
  state.run = response.run;
  state.mode = 'practice';
  deadline = null;
  advanceAt = null;
  retryAt = 0;
  history.replaceState(null,'',roundUrl(true));
  render();
  revealPlay();
  input.focus({preventScroll:true});
}
find('replay').addEventListener('click',() => perform(restartRound));
find('restart-game').addEventListener('click',() => perform(restartRound));
form.addEventListener('submit',(event) => {event.preventDefault(); perform(() => sendAnswer(false));});
input.addEventListener('input',() => {
  hint.textContent = '';
  rejectedAnswer = null;
  input.removeAttribute('aria-invalid');
  form.querySelector('button[type="submit"]').disabled = false;
});
find('register-form').addEventListener('submit',(event) => {
  event.preventDefault();
  perform(async () => {
    try {
      await api('register',{handle:find('handle').value});
      const url = new URL(location.href);
      url.searchParams.delete('mode');
      history.replaceState(null,'',url);
      state = await api('state');
      render();
      location.hash = 'profile';
    } catch (error) { find('register-status').textContent = error.message; }
  });
});
for (const button of document.querySelectorAll('[data-scope]')) button.addEventListener('click',() => {
  scope = button.dataset.scope;
  for (const item of document.querySelectorAll('[data-scope]')) item.setAttribute('aria-pressed',String(item === button));
  showBoard();
});
window.addEventListener('hashchange',setTab);
setInterval(updateSchedule,1000);
setInterval(updateQuestionTimer,200);
perform(async () => {
  state = await api('state');
  render();
  setTab();
});
