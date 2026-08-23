import React from 'react'
import LayoutHeader from './components/header/LayoutHeader'
import LayoutSidebar from './components/LayoutSidebar'
import LayoutFooter from './components/LayoutFooter'
import Breadcrumb from './components/Breadcrumb'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Cột bên trái kéo dài full height */}
      <LayoutSidebar />

      {/* Cột bên phải: Header + Main Content + Footer */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header - Cố định trên cùng của cột bên phải */}
        <header className="sticky top-0 z-40">
          <LayoutHeader />
        </header>

        {/* Content - Khu vực nội dung chính */}
        <main className="flex-1 px-3 sm:px-6 overflow-x-hidden flex flex-col bg-background">
          <Breadcrumb />
          <div className="flex-1 pb-8">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <LayoutFooter />
      </div>
    </div>
  );
};

export default MainLayout;
