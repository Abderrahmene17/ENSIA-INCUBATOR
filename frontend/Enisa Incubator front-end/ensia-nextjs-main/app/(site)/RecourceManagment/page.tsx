"use client";

import { useState, useEffect } from "react";
import SidebarInfo from "@/components/Docs/SidebareInfo";
import { FiCalendar, FiUsers, FiLayers, FiHome, FiCheckCircle } from "react-icons/fi";
import axios from "axios";

interface Resource {
  id: number;
  type: string;
  name: string;
  description: string;
  quantity_available: number;
}

const API_BASE_URL = "http://localhost:8000/";

export default function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/resources/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setResources(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const getResourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "lab": return <FiLayers className="text-blue-500" />;
      case "meeting-room": return <FiUsers className="text-purple-500" />;
      case "workshop": return <FiHome className="text-amber-500" />;
      case "equipment": return <FiLayers className="text-green-500" />;
      default: return <FiHome className="text-gray-500" />;
    }
  };

  // Calculate total available quantity
  const totalAvailable = resources.reduce((sum, resource) => sum + resource.quantity_available, 0);

  if (loading) {
    return (
      <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300">Loading resources...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="sticky top-8 rounded-xl border border-gray-200 p-6 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FiHome className="text-primary" /> Resource Navigation
              </h2>
              <ul className="space-y-3">
                <SidebarInfo />
              </ul>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Quick Stats
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Total Resources</span>
                    <span className="font-medium">{resources.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Available Quantity</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {totalAvailable}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Resource Types</span>
                    <span className="font-medium">
                      {new Set(resources.map(r => r.type)).size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                    Resource Management
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    View and manage available resources
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 rounded-md ${viewMode === "grid" ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 rounded-md ${viewMode === "list" ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Stats Cards - Now with Total Available Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/50 rounded-xl p-4 shadow-sm border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                      <FiUsers className="text-blue-600 dark:text-blue-300 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-300">Total Resources</p>
                      <p className="text-2xl font-bold text-blue-800 dark:text-white">
                        {resources.length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/50 rounded-xl p-4 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                      <FiCheckCircle className="text-emerald-600 dark:text-emerald-300 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-600 dark:text-emerald-300">Available Quantity</p>
                      <p className="text-2xl font-bold text-emerald-800 dark:text-white">
                        {totalAvailable}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-900/50 rounded-xl p-4 shadow-sm border border-purple-100 dark:border-purple-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                      <FiCalendar className="text-purple-600 dark:text-purple-300 text-xl" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-300">Resource Types</p>
                      <p className="text-2xl font-bold text-purple-800 dark:text-white">
                        {new Set(resources.map(r => r.type)).size}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resources Grid - Simplified */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* Resource Image Placeholder */}
                    <div className="h-40 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      <span className="text-4xl">
                        {getResourceTypeIcon(resource.type)}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600">
                            {resource.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {resource.id} • {resource.type}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          resource.quantity_available > 0
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                          }`}>
                          {resource.quantity_available > 0 ? `${resource.quantity_available} Available` : "Out of Stock"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p>{resource.description || "No description available"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Resource
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {resources.map((resource) => (
                      <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              {getResourceTypeIcon(resource.type)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {resource.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {resource.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white capitalize">
                            {resource.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {resource.quantity_available}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            resource.quantity_available > 0
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                            }`}>
                            {resource.quantity_available > 0 ? "Available" : "Out of Stock"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}