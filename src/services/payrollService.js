import HttpService from './HttpService';



export const createPayroll = (periodId, name, code, description) => {
    return HttpService.post(`/payrolls?periodId=${periodId}&name=${encodeURIComponent(name)}&code=${encodeURIComponent(code || '')}&description=${encodeURIComponent(description || '')}`);
};

export const getAllPayrolls = () => {
    return HttpService.get('/payrolls');
};

export const getPayrollsByPeriod = (periodId) => {
    return HttpService.get(`/payrolls/by-period/${periodId}`);
};

export const calculatePayroll = (payrollId) => {
    return HttpService.post(`/payrolls/${payrollId}/calculate`);
};

export const getPayrollDetails = (payrollId) => {
    return HttpService.get(`/payrolls/${payrollId}`);
};

export const confirmPayroll = (payrollId) => {
    return HttpService.put(`/payrolls/${payrollId}/confirm`);
};

export const unconfirmPayroll = (payrollId) => {
    return HttpService.put(`/payrolls/${payrollId}/unconfirm`);
};

export const deletePayroll = (payrollId) => {
    return HttpService.delete(`/payrolls/${payrollId}`);
};

export const getMyPayslip = (periodId) => {
    return HttpService.get(`/payrolls/my-payslip?periodId=${periodId}`);
};

export const updatePayslip = (payslipId, paidStatus, note) => {
    return HttpService.put(`/payrolls/payslip/${payslipId}?paidStatus=${paidStatus}&note=${encodeURIComponent(note || '')}`);
};

export const generateBankTransferQr = (payload) => {
    return HttpService.post('/bank-transfer/qr/generate', payload);
};
