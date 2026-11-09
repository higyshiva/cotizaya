# CotizaYa: puesta en marcha

## 1. Stripe (5 minutos)
1. Crea tu cuenta en stripe.com y deja activado el modo de pruebas.
2. Productos > Añadir producto: "CotizaYa Pro", precio recurrente mensual. Copia el ID del precio (empieza con `price_`).
3. Ajustes > Facturación > Portal del cliente: actívalo (permite cancelar y cambiar tarjeta).
4. Desarrolladores > Claves API: copia la clave secreta (`sk_test_...`).

## 2. Probar en tu computadora
```
npm install
cp .env.example .env     # y rellena las claves
npm start
```
Abre http://localhost:3000. Para pagar de prueba usa la tarjeta 4242 4242 4242 4242, cualquier fecha futura y cualquier CVC.

## 3. Publicarlo (para que cobre mientras duermes)
Sube la carpeta a GitHub y despliégala en Render o Railway (Node, comando `npm start`). Añade las mismas variables del `.env` y pon en `BASE_URL` tu dirección real (https). Cuando todo funcione, cambia a las claves reales de Stripe (`sk_live_...`).

## Límites de esta primera versión
- El acceso Pro queda ligado al navegador donde se pagó. El siguiente paso es un inicio de sesión por correo.
- El límite gratis (3 documentos al mes) se guarda en el navegador y se puede saltar. Es suficiente para empezar.
