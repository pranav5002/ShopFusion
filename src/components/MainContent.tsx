import React, { useState, useEffect } from "react";
import { useFilter } from "./FilterContext";
import { Tally3, Loader2 } from "lucide-react";
import axios from "axios";
import BookCard from "./BookCard";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";

// 1. Create the client OUTSIDE the component function
const internalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 1,
    },
  },
});

const MainContentComponent = () => {
  const { searchQuery, selectedCategory, minPrice, maxPrice, keyword } =
    useFilter();
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const itemsPerPage = 12;

  // Debounce logic for speed
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(handler);
  }, [keyword]);

  // Fetcher function
  const fetchProducts = async () => {
    let url = `https://dummyjson.com/products?limit=${itemsPerPage}&skip=${(currentPage - 1) * itemsPerPage}`;
    if (debouncedKeyword)
      url = `https://dummyjson.com/products/search?q=${debouncedKeyword}`;
    else if (selectedCategory)
      url = `https://dummyjson.com/products/category/${selectedCategory}`;

    const { data } = await axios.get(url);
    return data.products;
  };

  // The Hook
  const {
    data: products = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["products", currentPage, debouncedKeyword, selectedCategory],
    queryFn: fetchProducts,
    placeholderData: keepPreviousData,
  });

  const getFilteredProducts = () => {
    let filtered = [...products];
    if (minPrice !== undefined)
      filtered = filtered.filter((p) => p.price >= minPrice);
    if (maxPrice !== undefined)
      filtered = filtered.filter((p) => p.price <= maxPrice);
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    switch (filter) {
      case "Cheap":
        return filtered.sort((a, b) => a.price - b.price);
      case "Expensive":
        return filtered.sort((a, b) => b.price - a.price);
      case "Popular":
        return filtered.sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  };

  const filteredProducts = getFilteredProducts();

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const totalProducts = 100;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const getPaginationButtons = () => {
    const buttons: number[] = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage - 2 < 1) {
      endPage = Math.min(totalPages, endPage + (2 - currentPage - 1));
    }

    if (currentPage + 2 > totalPages) {
      startPage = Math.min(1, startPage - (2 - (totalPages - currentPage)));
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(i);
    }

    return buttons;
  };

  return (
    <section className="p-5">
      <div className="flex justify-between items-center mb-5">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="border px-4 py-2 rounded-full flex items-center bg-white shadow-sm hover:bg-gray-50 font-medium"
          >
            <Tally3 className="mr-2 size-4" />
            {filter === "all" ? "Sort By" : filter}
            {isFetching && (
              <Loader2 className="ml-2 animate-spin size-4 text-blue-500" />
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 bg-white border rounded shadow-xl mt-2 w-40">
              {["Cheap", "Expensive", "Popular"].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setDropdownOpen(false);
                  }}
                  className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin size-10 text-blue-500" />
          <p className="mt-4 text-gray-500">Loading fast...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <BookCard
              key={product.id}
              id={product.id}
              title={product.title}
              image={product.thumbnail}
              price={product.price}
            />
          ))}
        </div>
      )}

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-5">
          {/* previous */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="border px-4 py-2 mx-2 rounded-full font-medium"
          >
            Previous
          </button>

          {/* 1,2,3,4,5 */}
          <div className="flex flex-wrap justify-center font-medium">
            {/* pagination buttons */}
            {getPaginationButtons().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`border px-4 py-2 mx-1 rounded-full ${page === currentPage ? "bg-black text-white" : ""}`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* next */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border px-4 py-2 mx-2 rounded-full font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

const MainContent = () => (
  <QueryClientProvider client={internalQueryClient}>
    <MainContentComponent />
  </QueryClientProvider>
);

export default MainContent;
