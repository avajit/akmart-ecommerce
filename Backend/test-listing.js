const axios = require('axios');

async function test() {
  try {
    // 1. Login as seller
    const login = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'seller@example.com',
      password: 'password123'
    });
    
    const token = login.data.data.accessToken;
    
    // 2. Get seller products
    const products = await axios.get('http://localhost:3000/api/v1/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const approvedProduct = products.data.data.products.find(p => p.status === 'APPROVED');
    if (!approvedProduct) {
      console.log("No approved products found.");
      return;
    }
    
    // 3. Create listing
    const res = await axios.post('http://localhost:3000/api/v1/seller/listings', {
      variantId: approvedProduct.variants[0].id,
      price: 1000,
      mrp: 1500,
      stock: 50
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
  }
}

test();
