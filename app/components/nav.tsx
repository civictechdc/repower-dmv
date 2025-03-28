import { NavLink } from '@remix-run/react';
import { useState } from 'react';

function Navbar() {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuToggled(!isMobileMenuToggled);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 py-4 px-6 text-white bg-[#253551] z-50">
      <div className="flex flex-wrap md:flex-nowrap justify-items-center items-center">
        <NavLink to="/">
            <img src="img/electrifydmvwhitehorizontal.png" alt="Electrify DMV logo" className="inline-block h-fit w-[250px] md:w-[300px] lg:w-[350px] md:mr-10 grow md:grow-0" />
        </NavLink>
        <div className="min-w-4 grow">
        </div>
        <div className="cursor-pointer md:hidden" onClick={ toggleMobileMenu }><i className={`fa fa-2x aria-hidden='true' ${isMobileMenuToggled ? 'fa-times' : 'fa-bars'}`}></i></div>
        <div className={`md:inline-block grow md:grow-0 basis-full md:basis-auto mt-4 md:mt-0 ${isMobileMenuToggled ? 'inline-block' : 'hidden'}`} onClick={ () => setIsMobileMenuToggled(false) }>
            <ul className="flex flex-col md:flex-row justify-end text-center text-nowrap text-lg [&>li]:inline-block gap-y-4 gap-x-8 [&>li:hover]:text-gray-300">
                <li className="inline-block">
                <NavLink
                    to="/about"
                    className={({ isActive, isPending }) =>
                    isPending ? "border-b-4" : isActive ? "border-b-4" : ""
                    }
                >
                    About
                </NavLink>
                </li>
                <li className="inline-block">
                <NavLink
                    to="/contractors"
                    className={({ isActive, isPending }) =>
                    isPending ? "border-b-4" : isActive ? "border-b-4" : ""
                    }
                >
                    Contractor List
                </NavLink>
                </li>
                <li className="inline-block">
                <NavLink
                    to="/incentives"
                    className={({ isActive, isPending }) =>
                    isPending ? "border-b-4" : isActive ? "border-b-4" : ""
                    }
                >
                    Incentives
                </NavLink>
                </li>
                <li className="inline-block">
                <NavLink
                    to="/resources"
                    className={({ isActive, isPending }) =>
                    isPending ? "border-b-4" : isActive ? "border-b-4" : ""
                    }
                >
                    Resources
                </NavLink>
                </li>
            </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;