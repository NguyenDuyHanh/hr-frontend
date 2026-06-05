import React, { useState, useCallback, memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

/**
 * High-performance Search Input component.
 * Standardized for MUI v5 / Standard UI.
 * Supports both controlled (value/onChange) and uncontrolled (search callback) modes.
 */
function UiSearchInput({
  value: controlledValue,
  onChange,
  onKeyDown,
  placeholder,
  search, // search({ keyword })
  className = "",
  hideButton = false,
}) {
  const { t } = useTranslation();
  const [internalKeyword, setInternalKeyword] = useState("");
  const isControlled = controlledValue !== undefined;
  const keyword = isControlled ? (controlledValue ?? "") : internalKeyword;

  const handleSearch = useCallback(() => {
    if (search) {
      search({ keyword });
    }
  }, [search, keyword]);

  const handleKeyDownEnterSearch = useCallback((event) => {
    if (event.key === "Enter") {
      if (onKeyDown) {
        onKeyDown(event);
      } else {
        handleSearch();
      }
    }
  }, [handleSearch, onKeyDown]);

  const handleChange = useCallback((e) => {
    if (isControlled) {
      onChange?.(e);
    } else {
      setInternalKeyword(e.target.value);
    }
  }, [isControlled, onChange]);

  const handleClear = useCallback(() => {
    if (isControlled) {
      onChange?.({ target: { value: "" } });
    } else {
      setInternalKeyword("");
    }
  }, [isControlled, onChange]);

  return (
    <FormControl fullWidth className={className}>
      <div
        className="
          group relative flex items-center
          bg-background border border-border
          rounded-lg shadow-sm
          px-3 py-1.5 h-[36px]
          transition-all duration-300
          focus-within:ring-2 focus-within:ring-ring/40 focus-within:border-primary
          hover:border-border
        "
      >
        {/* Icon search */}
        <SearchIcon
          className="text-muted-foreground group-hover:text-primary transition-colors"
          fontSize="small"
        />

        {/* Input */}
        <input
          value={keyword}
          onChange={handleChange}
          onKeyDown={handleKeyDownEnterSearch}
          placeholder={placeholder || t("general.enterSearch")}
          className={`
            flex-1 bg-transparent outline-none border-none
            text-foreground text-sm ml-2.5
            placeholder-muted-foreground
            ${hideButton ? 'mr-6' : 'mr-12'}
          `}
        />

        {/* Clear Button */}
        {keyword && (
          <button
            type="button"
            onClick={handleClear}
            className={`
              absolute text-muted-foreground hover:text-foreground
              ${hideButton ? 'right-2.5' : 'right-9'}
            `}
            aria-label="Xoá tìm kiếm"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        )}

        {/* Search Trigger Button */}
        {!hideButton && (
          <IconButton
            onClick={handleSearch}
            className="!text-muted-foreground hover:!text-primary ml-1"
            size="small"
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        )}
      </div>
    </FormControl>
  );
}

export default memo(UiSearchInput);
