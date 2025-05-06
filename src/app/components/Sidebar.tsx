import Image from 'next/image';
import { IoBrowsersOutline, IoCalculator} from 'react-icons/io5';
import { IoIosGlobe, IoIosSearch } from "react-icons/io";
import { FaRegUserCircle } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";
import { FcAbout } from "react-icons/fc";
import { SidebarMenuItem } from './SidebarMenuItem';


const menuItems = [
  { 
    path: '/dashboard/login',
    icon: <FaRegUserCircle size = {40}/>,
    title: 'Login',
    subTitle: "Let's get to know each other."
  },  
  {
    path: '/dashboard/main',
    icon: <IoBrowsersOutline size={40} />,
    title: 'Products',
    subTitle: 'Search through our solutions.'
  },
  {
    path: '/dashboard/counter',
    icon: <IoIosSearch size={40}/>,
    title: 'See product',
    subTitle: 'Find a specific product.'
  },
  {
    path: '/dashboard/pokemons',
    icon: <FiShoppingCart size={40} />,
    title: 'Shopping cart',
    subTitle: ''
  },
  {
    path: '/dashboard/toy',
    icon: <FcAbout size={40} />,
    title: 'About Us',
    subTitle: 'Take a look at our history and our team.'
  }
]


export const Sidebar = () => {
  return (

    <div id="menu" 
      style={{ width: '50%' }}
      className="bg-gray-900 min-h-screen z-10 text-slate-300 w-64 left-0  overflow-y-scroll">


      <div id="logo" className="my-4 px-6">
        <h1 className="flex items-center  text-lg md:text-2xl font-bold text-white">
        <IoIosGlobe />
          <span> Defense Systems</span>
        </h1>
        <p className="text-slate-500 text-sm">Specialists in global security.</p>
      </div>


      <div id="profile" className="px-6 py-10">
        <p className="text-slate-500">Welcome,</p>
        <a href="#" className="inline-flex space-x-2 items-center">
        </a>
      </div>


      <div id="nav" className="w-full px-6">
      
        {
          menuItems.map( item => (
              <SidebarMenuItem  key={ item.path } {...item} />
          ))
        }
      </div>
    </div>
  )
}