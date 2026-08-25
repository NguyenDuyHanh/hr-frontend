import React, { useCallback } from 'react';
import { Grid } from '@mui/material';
import AsyncAutocomplete from '../../../components/ui/AsyncAutocomplete';
import TextField from '../../../components/ui/TextField';
import { getAllProvinces, getChildrenByParentCode } from '../../../services/administrativeUnitService';

const AddressSelectGroup = ({
    provinceFieldName,
    unitFieldName,
    wardFieldName, // fallback
    detailFieldName,
    provinceLabel = 'Tỉnh / Thành phố',
    unitLabel = 'Đơn vị hành chính (Xã / Phường / Thị trấn)',
    detailLabel = 'Địa chỉ chi tiết (Số nhà, Tên đường...)',
    formik,
    isView = false
}) => {
    const actualUnitFieldName = unitFieldName || wardFieldName;

    // Selected values from Formik
    const selectedProvince = formik.values[provinceFieldName];
    const selectedUnit = formik.values[actualUnitFieldName];

    // API fetch function for administrative units (wards/communes) dependent on selected province
    const fetchUnitsApi = useCallback(async () => {
        if (!selectedProvince?.code) {
            return [];
        }
        try {
            const res = await getChildrenByParentCode(selectedProvince.code);
            return res?.data || res || [];
        } catch (err) {
            console.error("Failed to load units for province:", selectedProvince.code, err);
            return [];
        }
    }, [selectedProvince?.code]);

    const handleProvinceChange = (_, newValue) => {
        formik.setFieldValue(provinceFieldName, newValue || null);
        formik.setFieldValue(actualUnitFieldName, null); // reset unit when province changes
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <AsyncAutocomplete
                    name={provinceFieldName}
                    label={provinceLabel}
                    api={getAllProvinces}
                    displayData="name"
                    value={selectedProvince || null}
                    onChange={handleProvinceChange}
                    readOnly={isView}
                    disabled={isView}
                    formik={formik}
                    placeholder="Chọn Tỉnh / Thành phố"
                />
            </Grid>

            <Grid item xs={12} sm={6}>
                <AsyncAutocomplete
                    name={actualUnitFieldName}
                    label={unitLabel}
                    api={fetchUnitsApi}
                    displayData="name"
                    value={selectedUnit || null}
                    searchObject={selectedProvince?.code || ''}
                    readOnly={isView || !selectedProvince}
                    disabled={isView || !selectedProvince}
                    formik={formik}
                    placeholder={selectedProvince ? "Chọn Đơn vị hành chính" : "Chọn Tỉnh/Thành trước"}
                />
            </Grid>

            <Grid item xs={12}>
                <TextField
                    name={detailFieldName}
                    label={detailLabel}
                    readOnly={isView}
                    disabled={isView}
                    placeholder="Ví dụ: Số 123 Đường Nguyễn Trãi..."
                />
            </Grid>
        </Grid>
    );
};

export default AddressSelectGroup;
