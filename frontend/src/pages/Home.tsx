import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  slug: string;
}

const testimonials = [
  {
    name: "Priya Sharma",
    text: "Timely delivery every single time. My whole society orders from them now.",
    area: "Vasai West",
  },
  {
    name: "Rajesh Patel",
    text: "Best water quality in Vasai. My office orders 20L jars weekly.",
    area: "Vasai West",
  },
  {
    name: "Meena Gupta",
    text: "Affordable prices and very polite delivery staff. Strongly recommend!",
    area: "Vasai West",
  },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get("/products?limit=4&sort=popularity");
        if (data.success) {
          setFeaturedProducts(data.products);
        }
      } catch {
        // silently fail - home page still works without featured products
      }
    };
    fetchFeatured();
  }, [user?.id, user?.customerType?.id]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-white/20 text-sm font-medium px-3 py-1 rounded-full mb-4">
              🚚 Delivery in Vasai, Maharashtra
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Pure Bisleri Water Delivered to Your Doorstep
            </h1>
            <p className="mt-4 text-lg text-emerald-100 max-w-lg">
              Order 20L jars, 1L cases, 500ml packs and more — same-day delivery
              in Vasai.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-white text-emerald-700 font-semibold px-6 py-3 rounded-xl shadow hover:shadow-lg transition"
              >
                Order Now
              </Link>
              <Link
                to="/about"
                className="border border-white/40 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="hidden md:flex justify-center">
            <img
              src="/images/bisleri/bisleri-20l.png"
              alt="Bisleri 20L Jar"
              className="w-64 drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
          Our Popular Products
        </h2>
        <p className="text-center text-gray-500 mt-2">
          Available for same-day delivery in Vasai
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          {featuredProducts.map((p) => (
            <Link
              to="/products"
              key={p.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:shadow-md transition"
            >
              <img
                src={p.imageUrl}
                alt={p.name}
                className="h-28 mx-auto mb-4"
              />
              <h3 className="font-semibold text-gray-900">{p.name}</h3>
              <p className="text-emerald-600 font-bold mt-1">₹{p.price}</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/products"
            className="inline-block bg-emerald-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-emerald-700 transition"
          >
            View All Products →
          </Link>
        </div>
      </section>
    </div>
  );
}
