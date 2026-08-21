export const uiHtml = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Acme Order Service</title>
    <style>
      :root { color-scheme: light; font-family: Inter, system-ui, sans-serif; background: #f4f7fb; color: #152238; }
      body { margin: 0; }
      header { background: #102a43; color: white; padding: 1rem 2rem; }
      main { max-width: 920px; margin: 2rem auto; padding: 0 1rem; }
      .card { background: white; border: 1px solid #d9e2ec; border-radius: 12px; box-shadow: 0 8px 28px #102a4314; padding: 1.5rem; margin-bottom: 1rem; }
      h1, h2 { margin-top: 0; }
      label { display: block; font-weight: 650; margin-top: .8rem; }
      input { box-sizing: border-box; width: 100%; padding: .7rem; border: 1px solid #829ab1; border-radius: 6px; }
      button { background: #0b69a3; color: white; border: 0; border-radius: 6px; padding: .7rem 1rem; font-weight: 700; cursor: pointer; }
      button:hover { background: #075985; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; border-bottom: 1px solid #d9e2ec; padding: .8rem; }
      .error { color: #a61b1b; min-height: 1.5rem; }
      .success { color: #166534; font-weight: 700; }
      .muted { color: #52667a; }
      [hidden] { display: none !important; }
    </style>
  </head>
  <body>
    <header><strong>Acme Order Service</strong></header>
    <main>
      <section id="login-card" class="card" aria-labelledby="login-title">
        <h1 id="login-title">Sign in to create an order</h1>
        <p class="muted">Demo account: customer@acme.test / Order123!</p>
        <form id="login-form">
          <label for="email">Email address</label>
          <input id="email" name="email" type="email" autocomplete="username" required />
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required />
          <p id="login-error" class="error" role="alert"></p>
          <button type="submit">Sign in</button>
        </form>
      </section>
      <section id="products-card" class="card" aria-labelledby="products-title" hidden>
        <h2 id="products-title">Products</h2>
        <table>
          <thead><tr><th scope="col">Product</th><th scope="col">Price</th><th scope="col">Action</th></tr></thead>
          <tbody id="products"></tbody>
        </table>
        <p id="order-status" role="status"></p>
      </section>
    </main>
    <script>
      let token = '';
      const loginForm = document.querySelector('#login-form');
      const loginError = document.querySelector('#login-error');
      const productsCard = document.querySelector('#products-card');
      const productsTable = document.querySelector('#products');
      const orderStatus = document.querySelector('#order-status');

      async function request(path, options = {}) {
        const response = await fetch(path, {
          ...options,
          headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}), ...(options.headers || {}) },
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Request failed');
        return body;
      }

      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginError.textContent = '';
        try {
          const result = await request('/api/login', { method: 'POST', body: JSON.stringify({ email: loginForm.email.value, password: loginForm.password.value }) });
          token = result.token;
          const products = await request('/api/products');
          productsTable.replaceChildren(...products.map((product) => {
            const row = document.createElement('tr');
            const name = document.createElement('td'); name.textContent = product.name;
            const price = document.createElement('td'); price.textContent = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(product.priceCents / 100);
            const action = document.createElement('td');
            const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Order'; button.dataset.productId = product.id;
            button.addEventListener('click', () => createOrder(product.id)); action.append(button); row.append(name, price, action); return row;
          }));
          document.querySelector('#login-card').hidden = true;
          productsCard.hidden = false;
          document.querySelector('#products-title').focus();
        } catch (error) { loginError.textContent = error.message; }
      });

      async function createOrder(productId) {
        orderStatus.textContent = 'Creating order…'; orderStatus.className = '';
        try {
          const order = await request('/api/orders', { method: 'POST', body: JSON.stringify({ items: [{ productId, quantity: 1 }] }) });
          orderStatus.textContent = 'Order ' + order.id + ' created successfully.'; orderStatus.className = 'success';
        } catch (error) { orderStatus.textContent = error.message; orderStatus.className = 'error'; }
      }
    </script>
  </body>
</html>`;
