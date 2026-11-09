require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const BASE = process.env.BASE_URL || 'http://localhost:3000';
const app = express();

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static('public'));

const cookieOpts = {
  httpOnly: true,
  signed: true,
  sameSite: 'lax',
  secure: BASE.startsWith('https'),
  maxAge: 1000 * 60 * 60 * 24 * 365,
};

// 1. Crea la página de pago de Stripe para la suscripción mensual
app.post('/api/checkout', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${BASE}/api/claim?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: BASE,
      allow_promotion_codes: true,
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'checkout_failed' });
  }
});

// 2. Al volver del pago, guarda el cliente en una cookie firmada
app.get('/api/claim', async (req, res) => {
  try {
    const s = await stripe.checkout.sessions.retrieve(req.query.session_id);
    if (s.status === 'complete' && s.customer) res.cookie('cid', s.customer, cookieOpts);
  } catch (e) {
    console.error(e);
  }
  res.redirect('/');
});

// 3. Pregunta a Stripe si la suscripción sigue activa (sin base de datos)
app.get('/api/status', async (req, res) => {
  const cid = req.signedCookies.cid;
  if (!cid) return res.json({ pro: false });
  try {
    const subs = await stripe.subscriptions.list({ customer: cid, status: 'all', limit: 5 });
    res.json({ pro: subs.data.some((s) => ['active', 'trialing'].includes(s.status)) });
  } catch (e) {
    console.error(e);
    res.json({ pro: false });
  }
});

// 4. Portal de Stripe para cambiar tarjeta o cancelar
app.post('/api/portal', async (req, res) => {
  const cid = req.signedCookies.cid;
  if (!cid) return res.status(401).json({ error: 'no_customer' });
  try {
    const p = await stripe.billingPortal.sessions.create({ customer: cid, return_url: BASE });
    res.json({ url: p.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'portal_failed' });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('CotizaYa en ' + BASE));
