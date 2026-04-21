import React, { useEffect, useMemo, useState, useRef, useCallback, memo } from "react";
import { FastField, getIn } from "formik";
import { isEqual } from "lodash";
import clsx from "clsx";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";
import UiRequiredLabel from "./UiRequiredLabel";
import { styled } from "@mui/material/styles";

const PAGE_SIZE = 20;

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "& .MuiAutocomplete-inputRoot": {
    paddingTop: "0px !important",
    paddingBottom: "0px !important",
  },
  "& .MuiAutocomplete-input": {
    height: "auto !important",
  },
}));

/**
 * High-performance Paging Autocomplete V2 component.
 * Standardized for MUI v5.
 */
const UiPagingAutocompleteV2 = (props) => {
  const { name, ...other } = props;

  const shouldUpdate = useCallback((nextProps, currentProps) => {
    return (
      nextProps.name !== currentProps.name ||
      nextProps.label !== currentProps.label ||
      nextProps.required !== currentProps.required ||
      nextProps.disabled !== currentProps.disabled ||
      nextProps.readOnly !== currentProps.readOnly ||
      nextProps.api !== currentProps.api ||
      nextProps.getOptionDisabled !== currentProps.getOptionDisabled ||
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
    api,
    name,
    searchObject,
    allowLoadOptions = true,
    clearOptionOnClose,
    handleChange: externalHandleChange,
    field,
    meta,
    setFieldValue,
    label,
    oldStyle = false,
    required,
    getOptionDisabled,
    readOnly = false,
    ...otherProps
  } = props;

  // DEBUG: console.log(`Render [UiPagingAutocompleteV2]: ${name}`);

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
      .then(({ data }) => {
        if (data && data.content) {
          setOptions((prev) => isLoadMore ? [...prev, ...data.content] : [...data.content]);
          setTotalPage(data.totalPages || 1);
        } else {
          if (!isLoadMore) setOptions([]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [api, allowLoadOptions, searchObject]);

  useEffect(() => {
    if (open && allowLoadOptions) {
      setPage(1);
      loadData(1, keyword);
    }
  }, [open, keyword, searchObject, allowLoadOptions, loadData]);

  const handleScroll = (event) => {
    const listboxNode = event.currentTarget;
    const position = listboxNode.scrollTop + listboxNode.clientHeight;
    if (listboxNode.scrollHeight - position <= 8 && page < totalPage && !loading) {
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
    if (externalHandleChange) {
      externalHandleChange(event, value);
    } else {
      setFieldValue(name, value || null);
    }
  };

  const defaultGetOptionLabel = useCallback((option) => {
    if (!option) return "";
    return option[otherProps?.displayName ? otherProps?.displayName : "name"] || "";
  }, [otherProps?.displayName]);

  const isError = Boolean(meta && meta.touched && meta.error);

  const memoSx = useMemo(() => ({
    "& .MuiOutlinedInput-root": {
      backgroundColor: (readOnly || otherProps.disabled) ? "rgba(0, 0, 0, 0.05)" : "inherit",
    },
    ...otherProps.sx
  }), [readOnly, otherProps.disabled, otherProps.sx]);

  const memoInputProps = useMemo(() => ({
    ...otherProps.InputProps,
    endAdornment: (
      <React.Fragment>
        {loading ? <CircularProgress color="inherit" size={20} /> : null}
        {otherProps.InputProps?.endAdornment}
      </React.Fragment>
    ),
    readOnly: readOnly,
    autoComplete: "off",
  }), [loading, otherProps.InputProps, readOnly]);

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label htmlFor={name} className={clsx(oldStyle ? "old-label" : "label-container", readOnly && "read-only")}>
          <UiRequiredLabel label={label} requiredLabel={required} />
        </label>
      )}

      <StyledAutocomplete
        {...otherProps}
        id={name}
        options={options}
        loading={loading && !readOnly}
        open={readOnly ? false : open}
        onOpen={() => setOpen(true)}
        onClose={() => {
          setOpen(false);
          setKeyword("");
          if (clearOptionOnClose) {
            setOptions([]);
            setTotalPage(1);
          }
        }}
        value={field.value || (otherProps.multiple ? [] : null)}
        onChange={handleChange}
        onInputChange={handleInputChange}
        getOptionLabel={otherProps.getOptionLabel || defaultGetOptionLabel}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        getOptionDisabled={readOnly ? () => true : getOptionDisabled}
        noOptionsText={t ? t("general.noData") : "Không có dữ liệu"}
        ListboxProps={{
          onScroll: handleScroll,
        }}
        className={clsx(readOnly && "read-only")}
        renderInput={(params) => (
          <TextField
            {...params}
            variant={otherProps.variant || "outlined"}
            size="small"
            error={isError}
            helperText={isError ? meta.error : ""}
            InputProps={{
              ...params.InputProps,
              ...memoInputProps,
            }}
            sx={memoSx}
            className="input-container"
          />
        )}
      />
    </div>
  );
}

export default memo(UiPagingAutocompleteV2);
