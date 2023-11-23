import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="flex flex-col flex-1 h-screen">
      <Header />
      <main className="flex flex-1 flex-col w-full items-center">
        <Outlet />
      </main>
      <br />
      <Footer />
    </div>
  );
}
