import React, { useState, useCallback, memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";

/**
 * High-performance Search Input component.
 * Standardized for MUI v5 / Standard UI.
 */
function UiSearchInput({ search }) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState("");

  const handleSearch = useCallback(() => {
    if (search) {
      search({ keyword });
    }
  }, [search, keyword]);

  const handleKeyDownEnterSearch = useCallback((event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);

  const handleChange = useCallback((e) => {
    setKeyword(e.target.value);
  }, []);

  return (
    <FormControl fullWidth>
      <div
        className="
          group relative flex items-center
          bg-gray-50 border border-gray-200
          rounded-full shadow-sm
          px-4 py-2
          transition-all duration-300
          focus-within:ring-2 focus-within:ring-blue-500
          hover:shadow-md hover:border-gray-300
        "
      >
        {/* Icon search */}
        <SearchIcon
          className="
            text-gray-400 group-hover:text-blue-500
          "
          fontSize="small"
        />

        {/* Input */}
        <input
          value={keyword}
          onChange={handleChange}
          onKeyDown={handleKeyDownEnterSearch}
          placeholder={t("general.enterSearch")}
          className="
            flex-1 bg-transparent outline-none border-none
            text-gray-700 dark:text-gray-200 text-sm ml-3
            placeholder-gray-400
          "
        />

        {/* Button */}
        <IconButton
          onClick={handleSearch}
          className="!text-gray-500 hover:!text-blue-600 ml-1"
          size="small"
        >
          <SearchIcon fontSize="small" />
        </IconButton>
      </div>
    </FormControl>
  );
}

export default memo(UiSearchInput);
