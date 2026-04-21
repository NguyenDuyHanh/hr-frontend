import React, { useEffect, useMemo, useState, useRef, useCallback, memo } from "react";
import { FastField, getIn } from "formik";
import { isEqual } from "lodash";
import clsx from "clsx";
import Popper from "@mui/material/Popper";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";
import UiRequiredLabel from "./UiRequiredLabel";

const PAGE_SIZE = 10;

const CustomPopper = (props) => {
  return <Popper {...props} placement="bottom-start" />;
};

/**
 * High-performance Paging Autocomplete component.
 * Features: Silent Render (FastField), Infinite Scroll, Debounced Search (useRef), MUI v5 Standards.
 */
const UiPagingAutocomplete = (props) => {
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
        <MyPagingAutocomplete 
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

function MyPagingAutocomplete(props) {
  const {
    name,
    api,
    displayData = "name",
    size = "small",
    searchObject,
    label,
    sortOptions,
    field,
    meta,
    setFieldValue,
    onChange,
    getOptionLabel,
    isOptionEqualToValue,
    getOptionDisabled,
    allowLoadOptions = true,
    disableClearable,
    fullWidth = true,
    required = false,
    placeholder = "",
    InputProps,
    oldStyle = false,
    readOnly = false,
    customData,
    ...otherProps
  } = props;

  // DEBUG: console.log(`Render [UiPagingAutocomplete]: ${name}`);

  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [totalPage, setTotalPage] = useState(1);
  const [open, setOpen] = useState(false);
  const typingTimerRef = useRef(null);

  const loadData = useCallback((pageIndex, searchKeyword, isLoadMore = false) => {
    if (!api || !allowLoadOptions) return;

    setLoading(true);
    api({
      ...searchObject,
      pageIndex: pageIndex,
      pageSize: PAGE_SIZE,
      keyword: searchKeyword || "",
    })
      .then((response) => {
        const result = customData ? response[customData] : response;
        const data = result?.data || result; // Handle both {data: {content}} and {content}
        const content = data?.content || [];

        setOptions((prev) => {
          const newContent = sortOptions ? sortOptions(content) : content;
          return isLoadMore ? [...prev, ...newContent] : newContent;
        });
        setTotalPage(data?.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [api, allowLoadOptions, searchObject, customData, sortOptions]);

  useEffect(() => {
    if (open && allowLoadOptions) {
      setPage(1);
      loadData(1, keyword);
    }
  }, [open, keyword, searchObject, allowLoadOptions, loadData]);

  const handleScroll = (event) => {
    const listboxNode = event.currentTarget;
    const position = listboxNode.scrollTop + listboxNode.clientHeight;
    if (listboxNode.scrollHeight - position <= 10 && page < totalPage && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage, keyword, true);
    }
  };

  const handleInputChange = (event, newInputValue, reason) => {
    if (reason === "input") {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setKeyword(newInputValue);
      }, 500);
    } else if (reason === "clear") {
      setKeyword("");
    }
  };

  const handleChange = (event, value) => {
    if (readOnly) return;
    if (onChange) {
      onChange(event, value);
    } else {
      setFieldValue(name, value || null);
    }
  };

  const internalGetOptionLabel = useCallback((option) => {
    if (getOptionLabel) return getOptionLabel(option);
    if (!option) return "";
    return displayData.split(".").reduce((obj, key) => obj?.[key], option) || "";
  }, [getOptionLabel, displayData]);

  const internalIsOptionEqualToValue = useCallback((option, value) => {
    if (isOptionEqualToValue) return isOptionEqualToValue(option, value);
    return option?.id === value?.id;
  }, [isOptionEqualToValue]);

  const isError = Boolean(meta && meta.touched && meta.error);

  const memoSx = useMemo(() => ({
    "& .MuiOutlinedInput-root": {
      backgroundColor: readOnly ? "rgba(0, 0, 0, 0.05)" : "inherit",
    },
    ...otherProps.sx
  }), [readOnly, otherProps.sx]);

  const memoInputProps = useMemo(() => ({
    ...InputProps,
    endAdornment: (
      <React.Fragment>
        {loading ? <CircularProgress color="inherit" size={20} /> : null}
        {InputProps?.endAdornment}
      </React.Fragment>
    ),
    readOnly: readOnly,
  }), [loading, InputProps, readOnly]);

  return (
    <div style={{ width: fullWidth ? "100%" : "auto" }}>
      {label && (
        <label
          htmlFor={name}
          className={clsx(oldStyle ? "old-label" : "label-container", readOnly && "read-only")}
        >
          <UiRequiredLabel label={label} requiredLabel={required} />
        </label>
      )}
      <Autocomplete
        {...otherProps}
        id={name}
        open={open && !readOnly}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={options}
        loading={loading}
        value={field.value || null}
        onChange={handleChange}
        onInputChange={handleInputChange}
        getOptionLabel={internalGetOptionLabel}
        isOptionEqualToValue={internalIsOptionEqualToValue}
        getOptionDisabled={getOptionDisabled}
        disableClearable={disableClearable}
        fullWidth={fullWidth}
        size={size}
        PopperComponent={CustomPopper}
        noOptionsText={t ? t("general.noData") : "Không có dữ liệu"}
        ListboxProps={{
          onScroll: handleScroll,
        }}
        className={clsx(readOnly && "read-only")}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            error={isError}
            helperText={isError ? meta.error : ""}
            variant={otherProps.variant || "outlined"}
            className="input-container"
            InputProps={{
              ...params.InputProps,
              ...memoInputProps,
            }}
            sx={memoSx}
          />
        )}
      />
    </div>
  );
}

export default memo(UiPagingAutocomplete);
