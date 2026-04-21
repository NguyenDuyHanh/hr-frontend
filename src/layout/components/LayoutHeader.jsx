import React from 'react'
import { NavLink } from 'react-router-dom'
import IconButton from '@mui/material/IconButton'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import AppsIcon from '@mui/icons-material/Apps'
import MailOutlineIcon from '@mui/icons-material/MailOutline'

const LayoutHeader = () => {
  return (
    <div className='bg-primary-dark h-[48px] flex items-center justify-between px-4 text-white shadow-md'>
      {/* Left side: Logo and Toggle */}
      <div className='flex items-center ml-10 space-x-6'>
        <NavLink to="/dashboard" className='bg-gradient-to-r from-[#8d6134] to-[#0073be] text-white px-4 py-1 rounded-sm font-normal text-[20px] no-underline'>
          H R M
        </NavLink>

        <IconButton color="inherit" size="small">
          <MenuOutlinedIcon fontSize="medium" />
        </IconButton>

        <span className='font-normal text-[18px] ml-2 hidden md:block'>
          HANHND_TLU_K64
        </span>
      </div>

      {/* Right side: Actions */}
      <div className='flex items-center space-x-4'>
        <div className='flex items-center bg-primary px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-primary-light transition-colors'>
          <MailOutlineIcon sx={{ fontSize: '18px' }} />
        </div>

        <div className='flex items-center bg-primary px-2.5 py-1.5 rounded-md cursor-pointer relative hover:bg-primary-light transition-colors'>
          <NotificationsNoneIcon sx={{ fontSize: '18px' }} />
          <span className='absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white'></span>
        </div>

        <div className='flex items-center bg-primary px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-primary-light transition-colors'>
          <AppsIcon sx={{ fontSize: '18px' }} />
        </div>

        <div className='w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-[12px] border border-white/30 cursor-pointer font-bold ml-2'>
          NS
        </div>
      </div>
    </div>
  )
}

export default LayoutHeader
