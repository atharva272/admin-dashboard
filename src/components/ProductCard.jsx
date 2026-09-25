import { useNavigate } from "react-router-dom";

const ProductCard = ({ products }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => navigate(`/products/${product.id}`)}
          className="cursor-pointer rounded-lg bg-white p-4 shadow hover:shadow-md"
        >
          <div className="flex gap-4">
            <img
              src={product.thumbnail}
              alt={product.title}
              className="h-20 w-20 rounded object-cover"
            />

            <div className="flex-1">
              <h2 className="font-semibold">
                {product.title}
              </h2>

              <p className="mt-1 text-sm capitalize text-gray-500">
                {product.category}
              </p>

              <p className="mt-2 font-medium">
                ${product.price}
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-between border-t pt-3 text-sm">
            <span>⭐ {product.rating}</span>
            <span>Stock: {product.stock}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCard;