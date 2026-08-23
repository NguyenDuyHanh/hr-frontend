import React, { useState, useMemo } from 'react';
import { Popover, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckIcon from '@mui/icons-material/Check';

import { navigations } from '@/navigationConfig';
import useAuthStore from '@/store/useAuthStore';
import useMenuFilterStore from '@/store/useMenuFilterStore';
import IconMapper from '@/components/IconMapper';

const AppSwitcherPopover = ({ anchorEl, open, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { selectedSections, toggleSection, resetFilter } = useMenuFilterStore();
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filter navigations by user role authorization
  const authorizedNavigations = useMemo(() => {
    const userRoles = Array.isArray(user?.role) ? user.role : user?.role ? [user.role] : [];
    return navigations.filter(
      (item) => !item.auth || item.auth.some((r) => userRoles.includes(r))
    );
  }, [user]);

  // 2. Filter navigations by search query
  const filteredNavigations = useMemo(() => {
    if (!searchQuery.trim()) return authorizedNavigations;
    const query = searchQuery.toLowerCase().trim();
    return authorizedNavigations.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.section.toLowerCase().includes(query)
    );
  }, [authorizedNavigations, searchQuery]);

  // 3. Group filtered navigations by section
  const groupedNavigations = useMemo(() => {
    return filteredNavigations.reduce((acc, item) => {
      const section = item.section;
      if (!acc[section]) acc[section] = [];
      acc[section].push(item);
      return acc;
    }, {});
  }, [filteredNavigations]);

  // All available unique section names
  const allSectionNames = useMemo(() => {
    return Array.from(new Set(authorizedNavigations.map((item) => item.section)));
  }, [authorizedNavigations]);

  const isFilteringActive = selectedSections.length > 0;

  const handleCardClick = (e, item) => {
    const isMultiSelect = e.ctrlKey || e.metaKey || e.shiftKey;
    
    // Toggle section in menu filter store
    toggleSection(item.section, isMultiSelect);

    // If regular click (not ctrl+click), navigate to path and close popover
    if (!isMultiSelect && item.path) {
      navigate(item.path);
      onClose();
    }
  };

  const handleSectionHeaderClick = (e, sectionName) => {
    const isMultiSelect = e.ctrlKey || e.metaKey || e.shiftKey;
    toggleSection(sectionName, isMultiSelect);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      container={() => document.getElementById('root') || document.body}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 480,
            maxWidth: '92vw',
            maxHeight: '75vh',
            borderRadius: '14px',
            border: '1px solid hsl(var(--border))',
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            mt: 1,
          },
        },
      }}
    >
      {/* Popover Header */}
      <div className="p-3 md:p-3.5 border-b border-border bg-muted/40 flex flex-col gap-2.5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground m-0 flex items-center gap-1.5">
              <span>{t('menu.select_module_title', 'Chọn phân hệ')}</span>
              {isFilteringActive && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                  {selectedSections.length}/{allSectionNames.length}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-muted-foreground m-0 mt-0.5 select-none">
              {t('menu.select_module_hint', 'Nhấn Ctrl + Click để chọn nhiều phân hệ cùng lúc')}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {isFilteringActive && (
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={resetFilter}
                startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />}
                sx={{ textTransform: 'none', height: 26, fontSize: 11, borderRadius: '6px', fontWeight: 600, px: 1 }}
              >
                {t('menu.show_all', 'Hiển thị tất cả')}
              </Button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border/60 bg-background"
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>

        {/* Search Bar inside Popover */}
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-3 text-muted-foreground pointer-events-none" sx={{ fontSize: 17 }} />
          <input
            type="text"
            placeholder={t('menu.search_module_placeholder', 'Tìm phân hệ / menu...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ outline: 'none' }}
            className="w-full pl-8 pr-8 py-2 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 outline-none focus:outline-none focus-visible:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-muted-foreground hover:text-foreground text-xs border-none bg-transparent cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Popover Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 md:p-3.5 space-y-4 no-scrollbar">
        {Object.keys(groupedNavigations).length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            {t('menu.no_result', 'Không tìm thấy menu hoặc phân hệ phù hợp')}
          </div>
        ) : (
          Object.entries(groupedNavigations).map(([sectionName, items]) => {
            const isSectionSelected =
              selectedSections.length === 0 || selectedSections.includes(sectionName);

            return (
              <div key={sectionName} className="space-y-2">
                {/* Section Header Label & Toggle Button */}
                <div
                  onClick={(e) => handleSectionHeaderClick(e, sectionName)}
                  className="flex items-center justify-between group cursor-pointer select-none border-b border-border/40 pb-1"
                >
                  <span className="text-[11px] font-bold tracking-wider text-primary uppercase flex items-center gap-1">
                    {sectionName}
                    {isSectionSelected && selectedSections.length > 0 && (
                      <CheckIcon sx={{ fontSize: 13 }} className="text-primary" />
                    )}
                  </span>
                  <span className={`text-[10px] transition-colors ${
                    isSectionSelected && selectedSections.length > 0
                      ? 'text-primary font-bold'
                      : 'text-muted-foreground/70 group-hover:text-primary font-medium'
                  }`}>
                    {isSectionSelected && selectedSections.length > 0
                      ? t('menu.section_active', 'Đã chọn')
                      : t('menu.click_to_select', 'Click chọn')}
                  </span>
                </div>

                {/* Grid of Item Cards in Section */}
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                  {items.map((item) => {
                    const isCardActive = isSectionSelected;

                    return (
                      <div
                        key={item.path + item.name}
                        onClick={(e) => handleCardClick(e, item)}
                        className={`group relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer select-none text-center ${
                          isCardActive
                            ? 'bg-primary/10 dark:bg-primary/20 border-primary/40 text-primary hover:bg-primary/20 hover:border-primary shadow-2xs'
                            : 'bg-background/40 border-border/60 text-muted-foreground opacity-50 hover:opacity-90 hover:border-border hover:bg-muted/40'
                        }`}
                        title={`${t('menu.' + item.name, item.name)} (${t('menu.click_hint', 'Click mở menu | Ctrl+Click chọn nhiều')})`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${
                            isCardActive
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <IconMapper iconName={item.icon} style={{ fontSize: 17 }} />
                        </div>
                        <span className={`text-[11px] leading-tight line-clamp-2 ${
                          isCardActive ? 'font-bold text-primary' : 'font-medium'
                        }`}>
                          {t('menu.' + item.name, item.name)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Popover>
  );
};

export default AppSwitcherPopover;
