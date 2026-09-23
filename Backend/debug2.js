const fetch = require('node-fetch'); // actually, just use native fetch

async function debug2() {
  const login = await globalThis.fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'seller@techmart.com', password: 'Seller@123' })
  }).then(r => r.json());
  
  if (!login.data) { console.log('login failed'); return; }

  const products = await globalThis.fetch('http://localhost:5000/api/v1/products', {
    headers: { Authorization: 'Bearer ' + login.data.accessToken }
  }).then(r => r.json());
  
  const p = products.data.products[0];
  console.log("Found product:", p.name);
  console.log("Variants:", p.variants);
  
  if (!p.variants || p.variants.length === 0) {
      console.log("No variants!"); return;
  }
  
  // Try to create listing
  const listing = await globalThis.fetch('http://localhost:5000/api/v1/seller/listings', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + login.data.accessToken
    },
    body: JSON.stringify({
      variantId: p.variants[0].id,
      price: 1500,
      mrp: 2000,
      stock: 50
    })
  }).then(r => r.json());
  
  console.log("Create listing result:", listing);
}
debug2();
