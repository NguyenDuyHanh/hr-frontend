import React, { useEffect } from 'react';
import { Grid, Button, Box } from '@mui/material';
import { useFormik, FormikProvider } from 'formik';
import { useTranslation } from 'react-i18next';

import Popup from '@/components/ui/Popup';
import TextField from '@/components/ui/TextField';
import useBankStore from '@/store/bankStore';
import { useAddBank, useModifyBank } from '../api';

const BankForm = () => {
  const { t } = useTranslation();
  const { openForm, setOpenForm, selectedBank } = useBankStore();
  const addBankMutation = useAddBank();
  const modifyBankMutation = useModifyBank();

  const saving = addBankMutation.isPending || modifyBankMutation.isPending;

  const formik = useFormik({
    initialValues: {
      code: selectedBank?.code || '',
      shortName: selectedBank?.shortName || '',
      name: selectedBank?.name || '',
      bin: selectedBank?.bin || '',
      swiftCode: selectedBank?.swiftCode || '',
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = {
        id: selectedBank ? selectedBank.id : null,
        code: values.code.trim(),
        name: values.name.trim(),
        shortName: values.shortName ? values.shortName.trim() : '',
        bin: values.bin ? values.bin.trim() : '',
        swiftCode: values.swiftCode ? values.swiftCode.trim() : '',
      };

      try {
        if (selectedBank) {
          await modifyBankMutation.mutateAsync(payload);
        } else {
          await addBankMutation.mutateAsync(payload);
        }
        setOpenForm(false);
      } catch (error) {
        console.error('Failed to save bank:', error);
      }
    },
  });

  useEffect(() => {
    if (openForm) {
      formik.resetForm({
        values: {
          code: selectedBank?.code || '',
          shortName: selectedBank?.shortName || '',
          name: selectedBank?.name || '',
          bin: selectedBank?.bin || '',
          swiftCode: selectedBank?.swiftCode || '',
        },
      });
    }
  }, [openForm, selectedBank]);

  return (
    <Popup
      open={openForm}
      onClosePopup={() => setOpenForm(false)}
      title={selectedBank ? t('bank.edit', 'Cập nhật Ngân hàng') : t('bank.add', 'Thêm Ngân hàng mới')}
      size="md"
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
            <Grid item xs={12} sm={6}>
              <TextField label={t('bank.code', 'Mã Ngân hàng')} name="code" required placeholder="Ví dụ: VCB, TCB, MB" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label={t('bank.shortName', 'Tên viết tắt')} name="shortName" placeholder="Ví dụ: Vietcombank" />
            </Grid>
            <Grid item xs={12}>
              <TextField label={t('bank.name', 'Tên đầy đủ Ngân hàng')} name="name" required placeholder="Ngân hàng TMCP Ngoại thương..." />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label={t('bank.bin', 'Mã BIN VietQR')} name="bin" placeholder="Ví dụ: 970436" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label={t('bank.swiftCode', 'SWIFT Code')} name="swiftCode" placeholder="Ví dụ: BFTVVNVX" />
            </Grid>
          </Grid>
        </Box>
      </FormikProvider>
    </Popup>
  );
};

export default BankForm;
