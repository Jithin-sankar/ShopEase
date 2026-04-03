import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Productdetails.css';
import { toast, ToastContainer } from 'react-toastify';
import Sidebar from '../../sidebar/Sidebar';

axios.defaults.withCredentials = true;
const BASE_URL = "https://shopease-g7bc.onrender.com";

function Productdetails() {
  const [products, setProducts] = useState([]);
  const [updateIndex, setUpdateIndex] = useState(null);

  const [add, setAdd] = useState({
    brand: '',
    productName: '',
    description: '',
    price: '',
    image: '',
    currency: '₹',
    specs: ''
  });

  const fetchProducts = async () => {
    const res = await axios.get(`${BASE_URL}/api/admin/products/`);
    setProducts(res.data.data || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleInput(e) {
    setAdd({ ...add, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setAdd({
      brand: '',
      productName: '',
      description: '',
      price: '',
      image: '',
      currency: '₹',
      specs: ''
    });
    setUpdateIndex(null);
  }

  // ✅ 🔥 CONVERT TEXT → JSON
  function convertSpecsToJSON(specsText) {
    const obj = {};

    specsText.split(",").forEach(item => {
      const [key, value] = item.split(":");
      if (key && value) {
        obj[key.trim()] = value.trim();
      }
    });

    return obj;
  }

  async function handleSubmit() {
    try {
      const formattedData = {
        ...add,
        specs: convertSpecsToJSON(add.specs) // ✅ FIX
      };

      if (updateIndex === null) {
        await axios.post(`${BASE_URL}/api/admin/products/`, formattedData);
        toast.success("Added");
      } else {
        const id = products[updateIndex].id;
        await axios.put(`${BASE_URL}/api/admin/products/${id}/`, formattedData);
        toast.success("Updated");
      }

      fetchProducts();
      resetForm();

    } catch (error) {
      console.error(error.response?.data);
      toast.error("Error");
    }
  }

  function handleEdit(index) {
    const p = products[index];

  
    const specsText = p.specs
      ? Object.entries(p.specs)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : "";

    setAdd({
      brand: p.brand,
      productName: p.productName,
      description: p.description,
      price: p.price,
      image: p.image,
      currency: p.currency,
      specs: specsText
    });

    setUpdateIndex(index);
  }

  async function handleDelete(p) {
    await axios.delete(`${BASE_URL}/api/admin/products/${p.id}/`);
    toast.success("Deleted");
    fetchProducts();
  }

  return (
    <div className="dashpro">
      <Sidebar />
      <ToastContainer />

      <div className="forprducte">

        <div className="addproduct">
          <h3>{updateIndex === null ? "Add" : "Update"} Product</h3>

          <input name="image" placeholder="Image URL" value={add.image} onChange={handleInput} />
          <input name="brand" placeholder="Brand" value={add.brand} onChange={handleInput} />
          <input name="productName" placeholder="Product Name" value={add.productName} onChange={handleInput} />
          <input name="description" placeholder="Description" value={add.description} onChange={handleInput} />
          <input name="price" placeholder="Price" value={add.price} onChange={handleInput} />

          {/* ✅ SPECS INPUT */}
          <textarea
            name="specs"
            placeholder="Battery: 5000mAh, RAM: 8GB, Storage: 128GB"
            value={add.specs}
            onChange={handleInput}
          />

          <button onClick={handleSubmit}>
            {updateIndex === null ? "Add" : "Update"}
          </button>
        </div>

        <div className="outer-product">
          {products.map((p, i) => (
            <div key={p.id} className="product-lis">
              <img src={p.image} alt="" />
              <h2>{p.productName}</h2>
              <h4>Brand: {p.brand}</h4>
              <h3>₹{p.price}</h3>

              <button onClick={() => handleEdit(i)}>Edit</button>
              <button onClick={() => handleDelete(p)}>Delete</button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Productdetails;