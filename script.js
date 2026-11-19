
'use strict';

/* ===== EDITABLE SETTINGS ===== */
const WA = {
  '919330452266': '+91 93304 52266',
  '919091475530': '+91 90914 75530'
};

const UPI_ID = 'chinya91@fam';
const QR_SRC = 'images/upi-qr.jpg';

const CARDS = [
  { id: 'silver', name: 'SEE CARD SILVER', price: 1500, short: 'Brushed metallic elegance with a clean, understated finish.', d: 'Metallic silver artwork with soft highlights' },
  { id: 'gold', name: 'SEE CARD GOLD', price: 2500, short: 'Warm luxury gold with rich, textured highlights.', d: 'Luxury gold finish with premium texture' },
  { id: 'platinum', name: 'SEE CARD PLATINUM', price: 4000, short: 'Brushed platinum detailing with refined precision.', d: 'Brushed platinum finish with fine detailing' },
  { id: 'elite', name: 'SEE CARD ELITE', price: 5200, short: 'A modern futuristic gradient made to stand out.', d: 'Futuristic multi-colour gradient artwork' },
  { id: 'royal', name: 'SEE CARD ROYAL', price: 7000, short: 'Deep purple with regal gold accents.', d: 'Deep purple design with gold accents' },
  { id: 'black', name: 'SEE CARD BLACK', price: 9000, short: 'Matte black with subtle metallic details.', d: 'Matte black finish with subtle metallic details' }
];

/* ===== HELPERS ===== */
const $ = s => document.querySelector(s);
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const find = id => CARDS.find(c => c.id === id);
const total = () => Object.entries(cart).reduce((s, [i, q]) => s + find(i).price * q, 0);

let cart = {};

function toast(m) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = m;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

const L4 = {
  silver: '4821',
  gold: '7305',
  platinum: '1962',
  elite: '5547',
  royal: '8036',
  black: '2719'
};

const art = c => `
<div class="vcard ${c.id}">
<span class="ic"></span>
<b class="vb">SEE CARD</b>
<span class="vc">DIGITAL COLLECTIBLE</span>
<i class="vn">${c.id.toUpperCase()} EDITION</i>
<span class="vnum">XXXX XXXX XXXX ${L4[c.id]}</span>
<span class="vh">CARDHOLDER NAME</span>
<span class="vcv">CVV XXX</span>
</div>`;

function qrFor(a) {
  try {
    if (a && typeof qrcode === 'function') {
      const q = qrcode(0, 'M');
      q.addData(`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent('SEE CARD')}&am=${Number(a).toFixed(2)}&cu=INR&tn=${encodeURIComponent('SEE CARD order')}`);
      q.make();
      return `<div class="qrdyn">${q.createSvgTag(4, 2)}</div><small style="color:var(--mu)">This QR already includes ${inr(a)}</small>`;
    }
  } catch (e) {}

  return `<img class="qrimg" src="${QR_SRC}" alt="UPI QR code">`;
}

const payBox = a => `
<div class="demo">
<h4>Pay via UPI</h4>
${qrFor(a)}
<div>UPI ID: <b>${UPI_ID}</b>
<button class="btn small" id="cp" style="padding:4px 10px;margin:0 0 0 6px">Copy</button>
</div>
${a ? `<div>Amount: <b>${inr(a)}</b></div>` : ''}
<small style="display:block;color:var(--mu);margin-top:6px">
Scan with any UPI app and pay the amount shown, then send the payment screenshot on WhatsApp. Your order is confirmed only after the store verifies the payment.
</small>
</div>`;

const bindCp = () => {
  const b = $('#cp');
  if (b) b.onclick = () =>
    navigator.clipboard.writeText(UPI_ID).then(
      () => toast('UPI ID copied'),
      () => toast('Please copy the UPI ID manually')
    );
};

function add(id) {
  cart[id] = (cart[id] || 0) + 1;
  toast(find(id).name + ' added to cart');
  renderCart();
}

/* ===== PRODUCT GRID ===== */
CARDS.forEach(c => {
  const el = document.createElement('article');
  el.className = 'pcard';

  el.innerHTML = `
  <div class="artbox">${art(c)}</div>
  <h3>${c.name}</h3>
  <p class="rows">${c.short}</p>
  <div class="price">${inr(c.price)}</div>
  <div class="two">
  <button class="btn ghost" data-a="v">View Details</button>
  <button class="btn primary" data-a="b">Buy Now</button>
  </div>`;

  el.onclick = e => {
    const a = e.target.dataset.a;
    if (a === 'v') details(c);
    if (a === 'b') {
      add(c.id);
      openCheckout();
    }
  };

  $('#memGrid').appendChild(el);
});

