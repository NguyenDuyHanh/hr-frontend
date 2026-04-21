import React, { useEffect, useState, useRef, useCallback, memo, useMemo } from "react";
import { FastField, getIn } from "formik";
import { isEqual } from "lodash";
import clsx from "clsx";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useTranslation } from "react-i18next";
import UiRequiredLabel from "./UiRequiredLabel";
import { styled } from "@mui/material/styles";

const PAGE_SIZE = 22;

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    padding: "2px 0 !important",
  },
  "& .MuiAutocomplete-tag": {
    margin: "2px",
  }
}));

/**
 * High-performance Paging Checkbox Detail component.
 * Features: Silent Render (FastField), Infinite Scroll, Select All, Debounced Search.
 */
const UiPagingCheckboxDetail = (props) => {
  const { name, ...other } = props;

  const shouldUpdate = useCallback((nextProps, currentProps) => {
    return (
      nextProps.name !== currentProps.name ||
      nextProps.label !== currentProps.label ||
      nextProps.required !== currentProps.required ||
      nextProps.disabled !== currentProps.disabled ||
      nextProps.readOnly !== currentProps.readOnly ||
      nextProps.api !== currentProps.api ||
      !isEqual(nextProps.searchObject, currentProps.searchObject) ||
      nextProps.formik.isSubmitting !== currentProps.formik.isSubmitting ||
      getIn(nextProps.formik.values, currentProps.name) !== getIn(currentProps.formik.values, currentProps.name) ||
      getIn(nextProps.formik.errors, currentProps.name) !== getIn(currentProps.formik.errors, currentProps.name) ||
      getIn(nextProps.formik.touched, currentProps.name) !== getIn(currentProps.formik.touched, currentProps.name)
    );
  }, []);

  return (
    <FastField name={name} shouldUpdate={shouldUpdate}>
      {({ field, meta, form }) => (
        <MyPagingCheckboxDetail 
          {...other} 
          name={name}
          field={field} 
          meta={meta} 
          setFieldValue={form.setFieldValue} 
        />
      )}
    </FastField>
  );
};

function MyPagingCheckboxDetail(props) {
  const {
    api,
    label,
    size = "small",
    variant = "outlined",
    name,
    hideSelectAll = true,
    searchObject,
    required,
    oldStyle = false,
    getOptionLabel: getOptionLabelProp,
    getOptionLabelCustom,
    field,
    meta,
    setFieldValue,
    disabled,
    handleChange: customHandleChange,
    readOnly = false,
    ...otherProps
  } = props;

  // DEBUG: console.log(`Render [UiPagingCheckboxDetail]: ${name}`);

  const { t } = useTranslation();
  const listSelected = field?.value || [];

  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [inputValue, setInputValue] = useState("");
  const typingTimerRef = useRef(null);

  const loadData = useCallback(async (pageIndex, isReset = false) => {
    if (!api) return;

    const payload = {
      pageIndex,
      pageSize: PAGE_SIZE,
      keyword: keyword || null,
      ...searchObject,
    };

    api(payload).then(({ data }) => {
      const content = data?.content || [];
      if (content.length > 0) {
        setOptions((prev) => {
          let newOptions = isReset ? content : [...prev, ...content];
          
          // Ensure selected items are in options
          if (listSelected?.length > 0) {
            listSelected.forEach((selected) => {
              if (!newOptions.some((o) => o.id === selected.id)) {
                newOptions.unshift(selected);
              }
            });
          }
          return newOptions;
        });

        setHasMore(content.length >= PAGE_SIZE);
      } else {
        if (isReset) setOptions(listSelected || []);
        setHasMore(false);
      }
    });
  }, [api, keyword, searchObject, listSelected]);

  useEffect(() => {
    if (!open) return;
    setPage(1);
    loadData(1, true);
  }, [keyword, open, loadData]);

  const internalGetOptionLabel = useCallback((option) => {
    if (getOptionLabelProp) return getOptionLabelProp(option);
    if (getOptionLabelCustom) return getOptionLabelCustom(option);
    return option?.name || option?.description || "";
  }, [getOptionLabelProp, getOptionLabelCustom]);

  const handleClearOptions = useCallback(() => setFieldValue(name, []), [name, setFieldValue]);

  const allSelected = useMemo(() => options?.length > 0 && options?.length === listSelected?.length, [options, listSelected]);

  const handleToggleSelectAll = useCallback(() => {
    if (allSelected) {
      handleClearOptions();
    } else {
      setFieldValue(name, options);
    }
  }, [allSelected, options, name, setFieldValue, handleClearOptions]);

  const handleChange = (event, selectedOptions, reason) => {
    if (readOnly) return;

    if (reason === "select-option" || reason === "remove-option") {
      const selectAllClicked = selectedOptions.some((opt) => opt.value === "select-all");
      if (selectAllClicked && !hideSelectAll) {
        handleToggleSelectAll();
      } else {
        setFieldValue(name, selectedOptions);
      }
    } else if (reason === "clear") {
      handleClearOptions();
    } else {
        setFieldValue(name, selectedOptions || []);
    }

    if (customHandleChange) {
      customHandleChange(selectedOptions);
    }
  };

  const handleInputChange = (event, value, reason) => {
    if (reason === "input" || reason === "clear") {
      setInputValue(value);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setKeyword(value || "");
      }, 500);
    }
  };

  const handleScroll = (event) => {
    const listboxNode = event.currentTarget;
    if (hasMore && listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 10) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage);
    }
  };

  const filter = createFilterOptions();

  const isError = Boolean(meta && meta.touched && meta.error);

  const memoSx = useMemo(() => ({
    "& .MuiOutlinedInput-root": {
      backgroundColor: (readOnly || disabled) ? "rgba(0, 0, 0, 0.05)" : "inherit",
    },
    ...otherProps.sx
  }), [readOnly, disabled, otherProps.sx]);

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label htmlFor={name} className={clsx(oldStyle ? "old-label" : "label-container", readOnly && "read-only")}>
          <UiRequiredLabel label={label} requiredLabel={required} />
        </label>
      )}
      <StyledAutocomplete
        {...otherProps}
        multiple
        options={options}
        value={listSelected}
        getOptionLabel={internalGetOptionLabel}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        name={name}
        onChange={handleChange}
        onInputChange={handleInputChange}
        inputValue={inputValue}
        open={open && !readOnly}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        disableCloseOnSelect
        disabled={disabled || readOnly}
        noOptionsText={t ? t("general.emptyDataMessageTable") : "Không có dữ liệu"}
        filterOptions={(opts, params) => {
          const filtered = filter(opts, params);
          return hideSelectAll ? filtered : [{ description: "Chọn tất cả", value: "select-all" }, ...filtered];
        }}
        renderOption={(props, option, { selected }) => {
          const isSelectAll = option.value === "select-all";
          const checked = isSelectAll ? allSelected : selected;
          return (
            <li {...props}>
              <Checkbox
                color="primary"
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                sx={{ mr: 1, p: 0 }}
                checked={checked}
              />
              {internalGetOptionLabel(option)}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size={size}
            variant={variant}
            error={isError}
            helperText={isError ? meta.error : ""}
            className="input-container"
            sx={memoSx}
            InputProps={{
                ...params.InputProps,
                readOnly: readOnly,
                autoComplete: "off",
            }}
          />
        )}
        ListboxProps={{
          onScroll: handleScroll,
        }}
      />
    </div>
  );
}

export default memo(UiPagingCheckboxDetail);
