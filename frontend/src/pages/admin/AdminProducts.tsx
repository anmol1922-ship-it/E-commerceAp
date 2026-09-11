import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Navigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { CUSTOMER_TYPE_CODES } from "../../constants/customerType";

interface AdminProduct {
  id: string;
  name: string;
  size: string;
  price: number;
  prices?: Record<string, number>;
  stock: number;
}

export default function AdminProducts() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    endUserPrice: 0,
    distributorPrice: 0,
    stock: 0,
  });

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products?limit=50");
      setProducts(data.products);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const handleUpdate = async (id: string) => {
    try {
      await api.put(`/products/${id}`, {
        prices: {
          [CUSTOMER_TYPE_CODES.END_USER]: editForm.endUserPrice,
          [CUSTOMER_TYPE_CODES.DISTRIBUTOR]: editForm.distributorPrice,
        },
        stock: editForm.stock,
      });
      toast.success("Product updated");
      setEditingId(null);
      fetchProducts();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Products</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">Product</th>
                <th className="px-4 py-3 text-left text-gray-600">Size</th>
                <th className="px-4 py-3 text-left text-gray-600">
                  End User Price
                </th>
                <th className="px-4 py-3 text-left text-gray-600">
                  Distributor Price
                </th>
                <th className="px-4 py-3 text-left text-gray-600">Stock</th>
                <th className="px-4 py-3 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.size}</td>
                  <td className="px-4 py-3">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        value={editForm.endUserPrice}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            endUserPrice: +e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-20"
                      />
                    ) : (
                      `₹${p.prices?.[CUSTOMER_TYPE_CODES.END_USER] ?? p.price}`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        value={editForm.distributorPrice}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            distributorPrice: +e.target.value,
                          })
                        }
                        className="border rounded px-2 py-1 w-20"
                      />
                    ) : (
                      `₹${p.prices?.[CUSTOMER_TYPE_CODES.DISTRIBUTOR] ?? "-"}`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        value={editForm.stock}
                        onChange={(e) =>
                          setEditForm({ ...editForm, stock: +e.target.value })
                        }
                        className="border rounded px-2 py-1 w-20"
                      />
                    ) : (
                      p.stock
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {editingId === p.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(p.id)}
                          className="text-emerald-600 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-500"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(p.id);
                            setEditForm({
                              endUserPrice:
                                p.prices?.[CUSTOMER_TYPE_CODES.END_USER] ??
                                p.price ??
                                0,
                              distributorPrice:
                                p.prices?.[CUSTOMER_TYPE_CODES.DISTRIBUTOR] ??
                                0,
                              stock: p.stock,
                            });
                          }}
                          className="text-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
