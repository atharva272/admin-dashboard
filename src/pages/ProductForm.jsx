import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Loader from "../components/Loader";

import {
  addProduct,
  getProduct,
  updateProduct,
} from "../api/product";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    thumbnail: "",
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    const fetchProduct = async () => {
      try {
        const savedProducts = JSON.parse(
          localStorage.getItem("customProducts") || "[]"
        );

        const savedProduct = savedProducts.find(
          (product) => String(product.id) === String(id)
        );

        if (savedProduct) {
          setFormData({
            title: savedProduct.title || "",
            description: savedProduct.description || "",
            price: savedProduct.price || "",
            stock: savedProduct.stock || "",
            category: savedProduct.category || "",
            thumbnail: savedProduct.thumbnail || "",
          });

          setLoading(false);
          return;
        }

        const product = await getProduct(id);

        setFormData({
          title: product.title || "",
          description: product.description || "",
          price: product.price || "",
          stock: product.stock || "",
          category: product.category || "",
          thumbnail: product.thumbnail || "",
        });
      } catch (error) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    if (!formData.title.trim()) {
      return "Title is required";
    }

    if (!formData.description.trim()) {
      return "Description is required";
    }

    if (!formData.category.trim()) {
      return "Category is required";
    }

    if (
      formData.price === "" ||
      Number(formData.price) <= 0
    ) {
      return "Price must be greater than 0";
    }

    if (
      formData.stock === "" ||
      Number(formData.stock) < 0
    ) {
      return "Stock cannot be negative";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSaving(true);

    const productData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      rating: 0,
      reviews: [],
    };

    try {
      if (isEdit) {
        const updatedProduct = {
          ...productData,
          id: Number(id),
        };

        const savedProducts = JSON.parse(
          localStorage.getItem("customProducts") || "[]"
        );

        const existingIndex = savedProducts.findIndex(
          (product) => String(product.id) === String(id)
        );

        if (existingIndex !== -1) {
          savedProducts[existingIndex] = updatedProduct;
        } else {
          savedProducts.push(updatedProduct);
        }

        localStorage.setItem(
          "customProducts",
          JSON.stringify(savedProducts)
        );

        try {
          await updateProduct(id, productData);
        } catch (error) {
          // DummyJSON update is simulated.
        }
      } else {
        const response = await addProduct(productData);

        const newProduct = {
          ...productData,
          id: response?.id || Date.now(),
        };

        const savedProducts = JSON.parse(
          localStorage.getItem("customProducts") || "[]"
        );

        savedProducts.push(newProduct);

        localStorage.setItem(
          "customProducts",
          JSON.stringify(savedProducts)
        );
      }

      navigate("/products");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <h1 className="mb-6 text-2xl font-bold">
            {isEdit ? "Edit Product" : "Add Product"}
          </h1>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">
                Title
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Stock
                </label>

                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Category
              </label>

              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Image URL
              </label>

              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="rounded-md border px-5 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : isEdit
                  ? "Update Product"
                  : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProductForm;