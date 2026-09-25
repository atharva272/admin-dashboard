import { useNavigate } from "react-router-dom";

const ProductTable = ({ products }) => {
  const navigate = useNavigate();

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-sm">
            <th className="px-4 py-3">Image</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Rating</th>
            <th className="px-4 py-3">Stock</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => (
            <tr
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="cursor-pointer border-b hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="h-12 w-12 rounded object-cover"
                />
              </td>

              <td className="px-4 py-3 font-medium">
                {product.title}
              </td>

              <td className="px-4 py-3 capitalize">
                {product.category}
              </td>

              <td className="px-4 py-3">
                ${product.price}
              </td>

              <td className="px-4 py-3">
                ⭐ {product.rating}
              </td>

              <td className="px-4 py-3">
                {product.stock}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;