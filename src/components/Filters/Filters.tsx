/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback } from "react";
import { Filters as FiltersType } from "@/types";
import { Search, Filter, X, Calendar, MapPin, Tag } from "lucide-react";

interface FiltersProps {
  onFilterChange: (filters: FiltersType) => void;
  categories: string[];
  locations: string[];
}

export default function Filters({
  onFilterChange,
  categories,
  locations,
}: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<FiltersType>({
    category: [],
    location: [],
    dateRange: { start: null, end: null },
    searchQuery: "",
  });

  const hasActiveFilters = useMemo(() => {
    return (
      localFilters.category.length > 0 ||
      localFilters.location.length > 0 ||
      localFilters.dateRange.start ||
      localFilters.dateRange.end ||
      localFilters.searchQuery !== ""
    );
  }, [localFilters]);

  const updateFilters = useCallback(
    (newFilters: Partial<FiltersType>) => {
      const updatedFilters = { ...localFilters, ...newFilters };
      setLocalFilters(updatedFilters);
      onFilterChange(updatedFilters);
    },
    [localFilters, onFilterChange]
  );

  const handleCategoryChange = (category: string) => {
    const newCategories = localFilters.category.includes(category)
      ? localFilters.category.filter((c: any) => c !== category)
      : [...localFilters.category, category];

    updateFilters({ category: newCategories });
  };

  const handleLocationChange = (location: string) => {
    const newLocations = localFilters.location.includes(location)
      ? localFilters.location.filter((l: any) => l !== location)
      : [...localFilters.location, location];

    updateFilters({ location: newLocations });
  };

  const handleDateRangeChange = (type: "start" | "end", value: string) => {
    updateFilters({
      dateRange: {
        ...localFilters.dateRange,
        [type]: value ? new Date(value) : null,
      },
    });
  };

  const handleSearchChange = (query: string) => {
    updateFilters({ searchQuery: query });
  };

  const clearFilters = () => {
    const emptyFilters: FiltersType = {
      category: [],
      location: [],
      dateRange: { start: null, end: null },
      searchQuery: "",
    };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter size={20} className="text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="flex items-center space-x-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <X size={16} className="mr-1" />
              Clear All
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-600 hover:text-gray-700 font-medium"
          >
            {isExpanded ? "Show Less" : "Show More"}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={localFilters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Tag size={16} className="mr-2" />
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    localFilters.category.includes(category)
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <MapPin size={16} className="mr-2" />
              Location
            </label>
            <div className="flex flex-wrap gap-2">
              {locations.map((location) => (
                <button
                  key={location}
                  onClick={() => handleLocationChange(location)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    localFilters.location.includes(location)
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar size={16} className="mr-2" />
                Start Date
              </label>
              <input
                type="date"
                value={formatDateForInput(localFilters.dateRange.start)}
                onChange={(e) => handleDateRangeChange("start", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar size={16} className="mr-2" />
                End Date
              </label>
              <input
                type="date"
                value={formatDateForInput(localFilters.dateRange.end)}
                onChange={(e) => handleDateRangeChange("end", e.target.value)}
                min={formatDateForInput(localFilters.dateRange.start)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Badges */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Active Filters:
          </h4>
          <div className="flex flex-wrap gap-2">
            {localFilters.searchQuery && (
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Search: "{localFilters.searchQuery}"
                <button
                  onClick={() => handleSearchChange("")}
                  className="ml-1 hover:text-blue-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {localFilters.category.map((category: any) => (
              <span
                key={category}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                Category: {category}
                <button
                  onClick={() => handleCategoryChange(category)}
                  className="ml-1 hover:text-blue-900"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {localFilters.location.map((location: any) => (
              <span
                key={location}
                className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                Location: {location}
                <button
                  onClick={() => handleLocationChange(location)}
                  className="ml-1 hover:text-green-900"
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            {localFilters.dateRange.start && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                From: {localFilters.dateRange.start.toLocaleDateString()}
                <button
                  onClick={() => handleDateRangeChange("start", "")}
                  className="ml-1 hover:text-purple-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {localFilters.dateRange.end && (
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                To: {localFilters.dateRange.end.toLocaleDateString()}
                <button
                  onClick={() => handleDateRangeChange("end", "")}
                  className="ml-1 hover:text-purple-900"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
