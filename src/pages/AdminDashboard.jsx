import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI, ordersAPI, paymentsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [analytics, setAnalytics] = useState({
    productStats: null,
    orderStats: null,
    paymentStats: null,
  });
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/products');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        productStatsRes,
        orderStatsRes,
        paymentStatsRes,
        ordersRes,
        paymentsRes,
      ] = await Promise.all([
        analyticsAPI.getProductStats(),
        analyticsAPI.getOrderStats(),
        analyticsAPI.getPaymentSuccessRate(),
        ordersAPI.getAll(),
        paymentsAPI.getAll(),
      ]);

      setAnalytics({
        productStats: productStatsRes.data,
        orderStats: orderStatsRes.data,
        paymentStats: paymentStatsRes.data,
      });

      setOrders(ordersRes.data);
      setPayments(paymentsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to update order status');
      console.error(err);
    }
  };

  const handleProcessPayment = async (paymentId) => {
    try {
      await paymentsAPI.process(paymentId);
      fetchData(); // Refresh data
    } catch (err) {
      setError('Failed to process payment');
      console.error(err);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex gap-4">
              <a href="/products" className="text-blue-600 hover:underline">
                Products
              </a>
              <a href="/admin/products" className="text-blue-600 hover:underline">
                Manage Products
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Products Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Products</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {analytics.productStats?.totalProducts || 0}
                </p>
                <p className="text-gray-600 text-sm">Total Products</p>
              </div>

              {/* Orders Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Orders</h3>
                <p className="text-3xl font-bold text-green-600">
                  {analytics.orderStats?.totalOrders || 0}
                </p>
                <p className="text-gray-600 text-sm">
                  Revenue: ${analytics.orderStats?.totalRevenue?.toFixed(2) || '0.00'}
                </p>
              </div>

              {/* Payments Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Payments</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {analytics.paymentStats?.successRate?.toFixed(1) || 0}%
                </p>
                <p className="text-gray-600 text-sm">Success Rate</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Order #</th>
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{order.orderNumber}</td>
                        <td className="py-3 px-4">{order.customerName}</td>
                        <td className="py-3 px-4">${order.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order._id, e.target.value)
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Payments</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Method</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.slice(0, 10).map((payment) => (
                      <tr key={payment._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{payment.customerName}</td>
                        <td className="py-3 px-4">${payment.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">{payment.paymentMethod}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              payment.status === 'Completed'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'Failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {payment.status === 'Pending' && (
                            <button
                              onClick={() => handleProcessPayment(payment._id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Process
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
