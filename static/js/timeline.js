(function () {
if (!document.getElementById('railtrack')) return;
const MN = {10:'十月',9:'九月',8:'八月',7:'七月',6:'六月',5:'五月',4:'四月',3:'三月',2:'二月',1:'一月',12:'十二月',11:'十一月'};
const TN = { all:'全部内容', work:'💼 工作', game:'🎮 游戏', memory:'📖 记忆', note:'✏️ 随笔', moment:'💬 动态' };
const stream = document.getElementById('stream');
const CUR = window.__MEM.CUR;
const state = { y: CUR[0], m: CUR[1], type: 'moment', tag: 'all' };

function replayFade() { stream.style.animation = 'none'; void stream.offsetWidth; stream.style.animation = 'fadein .3s ease'; }

function applyFilters() {
  const monthAll = state.y === 'all' && state.m === 'all';
  let total = 0;
  document.querySelectorAll('.msc').forEach(sec => {
    const mHit = state.y === 'all' ? (state.m === 'all' || sec.dataset.m === state.m)
                                   : (sec.dataset.y === state.y && (state.m === 'all' || sec.dataset.m === state.m));
    let n = 0;
    sec.querySelectorAll('.moment,.card').forEach(el => {
      const tOk = state.type === 'all' || el.dataset.type === state.type;
      const gOk = state.tag === 'all' || (el.dataset.tag || '').split(',').includes(state.tag);
      const show = mHit && tOk && gOk;
      el.style.display = show ? '' : 'none';
      if (show) n++;
    });
    sec.style.display = (mHit && n > 0) ? '' : 'none';
    const c = sec.querySelector('.cnt');
    if (c) c.textContent = n + ' 条';
    total += n;
  });
  document.getElementById('empty').style.display = total ? 'none' : 'block';
  document.getElementById('emptyhint').textContent = (state.type === 'all' && state.tag === 'all')
    ? '时间机器空转了一圈——这个月还没有记忆，换个有内容的月份吧。'
    : '当前筛选组合下还没有内容——放宽筛选条件试试。';
  syncRail(monthAll);
  const link = document.getElementById('alllink');
  link.textContent = monthAll ? '⟶ 回到本月（2026 · 十月）' : '⟵ 查看全部时间轴';
  replayFade();
}

/* ===== 时光轨道 ===== */
const HASCNT = window.__MEM.COUNTS;
const RAILSEQ = (() => {
  const a = []; let y = +window.__MEM.FIRST[0], m = +window.__MEM.FIRST[1];
  while (y < +CUR[0] || (y === +CUR[0] && m <= 12)) { a.push([String(y), String(m)]); m++; if (m > 12) { m = 1; y++; } }
  return a;
})();
const CUR_IDX = RAILSEQ.findIndex(s => s[0] === CUR[0] && s[1] === CUR[1]);
const isFuture = (s) => (+s[0] > +CUR[0]) || (+s[0] === +CUR[0] && +s[1] > +CUR[1]);
const track = document.getElementById('railtrack');
const pctOf = (i) => RAILSEQ.length === 1 ? 50 : (i / (RAILSEQ.length - 1)) * 100;
RAILSEQ.forEach((s, i) => {
  if (i === 0 || s[1] === '1') {
    const d = document.createElement('div'); d.className = 'rdiv'; d.style.left = pctOf(i) + '%'; track.appendChild(d);
    const t = document.createElement('div'); t.className = 'ryear'; t.dataset.y = s[0]; t.style.left = pctOf(i) + '%'; t.textContent = s[0];
    t.addEventListener('click', () => { state.y = s[0]; state.m = 'all'; applyFilters(); });
    track.appendChild(t);
  }
  const fut = isFuture(s);
  const n = document.createElement('div');
  n.className = 'rnode' + (HASCNT[s[0] + '-' + s[1]] ? ' has' : '') + (fut ? ' future' : '');
  n.style.left = pctOf(i) + '%';
  n.title = fut ? (s[0] + ' · ' + MN[s[1]] + '（还没到）') : (s[0] + ' · ' + MN[s[1]]);
  if (!fut) n.addEventListener('click', () => { state.y = s[0]; state.m = s[1]; applyFilters(); });
  track.appendChild(n);
});
document.getElementById('rall').addEventListener('click', () => { state.y = 'all'; state.m = 'all'; applyFilters(); });

function syncRail(monthAll) {
  document.getElementById('rall').classList.toggle('on', monthAll);
  [...track.querySelectorAll('.rnode')].forEach((n, i) => {
    const s = RAILSEQ[i];
    n.classList.toggle('on', !monthAll && s[0] === state.y && s[1] === state.m);
  });
  [...track.querySelectorAll('.ryear')].forEach(t => t.classList.toggle('on', !monthAll && state.m === 'all' && t.dataset.y === state.y));
  const prog = document.getElementById('rprog');
  if (monthAll) {
    document.getElementById('rd-y').textContent = '全部时间';
    document.getElementById('rd-m').textContent = '';
    prog.style.width = '100%'; prog.classList.add('dim');
  } else if (state.m === 'all') {
    const idxs = RAILSEQ.map((s, i) => s[0] === state.y ? i : -1).filter(i => i >= 0);
    document.getElementById('rd-y').textContent = state.y;
    document.getElementById('rd-m').textContent = '全年';
    prog.style.width = pctOf(idxs[idxs.length - 1]) + '%'; prog.classList.remove('dim');
  } else {
    const i = RAILSEQ.findIndex(s => s[0] === state.y && s[1] === state.m);
    document.getElementById('rd-y').textContent = state.y;
    document.getElementById('rd-m').textContent = MN[state.m];
    prog.style.width = pctOf(i) + '%'; prog.classList.remove('dim');
  }
}

document.getElementById('prev').addEventListener('click', () => {
  if (state.y === 'all' || state.m === 'all') { state.y = CUR[0]; state.m = CUR[1]; applyFilters(); return; }
  const i = RAILSEQ.findIndex(s => s[0] === state.y && s[1] === state.m);
  if (i > 0) { state.y = RAILSEQ[i - 1][0]; state.m = RAILSEQ[i - 1][1]; applyFilters(); }
});
document.getElementById('next').addEventListener('click', () => {
  if (state.y === 'all' || state.m === 'all') { state.y = CUR[0]; state.m = CUR[1]; applyFilters(); return; }
  const i = RAILSEQ.findIndex(s => s[0] === state.y && s[1] === state.m);
  if (i > -1 && i < CUR_IDX) { state.y = RAILSEQ[i + 1][0]; state.m = RAILSEQ[i + 1][1]; applyFilters(); }
});

document.getElementById('alllink').addEventListener('click', () => {
  if (state.y === 'all' && state.m === 'all') { state.y = CUR[0]; state.m = CUR[1]; }
  else { state.y = 'all'; state.m = 'all'; }
  applyFilters();
});

document.getElementById('logo').addEventListener('click', () => {
  state.y = CUR[0]; state.m = CUR[1]; state.type = 'moment'; state.tag = 'all';
  document.querySelectorAll('.frow.main .chip').forEach(x => x.classList.toggle('on', x.dataset.type === 'moment'));
  document.getElementById('subrow').style.display = 'none';
  applyFilters();
});

document.querySelectorAll('.frow.main .chip').forEach(c => c.addEventListener('click', () => {
  document.querySelectorAll('.frow.main .chip').forEach(x => x.classList.remove('on'));
  c.classList.add('on');
  state.type = c.dataset.type;
  if (c.dataset.sub !== '1') state.tag = 'all';
  document.getElementById('subrow').style.display = c.dataset.sub === '1' ? 'flex' : 'none';
  document.querySelectorAll('#subrow .chip').forEach(x => x.classList.toggle('on', x.dataset.tag === state.tag));
  applyFilters();
}));
document.querySelectorAll('#subrow .chip').forEach(c => c.addEventListener('click', () => {
  document.querySelectorAll('#subrow .chip').forEach(x => x.classList.remove('on'));
  c.classList.add('on');
  state.tag = c.dataset.tag;
  applyFilters();
}));

applyFilters();
})();
