import React, { useEffect } from 'react';
import { Grid, Button, Box } from '@mui/material';
import { useFormik, FormikProvider } from 'formik';
import { useTranslation } from 'react-i18next';

import Popup from '@/components/ui/Popup';
import TextField from '@/components/ui/TextField';
import SelectInput from '@/components/ui/SelectInput';
import useAdministrativeUnitStore from '@/store/administrativeUnitStore';
import { useAddAdministrativeUnit, useModifyAdministrativeUnit, useProvinces } from '../api';
import { LEVEL_OPTIONS } from '@/constants';

const AdministrativeUnitForm = () => {
  const { t } = useTranslation();
  const { openForm, setOpenForm, selectedUnit } = useAdministrativeUnitStore();
  const addUnitMutation = useAddAdministrativeUnit();
  const modifyUnitMutation = useModifyAdministrativeUnit();
  const { data: provinces = [] } = useProvinces();

  const saving = addUnitMutation.isPending || modifyUnitMutation.isPending;

  const formik = useFormik({
    initialValues: {
      code: selectedUnit?.code || '',
      name: selectedUnit?.name || '',
      codename: selectedUnit?.codename || '',
      divisionType: selectedUnit?.divisionType || '',
      level: selectedUnit?.level || 1,
      parentCode: selectedUnit?.parentCode || '',
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = {
        id: selectedUnit ? selectedUnit.id : null,
        code: values.code.trim(),
        name: values.name.trim(),
        codename: values.codename ? values.codename.trim() : '',
        divisionType: values.divisionType ? values.divisionType.trim() : '',
        level: Number(values.level),
        parentCode: values.parentCode ? values.parentCode.trim() : null,
      };

      try {
        if (selectedUnit) {
          await modifyUnitMutation.mutateAsync(payload);
        } else {
          await addUnitMutation.mutateAsync(payload);
        }
        setOpenForm(false);
      } catch (error) {
        console.error('Failed to save administrative unit:', error);
      }
    },
  });

  useEffect(() => {
    if (openForm) {
      formik.resetForm({
        values: {
          code: selectedUnit?.code || '',
          name: selectedUnit?.name || '',
          codename: selectedUnit?.codename || '',
          divisionType: selectedUnit?.divisionType || '',
          level: selectedUnit?.level || 1,
          parentCode: selectedUnit?.parentCode || '',
        },
      });
    }
  }, [openForm, selectedUnit]);

  const levelOptions = LEVEL_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey, opt.defaultLabel),
  }));

  const provinceOptions = provinces.map((p) => ({
    code: p.code,
    name: `${p.name} (${p.code})`,
  }));

  return (
    <Popup
      open={openForm}
      onClosePopup={() => setOpenForm(false)}
      title={selectedUnit ? t('administrativeUnit.edit', 'Cập nhật Đơn vị hành chính') : t('administrativeUnit.add', 'Thêm Đơn vị hành chính mới')}
      size="sm"
      action={
        <>
          <Button onClick={() => setOpenForm(false)} color="inherit" disabled={saving}>
            {t('common.cancel', 'Hủy bỏ')}
          </Button>
          <Button onClick={formik.handleSubmit} color="primary" variant="contained" disabled={saving}>
            {saving ? t('common.saving', 'Đang lưu...') : t('common.save', 'Lưu lại')}
          </Button>
        </>
      }
    >
      <FormikProvider value={formik}>
        <Box sx={{ pt: 1.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField label={t('administrativeUnit.code', 'Mã DVHC')} name="code" required placeholder="Ví dụ: 01, 79" />
            </Grid>
            <Grid item xs={12}>
              <TextField label={t('administrativeUnit.name', 'Tên Đơn vị hành chính')} name="name" required placeholder="Ví dụ: Thành phố Hà Nội" />
            </Grid>
            <Grid item xs={12}>
              <TextField label={t('administrativeUnit.divisionType', 'Phân loại')} name="divisionType" placeholder="Ví dụ: thành phố trung ương, phường" />
            </Grid>
            <Grid item xs={12}>
              <SelectInput
                label={t('administrativeUnit.level', 'Cấp độ')}
                name="level"
                required
                options={levelOptions}
                keyValue="value"
                displayvalue="label"
                hideNullOption
              />
            </Grid>
            {formik.values.level === 2 && (
              <Grid item xs={12}>
                <SelectInput
                  label={t('administrativeUnit.parentName', 'Thuộc Tỉnh/Thành phố (Đơn vị cha)')}
                  name="parentCode"
                  options={provinceOptions}
                  keyValue="code"
                  displayvalue="name"
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </FormikProvider>
    </Popup>
  );
};

export default AdministrativeUnitForm;
