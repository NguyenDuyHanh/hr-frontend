import HttpService from './HttpService';
import ConstantList from '../appConfig';

const API_PATH = ConstantList.API_ENPOINT + '/payrolls';
const BANK_TRANSFER_API_PATH = ConstantList.API_ENPOINT + '/bank-transfer';

export const createPayroll = (periodId, name, code, description) => {
    return HttpService.post(`${API_PATH}?periodId=${periodId}&name=${encodeURIComponent(name)}&code=${encodeURIComponent(code || '')}&description=${encodeURIComponent(description || '')}`);
};

export const getAllPayrolls = () => {
    return HttpService.get(API_PATH);
};

export const getPayrollsByPeriod = (periodId) => {
    return HttpService.get(`${API_PATH}/by-period/${periodId}`);
};

export const calculatePayroll = (payrollId) => {
    return HttpService.post(`${API_PATH}/${payrollId}/calculate`);
};

export const getPayrollDetails = (payrollId) => {
    return HttpService.get(`${API_PATH}/${payrollId}`);
};

export const confirmPayroll = (payrollId) => {
    return HttpService.put(`${API_PATH}/${payrollId}/confirm`);
};

export const unconfirmPayroll = (payrollId) => {
    return HttpService.put(`${API_PATH}/${payrollId}/unconfirm`);
};

export const deletePayroll = (payrollId) => {
    return HttpService.delete(`${API_PATH}/${payrollId}`);
};

export const getMyPayslip = (periodId) => {
    return HttpService.get(`${API_PATH}/my-payslip?periodId=${periodId}`);
};

export const updatePayslip = (payslipId, paidStatus, note) => {
    return HttpService.put(`${API_PATH}/payslip/${payslipId}?paidStatus=${paidStatus}&note=${encodeURIComponent(note || '')}`);
};

export const generateBankTransferQr = (payload) => {
    return HttpService.post(`${BANK_TRANSFER_API_PATH}/qr/generate`, payload);
};

