import { useState } from "react";
import { Routes, Route } from "react-router-dom";
// import Profile from './pages/Profile'; // Removed because Profile is defined in this file

// Mock user data (replace with real data from your backend or context)
const mockUser = {
  name: "Aarav Sharma",
  email: "aarav.sharma@email.com",
  phone: "+91 9876543210",
  role: "artisan", // or "customer"
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  address: "Mumbai, Maharashtra, India",
  purchaseHistory: [
    {
      id: 1,
      item: "Handcrafted Ceramic Vase",
      date: "2025-08-12",
      price: "₹1,200",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      item: "Bamboo Wall Art",
      date: "2025-07-30",
      price: "₹850",
      image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80"
    }
  ],
  productHistory: [
    {
      id: 1,
      name: "Terracotta Planter",
      published: "2025-09-01",
      status: "Published",
      image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      name: "Handwoven Basket",
      published: "2025-08-15",
      status: "Published",
      image: "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80"
    }
  ]
};

export default function ProfilePage() {
  const [user] = useState(mockUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <img
            src={user.avatar}
            alt="User Avatar"
            className="w-32 h-32 rounded-full border-4 border-blue-400 shadow-lg"
          />
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-blue-700">{user.name}</h2>
            <p className="text-lg text-gray-600">{user.role === "artisan" ? "Artisan" : "Customer"}</p>
            <div className="mt-2 flex flex-col md:flex-row gap-2 text-gray-500 text-sm">
              <span>📧 {user.email}</span>
              <span>📱 {user.phone}</span>
              <span>📍 {user.address}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-dashed border-blue-200 my-6"></div>

        {/* Conditional Sections */}
        {user.role === "customer" && (
          <div>
            <h3 className="text-2xl font-semibold text-pink-600 mb-4">Purchase History</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {user.purchaseHistory.map((purchase) => (
                <div key={purchase.id} className="bg-pink-50 rounded-xl p-4 flex items-center shadow hover:shadow-lg transition">
                  <img src={purchase.image} alt={purchase.item} className="w-16 h-16 rounded-lg object-cover mr-4" />
                  <div>
                    <div className="font-bold text-gray-800">{purchase.item}</div>
                    <div className="text-gray-500 text-sm">{purchase.date}</div>
                    <div className="text-blue-600 font-semibold">{purchase.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {user.role === "artisan" && (
          <div>
            <h3 className="text-2xl font-semibold text-blue-600 mb-4">Product History</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {user.productHistory.map((product) => (
                <div key={product.id} className="bg-blue-50 rounded-xl p-4 flex items-center shadow hover:shadow-lg transition">
                  <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover mr-4" />
                  <div>
                    <div className="font-bold text-gray-800">{product.name}</div>
                    <div className="text-gray-500 text-sm">Published: {product.published}</div>
                    <div className="text-green-600 font-semibold">{product.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published History for Artisan */}
        {user.role === "artisan" && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold text-yellow-600 mb-4">Published History</h3>
            <ul className="list-disc ml-6 text-gray-700">
              {user.productHistory.map((product) => (
                <li key={product.id}>
                  <span className="font-medium">{product.name}</span> - Published on {product.published}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* ...other routes... */}
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}