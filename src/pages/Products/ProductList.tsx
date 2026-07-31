import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient, Button } from '@geeksman/core-ui';

interface Product {
  id: number;
  vendor_id: string;
  name: string;
  brand_name: string;
  category: string;
  is_active: boolean;
  variants?: Array<{
    id: number;
    name: string;
    sku_code: string;
    price: number;
  }>;
}

export function ProductList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const highlightedId = searchParams.get('highlightedId');

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState(search);

  const fetchProducts = () => {
    setLoading(true);
    // Fetch products belonging to the supplier.
    // For local tests/auth, we retrieve all vendor products since we filter by logged-in session on backend.
    apiClient
      .get('/rfq/vendor-products', {
        params: {
          search: search,
          page: page,
          limit: 10,
        },
      })
      .then((res: any) => {
        if (res.data && res.data.data) {
          setProducts(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [search, page]);

  useEffect(() => {
    if (highlightedId) {
      const element = document.getElementById(`row-${highlightedId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        element.classList.add('row-flash-highlight');
        setTimeout(() => {
          element.classList.remove('row-flash-highlight');
        }, 2000);
      }
    }
  }, [products, highlightedId]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setSearchParams((prev) => {
      if (val) {
        prev.set('search', val);
      } else {
        prev.delete('search');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            My Product Catalogue
          </h1>
          <p className="text-slate-400 mt-1">Manage and edit your products and variations</p>
        </div>
        <Button
          onClick={() => navigate(`/products/new?${searchParams.toString()}`)}
          variant="primary"
        >
          + Add Product
        </Button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center text-slate-400">
          No products found. Click "+ Add Product" to get started.
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700 text-slate-300 font-semibold text-sm">
                <th className="p-4">Name</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Category</th>
                <th className="p-4">Variants Count</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 text-slate-300 text-sm">
              {products.map((p) => (
                <tr
                  key={p.id}
                  id={`row-${p.id}`}
                  className="hover:bg-slate-700/30 transition-all duration-200"
                >
                  <td className="p-4 font-semibold text-slate-100">{p.name}</td>
                  <td className="p-4">{p.brand_name || '-'}</td>
                  <td className="p-4">{p.category || '-'}</td>
                  <td className="p-4">{p.variants?.length || 0}</td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.is_active
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-950 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      className="text-blue-400 hover:text-blue-300 mr-3 transition-colors"
                      onClick={() => navigate(`/products/${p.id}/edit?${searchParams.toString()}`)}
                    >
                      Edit
                    </button>
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
