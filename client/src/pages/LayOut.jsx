import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { SignIn, useUser } from '@clerk/clerk-react'

const Layout = () => {
  const navigate = useNavigate()
  const [sideBar, setSideBar] = useState(false)
  const { user } = useUser()

  return user ? (
    <div className='flex flex-col items-start justify-start h-screen'>
      {/* Navbar */}
      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>
        <img
          src={assets.logo}
          alt="logo"
          className="cursor-pointer w-32 sm:w-44"
          onClick={() => navigate('/')}
        />
        {sideBar ? (
          <X
            onClick={() => setSideBar(false)}
            className='w-6 h-6 text-gray-600 sm:hidden'
          />
        ) : (
          <Menu
            onClick={() => setSideBar(true)}
            className='w-6 h-6 text-gray-600 sm:hidden'
          />
        )}
      </nav>

      {/* Main Layout: Sidebar (left) + Dashboard (right) */}
      <div
        className='flex w-full flex-1'
        style={{ height: "calc(100vh - 56px)" }} // navbar height adjustment
      >
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200">
          <Sidebar sidebar={sideBar} setsideBar={setSideBar} />
        </div>

        {/* Dashboard Content */}
        <div className='flex-1 bg-[#F4F7FB] p-4 overflow-y-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className='flex items-center justify-center h-screen'>
      <SignIn />
    </div>
  )
}

export default Layout
