import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";

import { getProduct, deleteProduct } from "../api/product";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProduct = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getProduct(id);

      // getProduct() already returns response.data
      setProduct(response);
    } catch (error) {
      setError("Product not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await deleteProduct(id);
      navigate("/products");
    } catch (error) {
      setError("Failed to delete product");
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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 py-10">
          <ErrorState
            message={error || "Product not found"}
            onRetry={fetchProduct}
          />

          <div className="mt-4 text-center">
            <Link
              to="/products"
              className="text-blue-600 hover:underline"
            >
              Back to Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Link
          to="/products"
          className="mb-6 inline-block text-blue-600 hover:underline"
        >
          ← Back to Products
        </Link>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="grid gap-8 md:grid-cols-2">
            
            {/* Product Image */}
            <div>
              <img
                src={product.thumbnail}
                alt={product.title}
                className="h-80 w-full rounded-lg object-contain"
              />

              <div className="mt-4 grid grid-cols-4 gap-2">
                {product.images?.slice(0, 4).map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={product.title}
                    className="h-20 w-full rounded border object-cover"
                  />
                ))}
              </div>
            </div>

            {/* Product Information */}
            <div>
              <h1 className="text-3xl font-bold">
                {product.title}
              </h1>

              <p className="mt-2 capitalize text-gray-500">
                {product.category}
              </p>

              <p className="mt-6 text-3xl font-bold">
                ${product.price}
              </p>

              <div className="mt-4 flex gap-4 text-sm">
                <span>⭐ {product.rating}</span>
                <span>Stock: {product.stock}</span>
              </div>

              <p className="mt-6 leading-7 text-gray-600">
                {product.description}
              </p>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <Link
                  to={`/products/edit/${product.id}`}
                  className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                >
                  Edit
                </Link>

                <button
                  onClick={handleDelete}
                  className="rounded-md bg-red-600 px-5 py-2 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-10 border-t pt-6">
            <h2 className="text-2xl font-bold">
              Reviews
            </h2>

            <div className="mt-4 space-y-4">
              {product.reviews?.length > 0 ? (
                product.reviews.map((review, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex justify-between">
                      <p className="font-semibold">
                        {review.reviewerName}
                      </p>

                      <span>
                        ⭐ {review.rating}
                      </span>
                    </div>

                    <p className="mt-2 text-gray-600">
                      {review.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  No reviews available
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetails;