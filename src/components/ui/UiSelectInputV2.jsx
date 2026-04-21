import React, { memo, useEffect, useState, useCallback, useMemo } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { FastField, getIn, useFormikContext } from "formik";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import UiRequiredLabel from "./UiRequiredLabel";

/**
 * High-performance Select Input V2 component.
 * Features: Silent Render (FastField), Property Stability, MUI v5 Standards.
 */
const UiSelectInputV2 = (props) => {
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
      nextProps.formik.isSubmitting !== currentProps.formik.isSubmitting ||
      getIn(nextProps.formik.values, currentProps.name) !== getIn(currentProps.formik.values, currentProps.name) ||
      getIn(nextProps.formik.errors, currentProps.name) !== getIn(currentProps.formik.errors, currentProps.name) ||
      getIn(nextProps.formik.touched, currentProps.name) !== getIn(currentProps.formik.touched, currentProps.name)
    );
  }, []);

  return (
    <FastField name={name} shouldUpdate={shouldUpdate}>
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
  ...otherProps
}) => {
  // DEBUG: console.log(`Render [UiSelectInputV2]: ${name}`);

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

  const isError = Boolean(meta && meta.touched && meta.error);

  const memoSx = useMemo(() => ({
    "& .MuiOutlinedInput-root": {
      backgroundColor: (readOnly || otherProps.disabled) ? "rgba(0, 0, 0, 0.05)" : "inherit",
    },
    ...otherProps.sx
  }), [readOnly, otherProps.disabled, otherProps.sx]);

  const memoInputProps = useMemo(() => ({
    ...otherProps.InputProps,
    readOnly: readOnly,
  }), [readOnly, otherProps.InputProps]);

  return (
    <div style={{ width: "100%" }}>
      {label && (
        <label 
          className={clsx(oldStyle ? "old-label" : "label-container", readOnly && "read-only")} 
          htmlFor={name}
        >
          <UiRequiredLabel label={label} requiredLabel={required} />
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

export default memo(UiSelectInputV2);
