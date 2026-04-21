import React, { memo, useEffect, useState, useRef, useMemo } from "react";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import { FastField, getIn } from "formik";

/**
 * UiTextField - Modernized MUI v5 TextField with Formik integration.
 * Standards: FastField + shouldComponentUpdate + useRef (timer) + useMemo (props).
 */

const UiTextField = React.forwardRef((props, ref) => {
  return (
    <FastField
      {...props}
      name={props.name}
      shouldUpdate={shouldComponentUpdate}
    >
      {({ field, meta, form }) => (
        <MyTextField 
          {...props} 
          field={field} 
          meta={meta} 
          form={form}
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
    nextProps.label !== currentProps.label ||
    nextProps.required !== currentProps.required ||
    nextProps.requiredLabel !== currentProps.requiredLabel ||
    nextProps.disabled !== currentProps.disabled ||
    nextProps.rows !== currentProps.rows ||
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

const MyTextField = React.forwardRef(({
  label,
  name,
  variant = "outlined",
  size = "small",
  type = "text",
  endAdornment: endAdornmentProp,
  validate,
  isTextArea,
  multiline,
  timeOut = 500,
  rows,
  required = false,
  oldStyle = false,
  readOnly = false,
  field,
  meta,
  form,
  notDelay = false,
  onChange: onChangeProp,
  value: valueProp,
  InputProps: InputPropsProp,
  InputLabelProps: InputLabelPropsProp,
  sx: sxProp,
  helperText: helperTextProp,
  className: classNameProp,
  ...otherProps
}, ref) => {
  // Debug log for standardizing verification
  console.log(`%c[Render] UiTextField: ${name}`, 'color: #3b82f6; font-weight: bold');

  const [internalValue, setInternalValue] = useState(field.value ?? "");
  const timerRef = useRef(null);

  // Sync internal state with Formik field value
  useEffect(() => {
    if (field.value !== undefined) {
      setInternalValue(field.value ?? "");
    }
  }, [field.value]);

  // Sync internal state with external value prop if provided
  useEffect(() => {
    if (valueProp !== undefined) {
      setInternalValue(valueProp ?? "");
    }
  }, [valueProp]);

  const handleChange = (e) => {
    if (readOnly) return;
    const val = e.target.value;
    setInternalValue(val);

    if (notDelay) {
      if (onChangeProp) {
        onChangeProp(e);
      } else {
        field.onChange(e);
      }
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (onChangeProp) {
          onChangeProp(e);
        } else {
          field.onChange(e);
        }
      }, timeOut);
    }
  };

  const isError = !!(meta && meta.touched && meta.error);
  const helperText = isError ? meta.error : (helperTextProp || "");

  // Rule 05: useMemo for object props
  const inputPropsMemo = useMemo(() => ({
    ...InputPropsProp,
    readOnly: readOnly,
    endAdornment: endAdornmentProp ? (
      <InputAdornment position="end">
        {endAdornmentProp}
      </InputAdornment>
    ) : InputPropsProp?.endAdornment,
  }), [InputPropsProp, readOnly, endAdornmentProp]);

  const inputLabelPropsMemo = useMemo(() => ({
    htmlFor: name,
    shrink: true,
    ...InputLabelPropsProp,
  }), [name, InputLabelPropsProp]);

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
        transition: 'border-color 0.2s shadow 0.2s',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#9ca3af',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1976d2',
      },
      ...(multiline || isTextArea ? {
        height: 'unset !important',
        padding: '10px !important'
      } : {}),
      '&:hover': {
        backgroundColor: readOnly ? '#f5f5f5 !important' : '#ffffff',
      },
      '&.Mui-focused': {
        backgroundColor: '#ffffff',
        boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
      }
    },
    ...sxProp,
  }), [readOnly, multiline, isTextArea, sxProp]);

  const classNameMemo = useMemo(() => (
    `${oldStyle ? '' : 'input-container'} ${readOnly ? 'read-only' : ''} ${classNameProp || ''}`
  ), [oldStyle, readOnly, classNameProp]);

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
          {...otherProps}
          {...field}
          id={name}
          ref={ref}
          fullWidth
          value={internalValue}
          onChange={handleChange}
          variant={variant}
          size={size}
          type={type}
          rows={rows}
          multiline={multiline || isTextArea}
          error={isError}
          helperText={helperText}
          className={classNameMemo}
          InputProps={inputPropsMemo}
          InputLabelProps={inputLabelPropsMemo}
          sx={sxMemo}
        />
      </FormControl>
    </div>
  );
});

export default memo(UiTextField);
