import React, { memo, useEffect, useState, useMemo } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { FastField, getIn } from "formik";

/**
 * UiAutocomplete - Modernized MUI v5 Autocomplete with Formik integration.
 * Standards: FastField + shouldComponentUpdate + useMemo (props).
 */

const UiAutocomplete = React.forwardRef((props, ref) => {
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
      backgroundColor: readOnly ? '#f5f5f5 !important' : 'inherit',
      transition: 'all 0.2s ease-in-out',
      '&.Mui-error .MuiOutlinedInput-notchedOutline': {
        borderColor: '#d1d5db !important',
      },
      '&.Mui-error:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#9ca3af !important',
      },
      '&.Mui-error.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1976d2 !important',
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#d1d5db',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#9ca3af',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1976d2',
      },
      '&:hover': {
        backgroundColor: readOnly ? '#f5f5f5 !important' : '#ffffff',
      },
      '&.Mui-focused': {
        backgroundColor: '#ffffff',
        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
      }
    },
    ...otherProps.sx
  }), [readOnly, otherProps.sx]);

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
          className={`block text-sm font-semibold mb-1.5 text-gray-700 ${oldStyle ? 'text-xs' : ''}`}
        >
          {label} {(validate || required) && <span className="text-red-500 font-bold ml-1">*</span>}
        </label>
      )}
      <Autocomplete
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
        disabled={readOnly}
        renderInput={renderInput}
      />
    </div>
  );
});

export default memo(UiAutocomplete);
