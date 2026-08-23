import React, { useEffect } from 'react';
import { Grid, Button, Box } from '@mui/material';
import { useFormik, FormikProvider } from 'formik';
import { useTranslation } from 'react-i18next';

import Popup from '@/components/ui/Popup';
import TextField from '@/components/ui/TextField';
import useEthnicStore from '@/store/ethnicStore';
import { useAddEthnic, useModifyEthnic } from '../api';

const EthnicForm = () => {
  const { t } = useTranslation();
  const { openForm, setOpenForm, selectedEthnic } = useEthnicStore();
  const addEthnicMutation = useAddEthnic();
  const modifyEthnicMutation = useModifyEthnic();

  const saving = addEthnicMutation.isPending || modifyEthnicMutation.isPending;

  const formik = useFormik({
    initialValues: {
      code: selectedEthnic?.code || '',
      name: selectedEthnic?.name || '',
      description: selectedEthnic?.description || '',
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = {
        id: selectedEthnic ? selectedEthnic.id : null,
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description ? values.description.trim() : '',
      };

      try {
        if (selectedEthnic) {
          await modifyEthnicMutation.mutateAsync(payload);
        } else {
          await addEthnicMutation.mutateAsync(payload);
        }
        setOpenForm(false);
      } catch (error) {
        console.error('Failed to save ethnic:', error);
      }
    },
  });

  useEffect(() => {
    if (openForm) {
      formik.resetForm({
        values: {
          code: selectedEthnic?.code || '',
          name: selectedEthnic?.name || '',
          description: selectedEthnic?.description || '',
        },
      });
    }
  }, [openForm, selectedEthnic]);

  return (
    <Popup
      open={openForm}
      onClosePopup={() => setOpenForm(false)}
      title={selectedEthnic ? t('ethnic.edit', 'Cập nhật Dân tộc') : t('ethnic.add', 'Thêm mới Dân tộc')}
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
              <TextField label={t('ethnic.code', 'Mã Dân tộc')} name="code" required placeholder="Ví dụ: VN-KH, VN-TY" />
            </Grid>
            <Grid item xs={12}>
              <TextField label={t('ethnic.name', 'Tên Dân tộc')} name="name" required placeholder="Ví dụ: Kinh, Tày, Thái" />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('ethnic.description', 'Mô tả')}
                name="description"
                placeholder="Mô tả về dân tộc..."
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Box>
      </FormikProvider>
    </Popup>
  );
};

export default EthnicForm;
