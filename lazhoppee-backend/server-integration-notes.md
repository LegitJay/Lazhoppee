# Wiring this into your existing server.js

1. Install socket.io:
   npm install socket.io

2. Add the messages route (put it above your seller routes to avoid the
   mounting-order issue you've been fighting):
   app.use('/messages', require('./routes/messages'));

3. Socket.io needs a raw http server instead of app.listen(). Replace:

   app.listen(3002, () => console.log('Server running on 3002'));

   with:

   const http = require('http');
   const server = http.createServer(app);
   const initSocket = require('./socket');
   initSocket(server);

   server.listen(3002, () => console.log('Server running on 3002'));

4. Make sure JWT_SECRET is available via process.env.JWT_SECRET (same secret
   you use to sign tokens on login) — socket.js verifies against it.

5. Your User model needs `profileImage` and `storeDetails` fields already —
   these are just populated, not created, by the messages route.