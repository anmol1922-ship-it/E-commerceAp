import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../store/slices/cartSlice";
import { Link } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";

export default function Cart() {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const { settings } = useSelector((state: RootState) => state.settings);

  const GST_RATE = settings?.gstRate ?? 0.18;
  const FREE_DELIVERY_THRESHOLD = settings?.freeDeliveryThreshold ?? 500;
  const DELIVERY_CHARGE = settings?.deliveryCharge ?? 30;

  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = Math.round((subtotal + gst + delivery) * 100) / 100;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">
          Add some Bisleri products to get started!
        </p>
        <Link
          to="/products"
          className="inline-block mt-6 bg-emerald-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-emerald-700 transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Shopping Cart ({items.length})
        </h1>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex gap-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
            >
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-20 h-20 object-contain bg-gray-50 rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {item.product.name}
                </h3>
                <p className="text-sm text-gray-500">{item.product.size}</p>
                <p className="font-bold text-gray-900 mt-1">
                  ₹{item.product.price * item.quantity}
                </p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => dispatch(removeFromCart(item.product.id))}
                  className="text-gray-400 hover:text-red-500"
                >
                  <FiTrash2 size={18} />
                </button>
                <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          id: item.product.id,
                          quantity: item.quantity - 1,
                        }),
                      )
                    }
                    className="text-gray-600 hover:text-emerald-600"
                  >
                    <FiMinus size={14} />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      dispatch(
                        updateQuantity({
                          id: item.product.id,
                          quantity: item.quantity + 1,
                        }),
                      )
                    }
                    className="text-gray-600 hover:text-emerald-600"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">GST (18%)</span>
              <span>₹{gst}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery</span>
              <span>
                {delivery === 0 ? (
                  <span className="text-emerald-600">FREE</span>
                ) : (
                  `₹${delivery}`
                )}
              </span>
            </div>
            <hr />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
          {subtotal < FREE_DELIVERY_THRESHOLD && (
            <p className="text-xs text-gray-500 mt-3">
              Add ₹{FREE_DELIVERY_THRESHOLD - subtotal} more for free delivery
            </p>
          )}
          <Link
            to="/checkout"
            className="block w-full mt-5 bg-emerald-600 text-white text-center font-medium py-3 rounded-xl hover:bg-emerald-700 transition"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
