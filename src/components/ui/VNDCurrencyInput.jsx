/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import TextField from "@mui/material/TextField";
import { FastField, getIn } from "formik";
import { NumericFormat } from 'react-number-format';
import RequiredLabel from "./RequiredLabel";
import clsx from "clsx";

/**
 * Custom Numeric Format component for MUI Integration.
 */
const NumericFormatCustom = React.forwardRef((props, ref) => {
  const { onChange, ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator
      valueIsNumericString
    />
  );
});

/**
 * High-performance VND Currency Input component.
 * Features: Silent Render (FastField), Property Stability, MUI v5 Standards.
 */
const VNDCurrencyInput = (props) => {
  const { name, ...other } = props;

  const shouldUpdate = useCallback((nextProps, currentProps) => {
    return (
      nextProps.name !== currentProps.name ||
      nextProps.label !== currentProps.label ||
      nextProps.disabled !== currentProps.disabled ||
      nextProps.readOnly !== currentProps.readOnly ||
      nextProps.suffix !== currentProps.suffix ||
      nextProps.required !== currentProps.required ||
      nextProps.formik.isSubmitting !== currentProps.formik.isSubmitting ||
      getIn(nextProps.formik.values, currentProps.name) !== getIn(currentProps.formik.values, currentProps.name) ||
      getIn(nextProps.formik.errors, currentProps.name) !== getIn(currentProps.formik.errors, currentProps.name) ||
      getIn(nextProps.formik.touched, currentProps.name) !== getIn(currentProps.formik.touched, currentProps.name)
    );
  }, []);

  return (
    <FastField name={name} shouldUpdate={shouldUpdate}>
      {({ field, meta, form }) => (
        <MyVNDCurrencyInput 
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

const MyVNDCurrencyInput = ({
  name,
  label,
  type = "text",
  debounceTime = 400,
  notDelay = false,
  field,
  meta,
  disabled,
  placeholder,
  minRowArea,
  required,
  className = '',
  onChange,
  setFieldValue,
  oldStyle,
  readOnly,
  variant = "outlined",
  suffix = "",
  textAlignRight,
  size = "small",
  noMargin = false,
  ...otherProps
}) => {
  // DEBUG: console.log(`Render [VNDCurrencyInput]: ${name}`);

  const [internalValue, setInternalValue] = useState(field.value ?? "");
  const timerRef = React.useRef(null);

  useEffect(() => {
    if (field.value !== internalValue) {
      setInternalValue(field.value ?? "");
    }
  }, [field.value]);

  const handleChange = useCallback((e) => {
    if (readOnly) return;
    
    const val = e.target.value;
    setInternalValue(val);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (notDelay) {
      if (onChange) {
        onChange(e);
      } else {
        setFieldValue(name, val || null);
      }
    } else {
      timerRef.current = setTimeout(() => {
        if (onChange) {
          onChange(e);
        } else {
          setFieldValue(name, val || null);
        }
      }, debounceTime);
    }
  }, [readOnly, notDelay, onChange, name, setFieldValue, debounceTime]);

  const isError = Boolean(meta && meta.touched && meta.error);

  const memoInputProps = useMemo(() => ({
    readOnly: readOnly,
    inputComponent: NumericFormatCustom,
    endAdornment: suffix && (
      <span style={{ marginRight: '8px', color: '#757575', whiteSpace: 'nowrap' }}>{suffix}</span>
    ),
  }), [readOnly, suffix]);

  const memoSx = useMemo(() => ({
    "& .MuiOutlinedInput-input": {
      textAlign: textAlignRight ? "right" : "left",
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: (disabled || readOnly) ? "rgba(0, 0, 0, 0.05)" : "inherit",
    },
    ...otherProps.sx
  }), [textAlignRight, disabled, readOnly, otherProps.sx]);

  return (
    <div className={clsx("w-full", !noMargin && "mb-4")} style={{ width: "100%" }}>
      {label && (
        <label 
          htmlFor={name} 
          className={clsx("block text-sm font-semibold mb-1.5 text-muted-foreground", oldStyle && "text-xs", readOnly && "read-only")}
        >
          <RequiredLabel label={label} requiredLabel={required} />
        </label>
      )}

      <TextField
        {...otherProps}
        variant={variant}
        id={name}
        name={name}
        value={internalValue}
        fullWidth
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled || readOnly}
        type={type}
        size={size}
        error={isError}
        helperText={isError ? meta.error : ""}
        InputProps={memoInputProps}
        InputLabelProps={{
          shrink: true,
        }}
        multiline={minRowArea > 1}
        minRows={minRowArea}
        sx={memoSx}
        className={clsx(className, "input-container", readOnly && "read-only")}
      />
    </div>
  );
};

export default memo(VNDCurrencyInput);
