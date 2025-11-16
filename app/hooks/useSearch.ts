import { useState, useMemo } from "react";

/**
 * Custom hook for client-side search functionality
 * Filters items based on a search query and custom filter function
 *
 * @param items - Array of items to search through
 * @param filterFn - Function that determines if an item matches the search query
 * @returns Object with searchQuery, setSearchQuery, filteredItems, and handleSearch
 *
 * @example
 * const { searchQuery, filteredItems, handleSearch } = useSearch(
 *   projects,
 *   (project, query) => project.name.toLowerCase().includes(query)
 * );
 */
export function useSearch<T>(
  items: T[],
  filterFn: (item: T, query: string) => boolean
) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => filterFn(item, query));
  }, [items, searchQuery, filterFn]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredItems,
    handleSearch,
  };
}
