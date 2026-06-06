import React, { useState, useCallback, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import TextField from "../components/ui/TextField";
import Autocomplete from "../components/ui/Autocomplete";
import AsyncAutocomplete from "../components/ui/AsyncAutocomplete";
import Avatar from "../components/ui/Avatar";
import CheckBox from "../components/ui/CheckBox";
import ConfirmationDialog from "../components/ui/ConfirmationDialog";
import DateTimePicker from "../components/ui/DateTimePicker";
import SelectInput from "../components/ui/SelectInput";
import SelectInputV2 from "../components/ui/SelectInputV2";
import NumberInput from "../components/ui/NumberInput";
import VNDCurrencyInput from "../components/ui/VNDCurrencyInput";
import PagingAutocomplete from "../components/ui/PagingAutocomplete";
import PagingAutocompleteV2 from "../components/ui/PagingAutocompleteV2";
import Editor from "../components/ui/Editor";
import Table from "../components/ui/Table";
import Popup from "../components/ui/Popup";
import SearchInput from "../components/ui/SearchInput";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import { Box, Typography, Divider } from "@mui/material";

// Static definitions outside to keep references stable (Rule 09)
const INITIAL_VALUES = {
  firstName: "",
  lastName: "",
  description: "",
  content: "<h3>Tiêu đề mẫu</h3><p>Đây là nội dung ban đầu của editor.</p>",
  salary: 15000000,
  yearsOfExperience: 5,
  readOnlyField: "Dữ liệu không thể sửa",
  department: { id: 1, name: "Phòng Hành chính" },
  manager: null,
  province: null,
  district: null,
  isActive: true,
  isStaff: false,
  birthDate: new Date(1995, 0, 1).getTime(),
  joinedDateTime: null,
  shiftTime: null,
  gender: 1,
  contractType: "OFFICIAL"
};

const DEPARTMENT_OPTIONS = [
  { id: 1, name: "Phòng Hành chính" },
  { id: 2, name: "Phòng Kỹ thuật" },
  { id: 3, name: "Phòng Kinh doanh" },
  { id: 4, name: "Phòng Nhân sự" },
];

const GENDER_OPTIONS = [
  { value: 1, name: "Nam" },
  { value: 2, name: "Nữ" },
  { value: 3, name: "Khác" },
];

const CONTRACT_OPTIONS = [
  { value: "OFFICIAL", name: "Chính thức" },
  { value: "PROBATION", name: "Thử việc" },
  { value: "COLLABORATOR", name: "Cộng tác viên" },
];

const VALIDATION_SCHEMA = Yup.object().shape({
  firstName: Yup.string().required("Vui lòng nhập Tên"),
  lastName: Yup.string().required("Vui lòng nhập Họ"),
  salary: Yup.number().min(1000, "Lương quá thấp").required("Cần nhập lương"),
  department: Yup.object().required("Vui lòng chọn Phòng ban").nullable(),
  gender: Yup.number().required("Vui lòng chọn giới tính").nullable(),
});

const mockApi = async (search) => {
  console.log("Mock API call:", search);
  await new Promise(resolve => setTimeout(resolve, 500));
  const data = Array.from({ length: 10 }, (_, i) => ({
    id: (search.pageIndex - 1) * 10 + i + 1,
    name: `Item ${search.keyword || ''} ${(search.pageIndex - 1) * 10 + i + 1}`,
    code: `CODE-${(search.pageIndex - 1) * 10 + i + 1}`
  }));
  return {
    data: {
      content: data,
      totalPages: 5,
      totalElements: 50
    }
  };
};

const TestComponents = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [parentCount, setParentCount] = useState(0);
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(5);

  const handleTriggerParent = useCallback(() => {
    setParentCount(prev => prev + 1);
  }, []);

  const tableColumns = useMemo(() => [
    { title: "Mã", field: "code" },
    { title: "Tên nhân viên", field: "name" },
    { title: "Trạng thái", field: "status", render: row => <span className="text-green-600 font-bold">Hoạt động</span> }
  ], []);

  const tableData = useMemo(() => Array.from({ length: tablePageSize }, (_, i) => ({
    id: i,
    code: `NV-${(tablePage - 1) * tablePageSize + i + 1}`,
    name: `Nhân viên ${(tablePage - 1) * tablePageSize + i + 1}`,
  })), [tablePage, tablePageSize]);

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen space-y-8">
      {/* PERFORMANCE LAB HEADER */}
      <div className="p-6 bg-white border-2 border-dashed border-blue-200 rounded-2xl shadow-sm">
        <h2 className="text-blue-600 font-bold text-lg mb-2 flex items-center gap-2">
          <span className="flex h-3 w-3 rounded-full bg-blue-500 animate-ping"></span>
          Performance Lab: All Components Verification 1111
        </h2>
        <div className="flex gap-4 items-center">
          <input 
            type="text" 
            placeholder="Gõ bất kỳ để trigger re-render toàn trang..." 
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            onChange={handleTriggerParent}
          />
          <div className="bg-blue-600 text-white px-4 py-3 rounded-lg font-mono font-bold">
            Parent Renders: {parentCount}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* MAIN FORM */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <Typography variant="h5" fontWeight={900}>Form Modernization</Typography>
            <SearchInput search={(val) => console.log("Search trigger:", val)} />
          </div>

          <Formik
            initialValues={INITIAL_VALUES}
            validationSchema={VALIDATION_SCHEMA}
            onSubmit={(values) => {
              console.log("Submit values:", values);
              alert("Data submitted! Check console.");
            }}
          >
            {({ values, isSubmitting }) => (
              <Form className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <TextField name="firstName" label="Tên" required validate />
                  <TextField name="lastName" label="Họ" required validate />
                  
                  <NumberInput name="yearsOfExperience" label="Số năm kinh nghiệm" maxValue={50} />
                  <VNDCurrencyInput name="salary" label="Mức lương mong muốn" suffix="VNĐ" textAlignRight />
                  
                  <SelectInputV2 
                    name="contractType" 
                    label="Loại hợp đồng (V2)" 
                    options={CONTRACT_OPTIONS} 
                    keyValue="value"
                    required
                  />
                  
                  <DateTimePicker name="birthDate" label="Ngày sinh" required validate />
                  
                  <PagingAutocomplete 
                    name="province" 
                    label="Tỉnh/Thành phố (Paging)" 
                    api={mockApi} 
                    placeholder="Gõ để tìm kiếm..."
                  />

                  <PagingAutocompleteV2 
                    name="district" 
                    label="Quận/Huyện (Paging V2)" 
                    api={mockApi} 
                    placeholder="Infinite scroll test..."
                  />
                </div>

                <Divider sx={{ my: 4 }} />
                
                <Editor name="content" label="Nội dung mô tả (Quill Editor)" />

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                   <Button variant="outlined" onClick={() => setShowPopup(true)}>Mở Popup Test</Button>
                   <Button variant="contained" type="submit" disabled={isSubmitting}>Lưu hồ sơ</Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* DATA GRID SECTION */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <Typography variant="h6" fontWeight={800} gutterBottom>Data Grid (Table)</Typography>
          <Table 
            data={tableData}
            columns={tableColumns}
            totalElements={50}
            page={tablePage}
            pageSize={tablePageSize}
            handleChangePage={(e, p) => setTablePage(p)}
            setRowsPerPage={(e) => setTablePageSize(e.target.value)}
            showIndex
          />
        </div>

        {/* DEBUGGER SECTION */}
        <div className="bg-gray-900 text-green-400 p-6 rounded-2xl font-mono text-xs overflow-auto shadow-2xl">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
            <span className="text-white font-bold">LIVE STATE DEBUGGER</span>
            <span className="bg-green-900 text-green-300 px-2 py-0.5 rounded text-[10px]">ACTIVE</span>
          </div>
          <pre>{JSON.stringify(INITIAL_VALUES, null, 2)}</pre>
        </div>
      </div>

      {/* OVERLAY COMPONENTS */}
      <ConfirmationDialog
        open={showConfirm}
        onConfirmDialogClose={() => setShowConfirm(false)}
        title="Xác nhận"
        text="Bạn muốn xóa mục này?"
        onYesClick={() => setShowConfirm(false)}
      />

      <Popup 
        open={showPopup} 
        onClosePopup={() => setShowPopup(false)} 
        title="Hệ thống Quản lý HRM v2"
        size="md"
        action={<Button onClick={() => setShowPopup(false)}>Đóng</Button>}
      >
        <Typography variant="body1">
          Đây là nội dung của <strong>Popup</strong> mới được di chuyển sang MUI v5.
          Hỗ trợ Draggable trên thanh tiêu đề này.
        </Typography>
      </Popup>
    </div>
  );
};

export default TestComponents;
