import React, { memo, useEffect, useState, useMemo } from "react";
import MuiAutocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { FastField, getIn } from "formik";

/**
 * Autocomplete - Modernized MUI v5 Autocomplete with Formik integration.
 * Standards: FastField + shouldComponentUpdate + useMemo (props).
 */

const Autocomplete = React.forwardRef((props, ref) => {
  return (
    <FastField
      {...props}
      name={props.name}
      shouldUpdate={shouldComponentUpdate}
    >
      {({ field, meta, form }) => (
        <MyAutocomplete
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
    nextProps.options !== currentProps.options ||
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

const MyAutocomplete = React.forwardRef(({
  name,
  options = [],
  displayData,
  variant = "outlined",
  size = "small",
  isObject = true,
  label = "",
  getOptionLabel: getOptionLabelProp,
  onChange: onChangeProp,
  defaultValue,
  validate,
  required = false,
  oldStyle = false,
  readOnly = false,
  field,
  meta,
  setFieldValue,
  placeholder = "",
  ...otherProps
}, ref) => {

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (defaultValue) {
      if (onChangeProp) {
        onChangeProp(defaultValue);
      } else {
        defaultHandleChange(null, defaultValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  const defaultHandleChange = (_, value) => {
    if (readOnly) return;
    if (isObject !== null && !isObject) {
      setFieldValue(name, value?.value ? value.value : null);
    } else {
      setFieldValue(name, value ? value : null);
    }
  };

  const defaultGetOptionLabel = (option) => {
    if (!option) return "";
    const displayKey = displayData || "name";
    return option[displayKey] ? option[displayKey] : "";
  };

  const isError = !!(meta && meta.touched && meta.error);
  const helperText = isError ? meta.error : otherProps.helperText;
  const getOptionLabel = getOptionLabelProp || defaultGetOptionLabel;

  // Rule 05: useMemo for SX and object props
  const sxMemo = useMemo(() => ({
    '& .MuiInputBase-root': {
      backgroundColor: (theme) => (readOnly || otherProps.disabled) 
        ? (theme.palette.mode === 'light' ? '#f5f5f5 !important' : 'rgba(255, 255, 255, 0.05) !important') 
        : 'inherit',
      transition: 'all 0.2s ease-in-out',
      '&.Mui-disabled': {
        backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5 !important' : 'rgba(255, 255, 255, 0.05) !important',
        color: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.6) !important' : 'rgba(255, 255, 255, 0.5) !important',
        WebkitTextFillColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.6) !important' : 'rgba(255, 255, 255, 0.5) !important',
        '& .MuiInputBase-input': {
          color: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.6) !important' : 'rgba(255, 255, 255, 0.5) !important',
          WebkitTextFillColor: (theme) => theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.6) !important' : 'rgba(255, 255, 255, 0.5) !important',
        }
      },
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
        backgroundColor: (theme) => (readOnly || otherProps.disabled) 
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
  }), [readOnly, otherProps.disabled, otherProps.sx]);

  const renderInput = useMemo(() => (params) => {
    // Manual sync fallback for input display if needed
    if (field?.value && !params?.inputProps?.value) {
      params.inputProps.value = getOptionLabel(field?.value);
    }

    return (
      <TextField
        {...params}
        variant={variant}
        error={isError}
        helperText={helperText}
        placeholder={placeholder}
        InputLabelProps={{
          ...params.InputLabelProps,
          shrink: true,
        }}
        sx={sxMemo}
      />
    );
  }, [variant, isError, helperText, placeholder, sxMemo, field?.value, getOptionLabel]);

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
      <MuiAutocomplete
        {...field}
        {...otherProps}
        id={name}
        ref={ref}
        size={size}
        options={options}
        open={readOnly ? false : open}
        onOpen={() => !readOnly && setOpen(true)}
        onClose={() => setOpen(false)}
        getOptionLabel={getOptionLabel}
        onChange={onChangeProp || defaultHandleChange}
        isOptionEqualToValue={(option, value) => {
          if (!option || !value) return false;
          return option.id === value.id;
        }}
        disabled={readOnly || otherProps.disabled}
        renderInput={renderInput}
      />
    </div>
  );
});

export default memo(Autocomplete);
