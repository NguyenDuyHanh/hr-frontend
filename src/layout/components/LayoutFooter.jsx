import React from 'react'

const LayoutFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="h-[40px] flex items-center justify-center px-4 bg-primary text-white text-[14px] font-normal">
      <div>
        &copy; {currentYear} HRM Hub - Hệ thống quản lý nhân sự hiện đại
      </div>
    </footer>
  )
}

export default LayoutFooter
