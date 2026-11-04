const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const WA = 'https://api.whatsapp.com/send?phone=556136246060';
const waLink = text => `${WA}&text=${encodeURIComponent(text)}`;
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Links de WhatsApp já com a mensagem certa
$$('[data-wa]').forEach(a => (a.href = waLink(a.dataset.wa)));

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
document.addEventListener('click', e => { if (!e.target.closest('.top')) toggleMenu(false); });

// Aparecer ao rolar, em cascata dentro de cada grupo
const seen = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  seen.unobserve(e.target);
}), { rootMargin: '0px 0px -8% 0px' });
$$('.reveal').forEach(el => {
  const i = [...el.parentElement.children].indexOf(el);
  el.style.setProperty('--d', `${(i % 5) * 0.07}s`);
  seen.observe(el);
});

// Item do menu da seção atual
const links = $$('.menu a[href^="#"]');
const spy = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.hash === `#${e.target.id}`));
}), { rootMargin: '-45% 0px -50% 0px' });
links.forEach(a => spy.observe($(a.hash)));

// Topo compacto e parallax das fotos
const header = $('.top'), layers = calm ? [] : $$('[data-parallax]');
let ticking = false;
const onScroll = () => {
  header.classList.toggle('stuck', scrollY > 20);
  layers.forEach(img => {
    const r = img.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    img.style.transform = `translateY(${(r.top + r.height / 2 - innerHeight / 2) * -img.dataset.parallax}px)`;
  });
  ticking = false;
};
addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
onScroll();

// Patinhas seguindo o mouse no topo da página
if (!calm && matchMedia('(pointer: fine)').matches) {
  let last = 0, side = 1;
  $('.hero').addEventListener('pointermove', e => {
    if (e.timeStamp - last < 130) return;
    last = e.timeStamp;
    side = -side;
    const paw = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    paw.setAttribute('class', 'trail');
    paw.setAttribute('aria-hidden', 'true');
    paw.innerHTML = '<use href="#i-paw"/>';
    paw.style.left = `${e.clientX + side * 12}px`;
    paw.style.top = `${e.clientY + 8}px`;
    paw.addEventListener('animationend', () => paw.remove());
    document.body.append(paw);
  });
}

// Abas
const tabs = $$('[role=tab]');
const selectTab = (tab, focus) => {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
  });
  tab.scrollIntoView({ block: 'nearest', inline: 'center' });
  if (focus) tab.focus();
};
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', e => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (step) selectTab(tabs[(i + step + tabs.length) % tabs.length], true);
  });
});

// Agendamento: monta a mensagem e abre o WhatsApp
const form = $('#form-agendar'), pet = $('#pet'), petErr = $('#pet-err');
$$('[data-servico]').forEach(a => a.addEventListener('click', () => (form.servico.value = a.dataset.servico)));
pet.addEventListener('input', () => { pet.classList.remove('bad'); petErr.hidden = true; });
form.addEventListener('submit', e => {
  e.preventDefault();
  const nome = pet.value.trim();
  if (!nome) {
    pet.classList.add('bad');
    petErr.hidden = false;
    pet.focus();
    return;
  }
  const especie = form.especie.value === 'outro' ? 'pet' : form.especie.value;
  open(waLink(`Olá! Quero agendar: ${form.servico.value}. Meu ${especie} se chama ${nome}.`), '_blank', 'noopener');
});

// Gerador de QR Code Pix
const valor = $('#valor'), canvas = $('#qr'), total = $('#pix-total'), copy = $('#pix-copy');
const save = $('#pix-save'), valorErr = $('#valor-err'), chips = $$('.amounts button');
const brl = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
let payload = '';

function drawQR(text) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount(), quiet = 4, scale = Math.floor(canvas.width / (n + quiet * 2));
  const size = (n + quiet * 2) * scale;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#2B1636'; // escuro o bastante para os leitores de QR
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * scale, (r + quiet) * scale, scale, scale);
  }
}

function setAmount(cents) {
  const amount = cents / 100, ok = cents > 0;
  valor.value = brl(amount);
  total.textContent = `R$ ${brl(amount)}`;
  chips.forEach(b => b.classList.toggle('on', +b.dataset.v * 100 === cents));
  valorErr.hidden = ok;
  canvas.classList.toggle('off', !ok);
  copy.disabled = !ok;
  save.hidden = !ok;
  if (!ok) { payload = ''; return; }
  payload = pixPayload(amount);
  canvas.width = canvas.height = 600;
  drawQR(payload);
  canvas.setAttribute('aria-label', `QR Code Pix de R$ ${brl(amount)}`);
  save.href = canvas.toDataURL('image/png');
  save.download = `pix-bichos-e-cia-${cents / 100}.png`;
  canvas.classList.remove('pop');
  void canvas.offsetWidth;
  canvas.classList.add('pop');
}

chips.forEach(b => b.addEventListener('click', () => setAmount(+b.dataset.v * 100)));
// Digitação estilo app de banco: os dígitos entram pelos centavos
valor.addEventListener('input', () => setAmount(Math.min(+valor.value.replace(/\D/g, '') || 0, 9999999)));
valor.addEventListener('focus', () => valor.select());

copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(payload);
  } catch { // navegador sem permissão de área de transferência
    const t = document.createElement('textarea');
    t.value = payload;
    document.body.append(t);
    t.select();
    document.execCommand('copy');
    t.remove();
  }
  const label = copy.textContent;
  copy.textContent = 'Copiado! Cole no app do banco';
  setTimeout(() => (copy.textContent = label), 2200);
});

setAmount(10000);
