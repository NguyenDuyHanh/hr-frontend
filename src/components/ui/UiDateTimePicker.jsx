import React, { memo, useEffect, useState, useRef, useMemo } from "react";
import { FastField, getIn } from "formik";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import viLocale from "date-fns/locale/vi";
import { isValid, getTime, format as formatDatefns } from "date-fns";

/**
 * UiDateTimePicker - Modernized MUI v5 Picker with Formik integration.
 * Standards: FastField + shouldComponentUpdate + useRef (timer) + useMemo (props).
 */

const UiDateTimePicker = React.forwardRef((props, ref) => {
  return (
    <FastField
      {...props}
      name={props.name}
      shouldUpdate={shouldComponentUpdate}
    >
      {({ field, meta, form }) => (
        <MyDateTimePicker
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
    nextProps.value !== currentProps.value ||
    nextProps.onChange !== currentProps.onChange ||
    nextProps.disablePast !== currentProps.disablePast ||
    nextProps.disableFuture !== currentProps.disableFuture ||
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

const MyDateTimePicker = React.forwardRef(({
  name,
  label,
  required = false,
  validate = false,
  readOnly = false,
  disabled = false,
  isTimePicker = false,
  isDateTimePicker = false,
  isDateTimeSecondsPicker = false,
  format,
  notValueMillisecond = false,
  debounceTime = 200,
  onChange: onChangeProp,
  className = "",
  field,
  meta,
  setFieldValue,
  notDelay = false,
  ...otherProps
}, ref) => {

  const [value, setValue] = useState(field.value || null);
  const timerRef = useRef(null);

  useEffect(() => {
    setValue(field.value ?? null);
  }, [field.value]);

  const displayFormat = format || (
    isTimePicker 
      ? "HH:mm" 
      : `dd/MM/yyyy${isDateTimeSecondsPicker ? " HH:mm:ss" : isDateTimePicker ? " HH:mm" : ""}`
  );

  const handleValueChange = (newValue) => {
    if (readOnly || disabled) return;

    setValue(newValue);
    let finalValue = newValue;
    
    if (!notValueMillisecond && newValue && isValid(newValue)) {
      finalValue = getTime(newValue);
    }

    if (notDelay) {
      if (onChangeProp) {
        onChangeProp(finalValue);
      } else {
        setFieldValue(name, finalValue);
      }
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (onChangeProp) {
          onChangeProp(finalValue);
        } else {
          setFieldValue(name, finalValue);
        }
      }, debounceTime);
    }
  };

  const isError = !!(meta && meta.touched && meta.error);
  
  // Rule 05: useMemo for slots and styling
  const slotPropsMemo = useMemo(() => ({
    textField: {
      id: name,
      fullWidth: true,
      size: otherProps.size || "small",
      variant: otherProps.variant || "outlined",
      error: isError,
      helperText: isError ? meta.error : (otherProps.helperText || ""),
      placeholder: otherProps.placeholder || (isTimePicker ? "HH:mm" : "DD/MM/YYYY"),
      InputLabelProps: { shrink: true },
      sx: {
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
        '& .MuiFormHelperText-root': {
          marginLeft: "0 !important",
          marginRight: "0 !important",
        },
        ...(readOnly && {
          '& .MuiInputAdornment-root': {
             display: 'none'
          }
        }),
        ...otherProps.sx
      }
    },
    popper: {
      sx: {
         '& .MuiPaper-root': {
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
         }
      }
    },
    actionBar: {
      actions: ["cancel", "accept"],
    },
  }), [name, isError, meta.error, readOnly, isTimePicker, otherProps.size, otherProps.variant, otherProps.placeholder, otherProps.helperText, otherProps.sx]);

  const PickerComponent = isDateTimePicker || isDateTimeSecondsPicker 
    ? DateTimePicker 
    : isTimePicker ? TimePicker : DatePicker;

  return (
    <div className={`w-full mb-4 ${className}`}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={viLocale}>
        {label && (
          <label 
            htmlFor={name} 
            className="block text-sm font-semibold mb-1.5 text-gray-700"
          >
            {label} {(validate || required) && <span style={{ color: 'red' }} className="font-bold ml-1">*</span>}
          </label>
        )}

        <PickerComponent
          {...otherProps}
          ref={ref}
          value={value}
          onChange={handleValueChange}
          disabled={disabled || readOnly}
          format={displayFormat}
          slotProps={slotPropsMemo}
        />
      </LocalizationProvider>
    </div>
  );
});

export default memo(UiDateTimePicker);
