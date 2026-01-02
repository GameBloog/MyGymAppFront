import type React from "react";
import { Activity } from "lucide-react";

export const Navigation: React.FC = () => {
  return (
    <nav className="bg-white shadow-md md-8">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">G-FORCE Coach</h1>
        </div>
      </div>
    </nav>
  )
}