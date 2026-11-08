// Bichos & Cia, proposta de redesign: menu, revelacao, WhatsApp, agendamento, Pix e slides.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const WA = 'https://api.whatsapp.com/send?phone=556136246060';
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Links de WhatsApp com a mensagem pronta (abrem em nova aba)
$$('[data-wa]').forEach(a => {
  a.href = `${WA}&text=${encodeURIComponent(a.dataset.wa)}`;
  a.target = '_blank'; a.rel = 'noopener';
});

// Menu do celular
const burger = $('.burger'), menu = $('#menu');
const toggleMenu = open => {
  menu.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
};
burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
menu.addEventListener('click', e => e.target.closest('a') && toggleMenu(false));
document.addEventListener('keydown', e => e.key === 'Escape' && toggleMenu(false));

// Topo com linha ao rolar
const topo = $('.top');
addEventListener('scroll', () => topo.classList.toggle('stuck', scrollY > 10), { passive: true });

// Aparecer ao rolar, em cascata dentro de cada grupo
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -8% 0px' });
$$('.rv').forEach(el => {
  el.style.setProperty('--d', `${([...el.parentElement.children].indexOf(el) % 5) * 0.07}s`);
  io.observe(el);
});

// Item do menu da secao atual
const links = $$('.menu a[href^="#"]');
const spy = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.hash === `#${e.target.id}`));
}), { rootMargin: '-45% 0px -50% 0px' });
links.forEach(a => $(a.hash) && spy.observe($(a.hash)));

// Agendamento: monta a mensagem e abre o WhatsApp
const form = $('#form-agendar'), pet = $('#pet'), petErr = $('#pet-err');
$$('[data-servico]').forEach(a => a.addEventListener('click', () => (form.servico.value = a.dataset.servico)));
pet.addEventListener('input', () => { pet.classList.remove('bad'); petErr.hidden = true; });
form.addEventListener('submit', e => {
  e.preventDefault();
  const nome = pet.value.trim();
  if (!nome) { pet.classList.add('bad'); petErr.hidden = false; pet.focus(); return; }
  const especie = form.especie.value === 'outro' ? 'pet' : form.especie.value;
  open(`${WA}&text=${encodeURIComponent(`Olá! Quero agendar: ${form.servico.value}. Meu ${especie} se chama ${nome}.`)}`, '_blank', 'noopener');
});

// Gerador de QR Code Pix (mesma logica do site atual)
const valor = $('#valor'), canvas = $('#qr'), total = $('#pix-total'), copy = $('#pix-copy');
const save = $('#pix-save'), valorErr = $('#valor-err'), chips = $$('.amounts button');
const brl = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
let payload = '';
function drawQR(text) {
  const qr = qrcode(0, 'M'); qr.addData(text); qr.make();
  const n = qr.getModuleCount(), quiet = 4, scale = Math.floor(canvas.width / (n + quiet * 2)), size = (n + quiet * 2) * scale;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#1E1B2E';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
}
function setAmount(cents) {
  const amount = cents / 100, ok = cents > 0;
  valor.value = brl(amount); total.textContent = `R$ ${brl(amount)}`;
  chips.forEach(b => b.classList.toggle('on', +b.dataset.v * 100 === cents));
  valorErr.hidden = ok; canvas.classList.toggle('off', !ok); copy.disabled = !ok; save.hidden = !ok;
  if (!ok) { payload = ''; return; }
  payload = pixPayload(amount);
  canvas.width = canvas.height = 600; drawQR(payload);
  canvas.setAttribute('aria-label', `QR Code Pix de R$ ${brl(amount)}`);
  save.href = canvas.toDataURL('image/png'); save.download = `pix-bichos-e-cia-${amount}.png`;
  canvas.classList.remove('pop'); void canvas.offsetWidth; canvas.classList.add('pop');
}
chips.forEach(b => b.addEventListener('click', () => setAmount(+b.dataset.v * 100)));
valor.addEventListener('input', () => setAmount(Math.min(+valor.value.replace(/\D/g, '') || 0, 9999999)));
valor.addEventListener('focus', () => valor.select());
copy.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(payload); }
  catch { const t = document.createElement('textarea'); t.value = payload; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
  const label = copy.textContent; copy.textContent = 'Copiado! Cole no app do banco';
  setTimeout(() => (copy.textContent = label), 2200);
});
setAmount(10000);

