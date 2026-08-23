import React from 'react'

const LayoutFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="h-[40px] flex items-center justify-center px-4 bg-background text-muted-foreground text-[14px] font-normal border-t border-border shadow-sm">
      <div>
        &copy; {currentYear} HRM - Hệ thống quản lý nhân sự hiện đại
      </div>
    </footer>
  )
}

export default LayoutFooter
