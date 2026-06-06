import React, { useEffect, useState, useRef, useCallback, memo, useMemo } from "react";
import TextField from "@mui/material/TextField";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { FastField, getIn } from "formik";
import clsx from "clsx";
import { containsOnlyNumbers } from "../../LocalFunction";
import RequiredLabel from "./RequiredLabel";

/**
 * High-performance Number Input component.
 * Features: Silent Render (FastField), Debounced Input, Property Stability.
 */
const NumberInput = (props) => {
  const { name, ...other } = props;
  
  const shouldUpdate = useCallback((nextProps, currentProps) => {
    return (
      nextProps.name !== currentProps.name ||
      nextProps.label !== currentProps.label ||
      nextProps.required !== currentProps.required ||
      nextProps.disabled !== currentProps.disabled ||
      nextProps.readOnly !== currentProps.readOnly ||
      nextProps.maxValue !== currentProps.maxValue ||
      nextProps.decimal !== currentProps.decimal ||
      nextProps.formik.isSubmitting !== currentProps.formik.isSubmitting ||
      getIn(nextProps.formik.values, currentProps.name) !== getIn(currentProps.formik.values, currentProps.name) ||
      getIn(nextProps.formik.errors, currentProps.name) !== getIn(currentProps.formik.errors, currentProps.name) ||
      getIn(nextProps.formik.touched, currentProps.name) !== getIn(currentProps.formik.touched, currentProps.name)
    );
  }, []);

  return (
    <FastField name={name} shouldUpdate={shouldUpdate}>
      {({ field, meta, form }) => (
        <MyNumberInput 
          {...other} 
          name={name}
          field={field} 
          meta={meta} 
          formik={form} 
        />
      )}
    </FastField>
  );
};

const MyNumberInput = ({
  name,
  variant = "outlined",
  size = "small",
  type,
  regexInput = /^\d+$/,
  field,
  meta,
  notDelay = false,
  debounceTime = 100,
  decimal = false,
  inputProps,
  maxValue,
  reportComponent = false,
  fullWidth = true,
  label,
  requiredLabel = false,
  oldStyle = false,
  required = false,
  readOnly = false,
  formik,
  ...otherProps
}) => {
  // DEBUG: console.log(`Render [NumberInput]: ${name}`);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [internalValue, setInternalValue] = useState(field.value ?? "");
  const timerRef = useRef(null);

  // Sync internal value with Formik value
  useEffect(() => {
    setInternalValue(field.value ?? "");
  }, [field.value]);

  const handleValuesChange = useCallback((e) => {
    const eventValue = e.target.value;

    // Validation logic from original GlobitsNumberInput
    if (decimal) {
      let matches = eventValue?.match(/\./g);
      let cleanValue = eventValue?.replace(".", "");
      if (matches?.length > 1) return;
      if (cleanValue?.length > 0 && !containsOnlyNumbers(cleanValue)) return;
    } else {
      if (eventValue !== "" && !containsOnlyNumbers(eventValue)) return;
    }

    if (maxValue && Number(eventValue) > maxValue) return;

    setInternalValue(eventValue);

    // Debounce to Formik
    if (timerRef.current) clearTimeout(timerRef.current);

    if (notDelay) {
      if (otherProps.onChange) {
        otherProps.onChange(e);
      } else {
        field.onChange(e);
      }
    } else {
      timerRef.current = setTimeout(() => {
        if (otherProps.onChange) {
          otherProps.onChange(e);
        } else {
          field.onChange(e);
        }
      }, debounceTime);
    }
  }, [decimal, maxValue, notDelay, debounceTime, otherProps.onChange, field]);

  const handleKeyDown = useCallback((evt) => {
    if (readOnly) return;
    
    const theEvent = evt || window.event;
    const key = theEvent.key;

    // Navigation and editing keys
    const allowedKeys = [
      "ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft",
      "Backspace", "Tab", "Enter", "Delete", "Escape"
    ];
    
    if (allowedKeys.includes(key)) return;

    // Command keys (Ctrl/Cmd + A, C, V, X, Z)
    if ((theEvent.ctrlKey || theEvent.metaKey) && ["a", "c", "v", "x", "z"].includes(key.toLowerCase())) {
      return;
    }

    // Decimal point
    if (decimal && key === ".") return;

    // Regex check for numeric keys
    if (!regexInput.test(key)) {
      if (theEvent.preventDefault) theEvent.preventDefault();
      theEvent.returnValue = false;
    }
  }, [readOnly, decimal, regexInput]);

  const isError = Boolean(meta && meta.touched && meta.error);

  const memoInputProps = useMemo(() => ({
    ...inputProps,
    inputMode: "numeric",
    readOnly: readOnly,
    className: clsx(
      reportComponent && "text-align-right", 
      inputProps?.className, 
      readOnly && "read-only"
    ),
  }), [inputProps, readOnly, reportComponent]);

  const memoSx = useMemo(() => ({
    "& .MuiOutlinedInput-root": {
      backgroundColor: readOnly ? "rgba(0, 0, 0, 0.05)" : "inherit",
    },
    ...otherProps.sx
  }), [readOnly, otherProps.sx]);

  return (
    <div style={{ width: fullWidth ? "100%" : "auto" }}>
      {label && (
        <label
          htmlFor={name}
          className={clsx(oldStyle ? "old-label" : "label-container", readOnly && "read-only")}
        >
          <RequiredLabel label={label} requiredLabel={required || requiredLabel} />
        </label>
      )}
      <TextField
        {...otherProps}
        id={name}
        name={name}
        value={internalValue}
        onChange={readOnly ? undefined : handleValuesChange}
        onKeyDown={handleKeyDown}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        type={isMobile ? "number" : type || "text"}
        error={isError}
        helperText={isError ? meta.error : ""}
        inputProps={memoInputProps}
        sx={memoSx}
      />
    </div>
  );
};

export default memo(NumberInput);
