import React, { memo, useEffect, useState, useCallback, useMemo } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import { FastField, getIn, useFormikContext } from "formik";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import RequiredLabel from "./RequiredLabel";

/**
 * High-performance Select Input V2 component.
 * Features: Silent Render (FastField), Property Stability, MUI v5 Standards.
 */
const SelectInputV2 = (props) => {
  const { name, ...other } = props;

  const shouldUpdate = useCallback((nextProps, currentProps) => {
    return (
      nextProps.name !== currentProps.name ||
      nextProps.label !== currentProps.label ||
      nextProps.required !== currentProps.required ||
      nextProps.disabled !== currentProps.disabled ||
      nextProps.readOnly !== currentProps.readOnly ||
      nextProps.options !== currentProps.options ||
      nextProps.keyValue !== currentProps.keyValue ||
      nextProps.displayvalue !== currentProps.displayvalue ||
      nextProps.isClearable !== currentProps.isClearable ||
      nextProps.formik.isSubmitting !== currentProps.formik.isSubmitting ||
      getIn(nextProps.formik.values, currentProps.name) !== getIn(currentProps.formik.values, currentProps.name) ||
      getIn(nextProps.formik.errors, currentProps.name) !== getIn(currentProps.formik.errors, currentProps.name) ||
      getIn(nextProps.formik.touched, currentProps.name) !== getIn(currentProps.formik.touched, currentProps.name)
    );
  }, []);

  return (
    <FastField name={name} shouldUpdate={shouldUpdate} {...props}>
      {({ field, meta }) => (
        <MySelectInput 
          {...other} 
          name={name}
          field={field} 
          meta={meta} 
        />
      )}
    </FastField>
  );
};

const MySelectInput = ({
  name,
  keyValue = "value",
  displayvalue = "name",
  options = [],
  size = "small",
  variant = "outlined",
  label,
  hideNullOption = false,
  required = false,
  oldStyle = false,
  readOnly = false,
  getOptionDisabled,
  handleChange: externalHandleChange,
  field,
  meta,
  isClearable = !required,
  ...otherProps
}) => {
  // DEBUG: console.log(`Render [SelectInputV2]: ${name}`);

  const { setFieldValue } = useFormikContext();
  const [internalValue, setInternalValue] = useState(field?.value ?? "");

  useEffect(() => {
    setInternalValue(field?.value ?? "");
  }, [field?.value]);

  const handleChange = useCallback((event) => {
    if (readOnly) return;

    const newValue = event.target.value;
    setInternalValue(newValue);

    if (name && setFieldValue) {
      setFieldValue(name, newValue);
    }

    if (externalHandleChange) {
      externalHandleChange(event, newValue);
    }
  }, [readOnly, name, setFieldValue, externalHandleChange]);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setInternalValue("");
    if (name && setFieldValue) {
      setFieldValue(name, "");
    }
    if (externalHandleChange) {
      externalHandleChange({ target: { name, value: "" } }, "");
    }
  }, [name, setFieldValue, externalHandleChange]);

  const isError = Boolean(meta && meta.touched && meta.error);

  const hasValue = useMemo(() => {
    return internalValue !== "" && internalValue !== null && internalValue !== undefined;
  }, [internalValue]);

  const showClear = useMemo(() => {
    return isClearable && hasValue && !readOnly && !otherProps.disabled;
  }, [isClearable, hasValue, readOnly, otherProps.disabled]);

  const memoSx = useMemo(() => ({
    "& .MuiOutlinedInput-root": {
      backgroundColor: (readOnly || otherProps.disabled) ? "rgba(0, 0, 0, 0.05)" : "inherit",
    },
    "& .MuiSelect-select": {
      paddingRight: showClear ? "40px !important" : "inherit"
    },
    ...otherProps.sx
  }), [readOnly, otherProps.disabled, otherProps.sx, showClear]);

  const memoInputProps = useMemo(() => {
    const props = {
      ...otherProps.InputProps,
      readOnly: readOnly,
    };
    if (showClear) {
      props.endAdornment = (
        <InputAdornment
          position="end"
          sx={{
            position: "absolute",
            right: 28,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1,
            margin: 0
          }}
        >
          <IconButton
            size="small"
            onClick={handleClear}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            edge="end"
            sx={{
              padding: "2px",
              marginRight: "4px",
              color: "text.secondary",
              "&:hover": {
                color: "text.primary"
              }
            }}
          >
            <ClearIcon sx={{ fontSize: "16px" }} />
          </IconButton>
        </InputAdornment>
      );
    }
    return props;
  }, [readOnly, otherProps.InputProps, showClear, handleClear]);

  return (
    <div className="w-full mb-4">
      {label && (
        <label 
          htmlFor={name}
          className={`block text-sm font-semibold mb-1.5 text-muted-foreground ${oldStyle ? 'text-xs' : ''} ${readOnly ? 'read-only' : ''}`}
        >
          <RequiredLabel label={label} requiredLabel={required} />
        </label>
      )}

      <FormControl fullWidth>
        <TextField
          {...otherProps}
          select
          id={name}
          name={name}
          value={internalValue}
          onChange={handleChange}
          variant={variant}
          size={size}
          fullWidth
          error={isError}
          helperText={isError ? meta.error : ""}
          InputLabelProps={{
            shrink: true,
          }}
          disabled={readOnly || otherProps.disabled}
          InputProps={memoInputProps}
          sx={memoSx}
          className={clsx("input-container", readOnly && "read-only")}
        >
          {!hideNullOption && (
            <MenuItem value={""}>
              <em>---</em>
            </MenuItem>
          )}
          {options?.map((item, pos) => {
            const isDisabled = getOptionDisabled ? getOptionDisabled(item) : false;
            const itemValue = item[keyValue];
            const itemLabel = item[displayvalue];

            return (
              <MenuItem key={pos} value={itemValue} disabled={isDisabled}>
                {itemLabel}
              </MenuItem>
            );
          })}
        </TextField>
      </FormControl>
    </div>
  );
};

export default memo(SelectInputV2);