/* ===== CART ===== */
function renderCart() {
  const ids = Object.keys(cart);

  $('#cartCount').textContent =
    ids.reduce((s, i) => s + cart[i], 0);

  $('#cartList').innerHTML = ids.length
    ? ids.map(id => {
        const p = find(id);
        return `
        <div class="line">
        <button class="rm" data-rm="${id}">Remove</button>
        <b>${p.name}</b>
        <div class="qty">
        <button data-c="-" data-id="${id}">−</button>
        <b>${cart[id]}</b>
        <button data-c="+" data-id="${id}">+</button>
        </div>
        <small>${inr(p.price)} × ${cart[id]} = <b>${inr(p.price * cart[id])}</b></small>
        </div>`;
      }).join('')
    : '<p class="sub">Your cart is empty.</p>';

  $('#cartSum').innerHTML =
    `<div class="tot"><span>Payable</span><span>${inr(total())}</span></div>`;
}

$('#cartList').onclick = e => {
  const d = e.target.dataset;

  if (d.rm) delete cart[d.rm];

  if (d.c) {
    cart[d.id] += d.c === '+' ? 1 : -1;
    if (cart[d.id] < 1) delete cart[d.id];
  }

  renderCart();
};

const drawer = $('#drawer');

$('#openCart').onclick = () => drawer.classList.add('open');

document.querySelectorAll('[data-close]').forEach(
  b => b.onclick = () => drawer.classList.remove('open')
);

/* ===== MODAL, DETAILS, CHECKOUT ===== */
const modal = $('#modal');
const box = $('#modalBox');

const closeModal = () => modal.classList.remove('open');

const openModal = h => {
  box.innerHTML = h +
    '<button class="btn ghost" id="mc" style="margin-top:12px">Close</button>';
  modal.classList.add('open');
  $('#mc').onclick = closeModal;
};

modal.onclick = e => {
  if (e.target === modal) closeModal();
};

function details(c) {
  openModal(`
  ${art(c)}
  <h3 style="margin-top:16px">${c.name} — ${inr(c.price)}</h3>
  <p>${c.short}</p>
  <ul>
  <li>${c.d}</li>
  <li>Original decorative chip-inspired SEE CARD artwork</li>
  <li>Card number, name and CVV shown are demo placeholders, not real details</li>
  <li>Fictional digital collectible; not a bank-issued debit or credit card</li>
  </ul>
  ${payBox(c.price)}
  <div class="two">
  <button class="btn ghost" id="da">Add to Cart</button>
  <button class="btn primary" id="db">Buy Now</button>
  </div>`);

  bindCp();

  $('#da').onclick = () => {
    add(c.id);
    closeModal();
  };

  $('#db').onclick = () => {
    add(c.id);
    openCheckout();
  };
}

function openCheckout() {
  if (!Object.keys(cart).length)
    return toast('Your cart is empty');

  drawer.classList.remove('open');

  const rows = Object.entries(cart).map(([id, q]) =>
    `<div>${find(id).name} × ${q} <b style="float:right">${inr(find(id).price * q)}</b></div>`
  ).join('');

  openModal(`
  <h3>Checkout</h3>
  <label>Customer Name</label>
  <input id="cn" placeholder="Your name" autocomplete="name">

  <label>Your WhatsApp Number</label>
  <input id="cw" inputmode="tel" placeholder="10-digit number" autocomplete="tel">

  <label>Email (optional)</label>
  <input id="ce" type="email" placeholder="you@example.com" autocomplete="email">

  <label>Send order to</label>
  <select id="cs">
  ${Object.entries(WA).map(([k, v]) =>
    `<option value="${k}">${v}</option>`
  ).join('')}
  </select>

  <div class="glass">
  <b>Order Summary</b>
  ${rows}
  <hr style="border-color:var(--line)">
  <b>Total: ${inr(total())}</b>
  </div>

  ${payBox(total())}

  <a class="btn primary" id="po" target="_blank" rel="noopener"
  href="https://wa.me/919330452266"
  style="display:block;width:100%">PLACE ORDER ON WHATSAPP</a>

  <small style="display:block;margin-top:10px;color:var(--mu)">
  WhatsApp didn’t open?
  <a id="pl" href="https://wa.me/919330452266" target="_blank" rel="noopener"
  style="color:#E8D5A3;text-decoration:underline">Tap here</a>
  or
  <button id="cm" style="background:none;border:0;color:#E8D5A3;text-decoration:underline;padding:0">copy the order message</button>.
  </small>`);

  bindCp();

  const msgText = () => {
    const n = $('#cn').value.trim();
    const w = $('#cw').value.replace(/\D/g, '');
    const em = $('#ce').value.trim();

    const lines = Object.entries(cart).map(([id, q]) =>
      `• ${find(id).name} × ${q} = ${inr(find(id).price * q)}`
    );

    return {
      n,
      w,
      msg: `Hello SEE CARD, I want to purchase the following:

${lines.join('\n')}

*Total: ${inr(total())}*

*My details*
Name: ${n || '-'}
WhatsApp: ${w || '-'}${em ? '\nEmail: ' + em : ''}

I will pay via UPI (${UPI_ID}) and send the payment screenshot here.`
    };
  };

  const sync = () => {
    const o = msgText();
    const u = `https://api.whatsapp.com/send?phone=${$('#cs').value}&text=${encodeURIComponent(o.msg)}`;

    $('#po').href = u;
    $('#pl').href = u;

    return { ...o, url: u };
  };

  ['cn', 'cw', 'ce', 'cs'].forEach(i => {
    $('#' + i).addEventListener('input', sync);
    $('#' + i).addEventListener('change', sync);
  });

  sync();

  $('#po').onclick = e => {
    const o = sync();

    if (o.n.length < 2) {
      e.preventDefault();
      return toast('Please enter your name');
    }

    if (!/^\d{10,13}$/.test(o.w)) {
      e.preventDefault();
      return toast('Enter a valid WhatsApp number');
    }

    toast('Opening WhatsApp…');
  };

  $('#cm').onclick = () => {
    const o = sync();

    navigator.clipboard.writeText(o.msg).then(
      () => toast('Order message copied'),
      () => toast('Copy not available - use the WhatsApp link')
    );
  };
}