// Slides no PC: primeira tela = inicio + atalhos; cada secao preenche a tela (zoom 66% a 150%)
const slides = $$('main>section');
const padTopo = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
function encaixa() {
  const desktop = innerWidth > 900, util = innerHeight - padTopo();
  const hero = $('.hero'), faixa = $('.ticker'), atalhos = $('.quick');
  hero.style.height = hero.style.minHeight = '';
  if (desktop) { hero.style.minHeight = '0'; hero.style.height = Math.max(480, innerHeight - hero.offsetTop - faixa.offsetHeight - atalhos.offsetHeight) + 'px'; }
  slides.forEach(sec => {
    const w = sec.querySelector(':scope > .wrap');
    if (!w || sec === hero) return;
    w.style.zoom = '';
    if (!desktop) return;
    sec.style.minHeight = '0';
    const extra = sec.offsetHeight - w.offsetHeight;
    sec.style.minHeight = '';
    const z = Math.min((util - extra) / w.offsetHeight, (innerWidth * 0.96) / w.offsetWidth);
    w.style.zoom = Math.min(1.5, Math.max(0.66, z)).toFixed(3);
  });
}
encaixa();
addEventListener('load', encaixa);
document.fonts?.ready.then(encaixa);
let tEnc; addEventListener('resize', () => { clearTimeout(tEnc); tEnc = setTimeout(encaixa, 150); });

if (matchMedia('(pointer:fine)').matches) {
  const alvoDe = el => {
    if (el === slides[0]) return 0;
    const max = document.documentElement.scrollHeight - innerHeight, p = padTopo(), vh = innerHeight - p, alt = el.offsetHeight;
    const topo = el.getBoundingClientRect().top + scrollY - p;
    return Math.round(Math.min(max, Math.max(0, alt < vh ? topo - (vh - alt) / 2 : topo)));
  };
  let animando = false, ultimo = 0, tFim;
  const fim = () => { animando = false; clearTimeout(tFim); };
  addEventListener('scrollend', fim);
  addEventListener('wheel', e => {
    if (e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX) || menu.classList.contains('open')) return;
    e.preventDefault();
    const agora = performance.now(), novo = agora - ultimo > 220; ultimo = agora;
    if (animando || !novo || Math.abs(e.deltaY) < 2) return;
    const y = scrollY, lista = [...slides.map(alvoDe), document.documentElement.scrollHeight - innerHeight];
    const alvo = e.deltaY > 0 ? lista.find(a => a > y + 4) : [...lista].reverse().find(a => a < y - 4);
    if (alvo === undefined) return;
    animando = true; scrollTo({ top: alvo, behavior: calm ? 'auto' : 'smooth' });
    clearTimeout(tFim); tFim = setTimeout(fim, 1000);
  }, { passive: false });
}

// Primeira tela (igual ao site anterior): foto com profundidade e patinhas seguindo o mouse
const camadas = calm ? [] : $$('[data-parallax]');
const parallax = () => camadas.forEach(img => {
  const r = img.parentElement.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) return;
  img.style.transform = `translateY(${(r.top + r.height / 2 - innerHeight / 2) * -img.dataset.parallax}px)`;
});
let tick = false;
addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { parallax(); tick = false; }); } }, { passive: true });
parallax();
if (!calm && matchMedia('(pointer: fine)').matches) {
  let last = 0, side = 1;
  $('.hero').addEventListener('pointermove', e => {
    if (e.timeStamp - last < 130) return;
    last = e.timeStamp; side = -side;
    const paw = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    paw.setAttribute('class', 'trail'); paw.setAttribute('aria-hidden', 'true');
    paw.innerHTML = '<use href="#i-paw"/>';
    paw.style.left = `${e.clientX + side * 12}px`; paw.style.top = `${e.clientY + 8}px`;
    paw.addEventListener('animationend', () => paw.remove());
    document.body.append(paw);
  });
}

// inclinacao suave dos cartoes com o mouse (so com mouse e sem preferencia de menos movimento)
if (!calm && matchMedia('(hover:hover)').matches) {
  document.querySelectorAll('.group,.feat-sm,.sc,.pix-card').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(800px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}
