import React, { memo, useMemo } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { FastField, getIn } from "formik";

/**
 * UiSelectInput - Modernized MUI v5 Select Input with Formik integration.
 * Standards: FastField + shouldComponentUpdate + useMemo.
 */

const UiSelectInput = React.forwardRef((props, ref) => {
  return (
    <FastField
      {...props}
      name={props.name}
      shouldUpdate={shouldComponentUpdate}
    >
      {({ field, meta }) => (
        <MySelectInput 
          {...props} 
          field={field} 
          meta={meta} 
          ref={ref} 
        />
      )}
    </FastField>
  );
});

const shouldComponentUpdate = (nextProps, currentProps) => {
  return (
    nextProps.name !== currentProps.name ||
    nextProps.value !== currentProps.value ||
    nextProps.onChange !== currentProps.onChange ||
    nextProps.onValueChange !== currentProps.onValueChange ||
    nextProps.label !== currentProps.label ||
    nextProps.required !== currentProps.required ||
    nextProps.disabled !== currentProps.disabled ||
    nextProps.readOnly !== currentProps.readOnly ||
    nextProps.multiple !== currentProps.multiple ||
    nextProps.displayvalue !== currentProps.displayvalue ||
    nextProps.options !== currentProps.options ||
    nextProps.keyValue !== currentProps.keyValue ||
    nextProps.hideNullOption !== currentProps.hideNullOption ||
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

const MySelectInput = React.forwardRef(({
  name,
  keyValue = 'value',
  displayvalue = 'name',
  options = [],
  size = "small",
  variant = "outlined",
  label,
  hideNullOption = false,
  required = false,
  validate = false,
  oldStyle = false,
  readOnly = false,
  getOptionDisabled,
  getOptionLabel,
  handleChange: externalHandleChange,
  onValueChange,
  multiple = false,
  field,
  meta,
  ...otherProps
}, ref) => {
  console.log(`%c[Render] UiSelectInput: ${name}`, 'color: #8b5cf6; font-weight: bold');

  const handleChange = (evt) => {
    if (readOnly) return;
    
    // Internal Formik update handled by field.onChange or custom logic
    if (externalHandleChange) {
      externalHandleChange(evt);
    } else {
      field.onChange(evt);
    }

    if (typeof onValueChange === "function") {
      onValueChange(evt?.target?.value ?? null, evt);
    }
  };

  const isError = !!(meta && meta.touched && meta.error);
  const helperText = isError ? meta.error : (otherProps.helperText || "");

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

  const selectPropsMemo = useMemo(() => ({
    multiple,
    ...otherProps.SelectProps
  }), [multiple, otherProps.SelectProps]);

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

      <FormControl fullWidth>
        <TextField
          {...field}
          {...otherProps}
          select
          id={name}
          ref={ref}
          variant={variant}
          size={size}
          fullWidth
          onChange={handleChange}
          disabled={readOnly || otherProps.disabled}
          error={isError}
          helperText={helperText}
          InputLabelProps={{ shrink: true }}
          SelectProps={selectPropsMemo}
          sx={sxMemo}
          className={`${oldStyle ? '' : 'input-container'} ${readOnly ? 'read-only' : ''}`}
        >
          {!hideNullOption && !multiple && (
            <MenuItem value={null}>
              <em>---</em>
            </MenuItem>
          )}
          {options?.map((item, pos) => {
            const isDisabled = getOptionDisabled ? getOptionDisabled(item) : false;
            const displayLabel = getOptionLabel ? getOptionLabel(item) : item[displayvalue];

            return (
              <MenuItem
                key={pos}
                value={item[keyValue]}
                disabled={isDisabled}
              >
                {displayLabel}
              </MenuItem>
            );
          })}
        </TextField>
      </FormControl>
    </div>
  );
});

export default memo(UiSelectInput);
