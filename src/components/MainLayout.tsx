import { Outlet, useLocation } from 'react-router'
import Navbar from './Navbar'
import Footer from './Footer'

export default function MainLayout() {
  const location = useLocation();
  const isAppLayout = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-white">
      <div className={isAppLayout ? "hidden lg:block" : "block"}>
        <Navbar />
      </div>
      <main className="flex-1 flex flex-col relative">
        <Outlet />
      </main>
      {!isAppLayout && <Footer />}
    </div>
  )
}
