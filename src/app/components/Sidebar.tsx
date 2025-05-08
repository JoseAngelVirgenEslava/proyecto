'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { IoBrowsersOutline, IoCalculator } from 'react-icons/io5'
import { IoIosGlobe, IoIosSearch } from "react-icons/io"
import { FaRegUserCircle } from "react-icons/fa"
import { FiShoppingCart } from "react-icons/fi"
import { FcAbout } from "react-icons/fc"
import { SidebarMenuItem } from './SidebarMenuItem'

export const Sidebar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut()  // Usar signOut de NextAuth
    router.push('/dashboard/login')
  }

  const menuItems = [
    {
      path: '/dashboard/main',
      icon: <IoBrowsersOutline size={40} />,
      title: 'Products',
      subTitle: 'Search through our solutions.'
    },
    {
      path: '/dashboard/see',
      icon: <IoIosSearch size={40} />,
      title: 'See product',
      subTitle: 'Find a specific product.'
    },
    {
      path: '/dashboard/cart',
      icon: <FiShoppingCart size={40} />,
      title: 'Shopping cart',
      subTitle: ''
    },
    {
      path: '/dashboard/us',
      icon: <FcAbout size={40} />,
      title: 'About Us',
      subTitle: 'Take a look at our history and our team.'
    }
  ]

  return (
    <div id="menu"
      style={{ width: '50%' }}
      className="bg-gray-900 min-h-screen z-10 text-slate-300 w-64 left-0 overflow-y-scroll">

      <div id="logo" className="my-4 px-6">
        <h1 className="flex items-center text-lg md:text-2xl font-bold text-white">
          <IoIosGlobe />
          <span> Defense Systems</span>
        </h1>
        <p className="text-slate-500 text-sm">Specialists in global security.</p>
      </div>

      <div id="profile" className="px-6 py-10">
        <p className="text-slate-500">Welcome,</p>
        {
          session ? (
            <p className="text-white font-semibold">{session.user?.email}</p>
          ) : (
            <p className="text-white font-semibold">Guest</p>
          )
        }
      </div>

      <div id="nav" className="w-full px-6">

        {
          !session ? (
            <SidebarMenuItem
              path="/dashboard/login"
              icon={<FaRegUserCircle size={40} />}
              title="Login"
              subTitle="Let's get to know each other."
            />
          ) : (
            <div onClick={handleLogout} className="cursor-pointer">
              <SidebarMenuItem
                path="#"
                icon={<FaRegUserCircle size={40} />}
                title="Logout"
                subTitle="See you soon!"
              />
            </div>
          )
        }

        {menuItems.map(item => (
          <SidebarMenuItem key={item.path} {...item} />
        ))}

      </div>
    </div>
  )
}