import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import {
  getProducts,
  searchProducts,
  getCategories,
  deleteProduct,
} from "../api/product";

const Products = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [total, setTotal] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const limitFromUrl = Number(searchParams.get("limit")) || 10;

  const searchFromUrl = searchParams.get("search") || "";
  const categoryFromUrl = searchParams.get("category") || "";
  const sortFromUrl = searchParams.get("sort") || "";

  const validLimits = [10, 20, 50];

  const limit = validLimits.includes(limitFromUrl) ? limitFromUrl : 10;

  const [searchInput, setSearchInput] = useState(searchFromUrl);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const page = Math.min(Math.max(pageFromUrl, 1), totalPages);

  const skip = (page - 1) * limit;

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Category error:", error);
      }
    };

    loadCategories();
  }, []);

  // Sync search input
  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";

      if (searchInput === currentSearch) {
        return;
      }

      const params = new URLSearchParams(searchParams);

      if (searchInput.trim()) {
        params.set("search", searchInput.trim());
      } else {
        params.delete("search");
      }

      params.set("page", "1");

      setSearchParams(params);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load products
  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        let data;

        if (searchFromUrl.trim()) {
          data = await searchProducts(
            searchFromUrl,
            0,
            0,
            "",
            controller.signal,
          );
        } else {
          data = await getProducts(0, 0, "", "", controller.signal);
        }

        if (controller.signal.aborted) {
          return;
        }

        let apiProducts = data.products || [];

        // Get locally added/edited products
        const localProducts = JSON.parse(
          localStorage.getItem("customProducts") || "[]",
        );

        // Get locally deleted product IDs
        const deletedProducts = JSON.parse(
          localStorage.getItem("deletedProducts") || "[]",
        );

        // Remove deleted products
        apiProducts = apiProducts.filter(
          (product) => !deletedProducts.includes(product.id),
        );

        // Replace API products with locally edited versions
        apiProducts = apiProducts.map((product) => {
          const localProduct = localProducts.find(
            (item) => String(item.id) === String(product.id),
          );

          return localProduct || product;
        });

        // Add locally created products
        const apiIds = new Set(apiProducts.map((product) => product.id));

        const newLocalProducts = localProducts.filter(
          (product) => !apiIds.has(product.id),
        );

        let finalProducts = [...newLocalProducts, ...apiProducts];

        // Search locally saved products too
        if (searchFromUrl.trim()) {
          const query = searchFromUrl.toLowerCase();

          finalProducts = finalProducts.filter(
            (product) =>
              product.title?.toLowerCase().includes(query) ||
              product.description?.toLowerCase().includes(query) ||
              product.category?.toLowerCase().includes(query),
          );
        }

        // Category filter
        if (categoryFromUrl) {
          finalProducts = finalProducts.filter(
            (product) => product.category === categoryFromUrl,
          );
        }

        // Sorting
        if (sortFromUrl) {
          const [sortBy, order] = sortFromUrl.split("-");

          finalProducts.sort((a, b) => {
            let valueA = a[sortBy];
            let valueB = b[sortBy];

            if (typeof valueA === "string") {
              valueA = valueA.toLowerCase();
            }

            if (typeof valueB === "string") {
              valueB = valueB.toLowerCase();
            }

            if (valueA < valueB) {
              return order === "asc" ? -1 : 1;
            }

            if (valueA > valueB) {
              return order === "asc" ? 1 : -1;
            }

            return 0;
          });
        }

        const totalProducts = finalProducts.length;

        setTotal(totalProducts);

        // Frontend pagination
        const start = skip;
        const end = skip + limit;

        setProducts(finalProducts.slice(start, end));
      } catch (error) {
        if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
          return;
        }

        setError(error.response?.data?.message || "Failed to load products");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [page, limit, searchFromUrl, categoryFromUrl, sortFromUrl]);

  const updateUrl = (key, value) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key !== "page") {
      params.set("page", "1");
    }

    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) {
      return;
    }

    updateUrl("page", String(newPage));
  };

  const handleLimitChange = (e) => {
    updateUrl("limit", e.target.value);
  };

  const handleCategoryChange = (e) => {
    updateUrl("category", e.target.value);
  };

  const handleSortChange = (e) => {
    updateUrl("sort", e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(id);

      // Try API delete
      try {
        await deleteProduct(id);
      } catch (error) {
        console.log("DummyJSON delete simulated");
      }

      // Save deleted ID
      const deletedProducts = JSON.parse(
        localStorage.getItem("deletedProducts") || "[]",
      );

      if (!deletedProducts.includes(id)) {
        deletedProducts.push(id);
      }

      localStorage.setItem("deletedProducts", JSON.stringify(deletedProducts));

      // Remove from locally saved products
      const localProducts = JSON.parse(
        localStorage.getItem("customProducts") || "[]",
      );

      const updatedLocalProducts = localProducts.filter(
        (product) => product.id !== id,
      );

      localStorage.setItem(
        "customProducts",
        JSON.stringify(updatedLocalProducts),
      );

      setProducts((prev) => prev.filter((product) => product.id !== id));

      setTotal((prev) => Math.max(0, prev - 1));
    } catch (error) {
      setError("Failed to delete product");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;

  const endItem = Math.min(page * limit, total);

  const pageNumbers = [];

  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, page + 2);

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>

            <p className="text-sm text-gray-500">Product Management</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Products</h2>

            <p className="text-sm text-gray-500">Manage your products</p>
          </div>

          <button
            onClick={() => navigate("/products/add")}
            className="rounded-md bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            + Add Product
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Search
              </label>

              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search products..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={categoryFromUrl}
                onChange={handleCategoryChange}
                disabled={Boolean(searchFromUrl)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none disabled:bg-gray-100"
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option
                    key={
                      typeof category === "string" ? category : category.slug
                    }
                    value={
                      typeof category === "string" ? category : category.slug
                    }
                  >
                    {typeof category === "string" ? category : category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Sort By
              </label>

              <select
                value={sortFromUrl}
                onChange={handleSortChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none"
              >
                <option value="">Default</option>

                <option value="price-asc">Price: Low to High</option>

                <option value="price-desc">Price: High to Low</option>

                <option value="rating-desc">Rating: High to Low</option>

                <option value="title-asc">Title: A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center rounded-lg bg-white">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">
              No products found
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b text-left text-sm text-gray-600">
                    <th className="px-4 py-3">Product</th>

                    <th className="px-4 py-3">Category</th>

                    <th className="px-4 py-3">Price</th>

                    <th className="px-4 py-3">Rating</th>

                    <th className="px-4 py-3">Stock</th>

                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-12 w-12 rounded-md object-cover"
                          />

                          <button
                            onClick={() => navigate(`/products/${product.id}`)}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {product.title}
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {product.category}
                      </td>

                      <td className="px-4 py-4 text-sm font-medium">
                        ${product.price}
                      </td>

                      <td className="px-4 py-4 text-sm">⭐ {product.rating}</td>

                      <td className="px-4 py-4 text-sm">{product.stock}</td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/products/edit/${product.id}`)
                            }
                            className="rounded-md bg-blue-100 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-200"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteLoading === product.id}
                            className="rounded-md bg-red-100 px-3 py-1.5 text-sm text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            {deleteLoading === product.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && total > 0 && (
          <div className="mt-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <strong>
                {startItem}–{endItem}
              </strong>{" "}
              of <strong>{total}</strong>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`rounded-md px-3 py-2 text-sm ${
                    page === number
                      ? "bg-blue-600 text-white"
                      : "border bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

              <select
                value={limit}
                onChange={handleLimitChange}
                className="rounded-md border px-3 py-2 text-sm"
              >
                <option value="10">10 / page</option>

                <option value="20">20 / page</option>

                <option value="50">50 / page</option>
              </select>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
