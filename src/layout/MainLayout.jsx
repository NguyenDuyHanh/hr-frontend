import React from 'react'
import LayoutHeader from './components/header/LayoutHeader'
import LayoutSidebar from './components/LayoutSidebar'
import LayoutFooter from './components/LayoutFooter'
import Breadcrumb from './components/Breadcrumb'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - Cố định ở trên đầu */}
      <header className="sticky top-0 z-50">
        <LayoutHeader />
      </header>

      {/* Body - Tự động giãn nở để chiếm phần không gian còn lại */}
      <div className="flex flex-1">
        <LayoutSidebar />

        {/* Content - Khu vực nội dung chính */}
        <main className="flex-1 px-2 sm:px-5 overflow-x-hidden flex flex-col bg-background">
          <Breadcrumb />
          {/* div này sẽ chứa nội dung và co giãn theo nội dung, 
              nhưng nhờ flex-1 ở cha nên footer vẫn bị đẩy xuống đáy */}
          <div className="flex-1 pb-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Footer - Luôn nằm ở cuối */}
      <LayoutFooter />
    </div>
  );
};

export default MainLayout;
