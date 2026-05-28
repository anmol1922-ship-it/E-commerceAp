import { useDispatch } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";
import toast from "react-hot-toast";
import type { Product } from "../store/slices/productSlice";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        size: product.size,
        stock: product.stock,
      }),
    );
    toast.success(`${product.name} added to cart`);
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className="h-48 bg-gradient-to-br from-sky-50 to-emerald-50 flex items-center justify-center p-4">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full object-contain"
        />
      </div>
      <div className="p-5 flex flex-col flex-1 gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            {product.size}
          </span>
          {product.bottlesPerCase > 1 && (
            <span className="text-xs text-gray-500">
              {product.bottlesPerCase} bottles
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-gray-900">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="ml-2 text-sm text-gray-400 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!product.isAvailable || product.stock === 0}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
