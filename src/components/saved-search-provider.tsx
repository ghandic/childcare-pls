import { CalculateParentalLeaveEntitlement } from "@/lib/utils";
import React, { createContext, useContext, useState, useEffect } from "react";

interface SavedSearch {
  id: string;
  name: string;
  values: CalculateParentalLeaveEntitlement;
}

interface SavedSearchContextProps {
  savedSearches: SavedSearch[];
  saveSearch: (search: SavedSearch) => void;
  deleteSearch: (id: string) => void;
}

const SavedSearchContext = createContext<SavedSearchContextProps | undefined>(
  undefined
);

export const SavedSearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    const storedSearches = localStorage.getItem("savedSearches");
    if (storedSearches) {
      setSavedSearches(JSON.parse(storedSearches));
    }
  }, []);

  const saveSearch = (search: SavedSearch) => {
    const updatedSearches = [...savedSearches, search];
    setSavedSearches(updatedSearches);
    localStorage.setItem("savedSearches", JSON.stringify(updatedSearches));
  };

  const deleteSearch = (id: string) => {
    const updatedSearches = savedSearches.filter((search) => search.id !== id);
    setSavedSearches(updatedSearches);
    localStorage.setItem("savedSearches", JSON.stringify(updatedSearches));
  };

  return (
    <SavedSearchContext.Provider
      value={{ savedSearches, saveSearch, deleteSearch }}
    >
      {children}
    </SavedSearchContext.Provider>
  );
};

export const useSavedSearch = () => {
  const context = useContext(SavedSearchContext);
  if (!context) {
    throw new Error("useSavedSearch must be used within a SavedSearchProvider");
  }
  return context;
};
