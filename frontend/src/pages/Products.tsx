import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { fetchProducts } from "../store/slices/productSlice";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";

export default function Products() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector(
    (state: RootState) => state.products,
  );

  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (search) params.search = search;
    dispatch(fetchProducts(params));
  }, [dispatch, category, sort, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Bisleri Products</h1>
      <p className="text-gray-500 mt-1">
        Water jars and bottle cases available for delivery in Vasai
      </p>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Categories</option>
          <option value="jar">Water Jars</option>
          <option value="case">Bottle Cases</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Sort by Popularity</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Grid */}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
      </div>

      {!loading && products.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No products found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
