import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { clearCart } from "../store/slices/cartSlice";
import toast from "react-hot-toast";
import api from "../api/axios";

const VASAI_PINCODES = [
  "401201",
  "401202",
  "401203",
  "401204",
  "401205",
  "401207",
  "401208",
  "401209",
  "401210",
  "401301",
  "401302",
  "401303",
  "401304",
  "401305",
];
const DELIVERY_SLOTS = [
  "9 AM – 12 PM",
  "12 PM – 3 PM",
  "3 PM – 6 PM",
  "6 PM – 9 PM",
];
const GST_RATE = 0.18;
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_CHARGE = 30;

export default function Checkout() {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  const [address, setAddress] = useState({ street: "", area: "", pincode: "" });
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0]);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">(
    "razorpay",
  );
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );
  const gst = Math.round(subtotal * GST_RATE * 100) / 100;
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = Math.round((subtotal + gst + delivery) * 100) / 100;

  const handleOrder = async () => {
    if (!user) {
      toast.error("Please login to place an order");
      return;
    }
    if (!address.street || !address.area || !address.pincode) {
      toast.error("Please fill complete address");
      return;
    }
    if (!VASAI_PINCODES.includes(address.pincode)) {
      toast.error("Delivery available only in Vasai area pincodes");
      return;
    }
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
        })),
        shippingAddress: { ...address, city: "Vasai" },
        deliverySlot,
        paymentMethod,
      };

      const { data } = await api.post("/orders", orderData);

      if (paymentMethod === "razorpay" && data.razorpayOrder) {
        // Open Razorpay checkout
        const options = {
          key: data.razorpayKeyId,
          amount: data.razorpayOrder.amount,
          currency: "INR",
          name: "Bisleri Vasai",
          description: "Water Delivery Order",
          order_id: data.razorpayOrder.id,
          handler: async (response: any) => {
            await api.post("/orders/verify-payment", response);
            toast.success("Payment successful! Order confirmed.");
            dispatch(clearCart());
            setOrderSuccess(true);
          },
          prefill: { name: user.name, email: user.email },
          theme: { color: "#059669" },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // COD order
        toast.success("Order placed successfully! Pay on delivery.");
        dispatch(clearCart());
        setOrderSuccess(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="text-2xl font-bold text-gray-900">Order Confirmed!</h2>
        <p className="text-gray-500 mt-2">
          Your Bisleri water will be delivered to your address in Vasai.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Delivery Address
            </h2>
            <div className="space-y-3">
              <input
                placeholder="Street / House No."
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                placeholder="Area / Landmark"
                value={address.area}
                onChange={(e) =>
                  setAddress({ ...address, area: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                placeholder="Pincode (Vasai area)"
                value={address.pincode}
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {address.pincode && !VASAI_PINCODES.includes(address.pincode) && (
                <p className="text-xs text-red-500">
                  Delivery not available for this pincode
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Delivery Slot</h2>
            <div className="grid grid-cols-2 gap-2">
              {DELIVERY_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setDeliverySlot(slot)}
                  className={`text-sm py-2 px-3 rounded-lg border ${deliverySlot === slot ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${paymentMethod === "razorpay" ? "border-emerald-600 bg-emerald-50" : "border-gray-200"}`}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="accent-emerald-600"
                />
                <span className="text-sm font-medium">
                  Pay Online (Razorpay)
                </span>
              </label>
              <label
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${paymentMethod === "cod" ? "border-emerald-600 bg-emerald-50" : "border-gray-200"}`}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="accent-emerald-600"
                />
                <span className="text-sm font-medium">
                  Cash on Delivery (COD)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit sticky top-24">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product._id} className="flex justify-between">
                <span className="text-gray-600">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  ₹{item.product.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
          <hr className="my-4" />
          <div className="space-y-2 text-sm">
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
              <span>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
          <button
            onClick={handleOrder}
            disabled={loading}
            className="w-full mt-5 bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 transition"
          >
            {loading ? "Processing..." : `Place Order — ₹${total}`}
          </button>
        </div>
      </div>
    </div>
  );
}
