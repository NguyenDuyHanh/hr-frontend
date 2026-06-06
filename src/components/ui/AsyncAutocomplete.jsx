import React, { memo, useEffect, useState, useMemo, Fragment } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { FastField, getIn } from "formik";

/**
 * AsyncAutocomplete - Modernized MUI v5 Async Autocomplete with Formik integration.
 * Standards: FastField + shouldComponentUpdate + useMemo (props).
 */

const AsyncAutocomplete = React.forwardRef((props, ref) => {
  return (
    <FastField
      {...props}
      name={props.name}
      shouldUpdate={shouldComponentUpdate}
    >
      {({ field, meta, form }) => (
        <MyAsyncAutocomplete
          {...props}
          field={field}
          meta={meta}
          setFieldValue={form.setFieldValue}
          ref={ref}
        />
      )}
    </FastField>
  );
});

const shouldComponentUpdate = (nextProps, currentProps) => {
  return (
    nextProps.name !== currentProps.name ||
    nextProps.api !== currentProps.api ||
    nextProps.searchObject !== currentProps.searchObject ||
    nextProps.value !== currentProps.value ||
    nextProps.onChange !== currentProps.onChange ||
    nextProps.label !== currentProps.label ||
    nextProps.required !== currentProps.required ||
    nextProps.disabled !== currentProps.disabled ||
    nextProps.readOnly !== currentProps.readOnly ||
    nextProps.formik.isSubmitting !== currentProps.formik.isSubmitting ||
    Object.keys(nextProps).length !== Object.keys(currentProps).length ||
    getIn(nextProps.formik.values, currentProps.name) !==
      getIn(currentProps.formik.values, currentProps.name) ||
    getIn(nextProps.formik.errors, currentProps.name) !==
      getIn(currentProps.formik.errors, currentProps.name) ||
    getIn(nextProps.formik.touched, currentProps.name) !==
      getIn(currentProps.formik.touched, currentProps.name)
  );
};

const MyAsyncAutocomplete = React.forwardRef(({
  name,
  api,
  displayData,
  variant = "outlined",
  size = "small",
  searchObject,
  label,
  shrink = false,
  required = false,
  validate = false,
  placeholder = "",
  getOptionDisabled = (option) => false,
  oldStyle = false,
  readOnly = false,
  field,
  meta,
  setFieldValue,
  ...otherProps
}, ref) => {

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const loading = open && options?.length === 0;

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      let response;
      try {
        if (searchObject != null) {
          response = await api(searchObject);
        } else {
          response = await api();
        }

        if (active && response.data) {
          const data = response.data.content || response.data;
          if (Array.isArray(data)) {
            setOptions(data);
          } else {
            setOptions([]);
          }
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
        setOptions([]);
      }
    })();

    return () => {
      active = false;
    };
  }, [api, loading, searchObject]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  const handleChange = (_, value) => {
    if (readOnly) return;
    setFieldValue(name, value ? value : null);
  };

  const defaultGetOptionLabel = (option) => {
    if (!option) return "";
    const displayKey = otherProps?.displayName || "name";
    return option[displayKey] || "";
  };

  const isError = !!(meta && meta.touched && meta.error);
  const helperText = isError ? meta.error : (otherProps.helperText || "");
  const getOptionLabel = otherProps?.getOptionLabel || defaultGetOptionLabel;

  // Rule 05: useMemo for style and input params
  const sxMemo = useMemo(() => ({
    '& .MuiInputBase-root': {
      backgroundColor: (theme) => readOnly ? (theme.palette.mode === 'light' ? '#f5f5f5 !important' : 'rgba(255, 255, 255, 0.05) !important') : 'inherit',
      transition: 'all 0.2s ease-in-out',
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: '#d1d5db !important',
      },
      '&.Mui-error:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#9ca3af !important',
      },
      '&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: (theme) => theme.palette.primary.main + ' !important',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: (theme) => theme.palette.mode === 'light' ? '#d1d5db' : 'rgba(255, 255, 255, 0.15)',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: (theme) => theme.palette.mode === 'light' ? '#9ca3af' : 'rgba(255, 255, 255, 0.3)',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: (theme) => theme.palette.primary.main,
      },
      '&:hover': {
        backgroundColor: (theme) => readOnly 
          ? (theme.palette.mode === 'light' ? '#f5f5f5 !important' : 'rgba(255, 255, 255, 0.05) !important') 
          : (theme.palette.mode === 'light' ? '#ffffff' : 'inherit'),
      },
      '&.Mui-focused': {
        backgroundColor: (theme) => theme.palette.mode === 'light' ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
        boxShadow: (theme) => theme.palette.mode === 'light'
          ? '0 0 0 2px rgba(25, 118, 210, 0.1)'
          : `0 0 0 2px ${theme.palette.primary.main}26`,
      }
    },
    ...otherProps.sx
  }), [readOnly, otherProps.sx]);

  const renderInput = useMemo(() => (params) => (
    <TextField
      {...params}
      variant={variant}
      placeholder={placeholder}
      error={isError}
      helperText={helperText}
      InputLabelProps={{
        ...params.InputLabelProps,
        shrink: true,
      }}
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <Fragment>
            {loading && !readOnly ? (
              <CircularProgress color="inherit" size={20} />
            ) : null}
            {params.InputProps.endAdornment}
          </Fragment>
        ),
      }}
      sx={sxMemo}
    />
  ), [variant, placeholder, isError, helperText, loading, readOnly, sxMemo]);

  return (
    <div className="w-full mb-4">
      {label && (
        <label 
          htmlFor={name} 
          className={`block text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-400 ${oldStyle ? 'text-xs' : ''}`}
        >
          {label} {(validate || required) && <span className="text-red-500 font-bold ml-1">*</span>}
        </label>
      )}
      <Autocomplete
        {...field}
        {...otherProps}
        id={name}
        ref={ref}
        open={readOnly ? false : open}
        size={size}
        onOpen={() => !readOnly && setOpen(true)}
        onClose={() => setOpen(false)}
        onChange={handleChange}
        isOptionEqualToValue={(option, value) => {
          if (!option || !value) return false;
          return option.id === value.id;
        }}
        getOptionLabel={getOptionLabel}
        getOptionDisabled={readOnly ? () => true : getOptionDisabled}
        options={options}
        loading={loading && !readOnly}
        renderInput={renderInput}
      />
    </div>
  );
});

export default memo(AsyncAutocomplete);
