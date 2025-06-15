// components/QuickActions.tsx
import Link from "next/link";

export default function QuickActions() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="flex flex-wrap gap-4">
        <Link 
          href="/book" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          Book a Room
        </Link>
        <Link 
          href="/my-bookings" 
          className="bg-white hover:bg-gray-100 border border-gray-300 px-6 py-3 rounded-lg font-medium"
        >
          View My Bookings
        </Link>
      </div>
    </div>
  );
}