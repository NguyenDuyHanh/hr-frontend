import React, { memo } from 'react';

/**
 * High-performance Required Label component.
 * Standardized for MUI v5 / HRM HRM-standard.
 */
function UiRequiredLabel({ label, requiredLabel }) {
  if (!label) {
    return null;
  }

  return (
    <>
      {label}
      {requiredLabel && <span style={{ color: "red" }}> *</span>}
    </>
  );
}

export default memo(UiRequiredLabel);
