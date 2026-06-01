import React, { memo, useMemo } from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import { FastField, getIn } from "formik";

/**
 * UiCheckBox - Modernized MUI v5 CheckBox with Formik integration.
 * Standards: FastField + shouldComponentUpdate + useMemo.
 */

const UiCheckBox = React.forwardRef((props, ref) => {
  return (
    <FastField
      {...props}
      name={props.name}
      shouldUpdate={shouldComponentUpdate}
    >
      {({ field, meta, form }) => (
        <MyCheckBox
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
    nextProps.label !== currentProps.label ||
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

const MyCheckBox = React.forwardRef(({
  name,
  label,
  style,
  alignCenter = true,
  readOnly = false,
  handleChange: externalHandleChange,
  field,
  meta,
  ...otherProps
}, ref) => {

  const handleExternalChange = (evt) => {
    if (readOnly) return;
    if (externalHandleChange) {
      externalHandleChange(evt, evt.target.checked);
    }
  };

  const handleInternalChange = (evt) => {
    if (readOnly) return;
    field.onChange(evt);
  };

  const isError = !!(meta && meta.touched && meta.error);

  const sxMemo = useMemo(() => ({
    margin: 0,
    userSelect: 'none',
    ...(readOnly && {
      cursor: 'default',
      '& .MuiTypography-root': {
        color: 'text.disabled',
      }
    }),
    '& .MuiCheckbox-root': {
      padding: '8px',
      transition: 'all 0.2s ease-in-out',
      ...(readOnly && {
        color: 'text.disabled',
        pointerEvents: 'none',
        opacity: 0.8
      }),
      '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
      },
      '&.Mui-checked': {
        color: readOnly ? 'text.disabled' : isError ? 'error.main' : 'primary.main',
      }
    },
    '& .MuiTypography-root': {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: isError ? 'error.main' : 'text.primary',
    },
    ...otherProps.sx
  }), [readOnly, isError, otherProps.sx]);

  const groupSxMemo = useMemo(() => ({ 
    display: 'flex', 
    alignItems: alignCenter ? 'center' : 'flex-start',
    justifyContent: alignCenter ? 'center' : 'flex-start',
    height: '100%',
    ...otherProps.groupSx
  }), [alignCenter, otherProps.groupSx]);

  return (
    <FormGroup sx={groupSxMemo}>
      <FormControlLabel
        ref={ref}
        style={style}
        sx={sxMemo}
        control={
          <Checkbox
            {...field}
            {...otherProps}
            checked={Boolean(field.value)}
            onChange={externalHandleChange ? handleExternalChange : handleInternalChange}
            id={name}
          />
        }
        label={label}
      />
    </FormGroup>
  );
});

export default memo(UiCheckBox);