$('#checkoutBtn').onclick = openCheckout;

/* ===== POLICIES ===== */
const POL = {
  privacy: [
    'Privacy Policy',
    'We only use the name, WhatsApp number and optional email you enter to process your order via WhatsApp. This site does not store them on a server and never asks for passwords or banking details.'
  ],
  terms: [
    'Terms & Conditions',
    'Orders are confirmed only after the store replies on WhatsApp. Prices may change without notice. SEE CARD products are fictional decorative digital collectibles, not bank-issued cards. SEE CARD is not a bank or financial institution and is not affiliated with any bank.'
  ],
  refund: [
    'Refund Policy',
    'Delivered digital items are non-refundable. If an order is not delivered or something is wrong, contact us on WhatsApp promptly and we will review it. (Edit this policy to match your business.)'
  ]
};

document.querySelectorAll('[data-pol]').forEach(b => {
  b.onclick = () => {
    const [t, x] = POL[b.dataset.pol];
    openModal(`<h3>${t}</h3><p>${x}</p>`);
  };
});

/* ===== UI EXTRAS ===== */
$('#burger').onclick = () => $('#menu').classList.toggle('open');
$('#menu').onclick = () => $('#menu').classList.remove('open');

const topBtn = $('#top');

addEventListener('scroll', () =>
  topBtn.classList.toggle('show', scrollY > 500)
);

topBtn.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

addEventListener('load', () =>
  setTimeout(() => $('#loader').classList.add('hide'), 500)
);

renderCart();

/* ===== COPY BUTTONS ===== */
document.querySelectorAll('.cp').forEach(b => {
  const run = e => {
    e.preventDefault();
    e.stopPropagation();

    const t = b.dataset.copy;

    const done = () => {
      b.textContent = 'Copied ✓';
      setTimeout(() => b.textContent = 'Copy', 1800);
      if (typeof toast === 'function') toast('Copied: ' + t);
    };

    const fb = () => {
      const ta = document.createElement('textarea');
      ta.value = t;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();

      try {
        document.execCommand('copy');
        done();
      } catch (_) {
        if (typeof toast === 'function') toast('Copy not available');
      }

      ta.remove();
    };

    if (navigator.clipboard && navigator.clipboard.writeText)
      navigator.clipboard.writeText(t).then(done, fb);
    else fb();
  };

  b.addEventListener('click', run);

  b.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') run(e);
  });
});

/* ===== WHATSAPP AUTO MESSAGE ===== */
(() => {
  const NAMES = {
    silver: 'SEE CARD SILVER',
    gold: 'SEE CARD GOLD',
    platinum: 'SEE CARD PLATINUM',
    elite: 'SEE CARD ELITE',
    royal: 'SEE CARD ROYAL',
    black: 'SEE CARD BLACK'
  };

  const PRICE = {
    silver: 1500,
    gold: 2500,
    platinum: 4000,
    elite: 5200,
    royal: 7000,
    black: 9000
  };

  const build = k => k === 'details'
    ? 'Hi SEE CARD, I am purchasing a card. Please share the card details.'
    : `Hi SEE CARD, I am purchasing the ${NAMES[k]} (₹${PRICE[k].toLocaleString('en-IN')}). Please share the details.`;

  const apply = k => {
    const text = build(k);
    const q = encodeURIComponent(text);

    document.querySelectorAll('[data-wa]').forEach(a =>
      a.href = `https://wa.me/${a.dataset.wa}?text=${q}`
    );

    const fab = document.querySelector('.wafab');
    if (fab) fab.href = `https://wa.me/919330452266?text=${q}`;

    const pv = document.getElementById('mqPrev');
    if (pv) pv.textContent = text;

    document.querySelectorAll('#mqChips .chip').forEach(c =>
      c.classList.toggle('on', c.dataset.m === k)
    );
  };

  const chips = document.getElementById('mqChips');

  if (chips) {
    chips.addEventListener('click', e => {
      const b = e.target.closest('.chip');
      if (b) apply(b.dataset.m);
    });
  }

  apply('details');
})();
  
