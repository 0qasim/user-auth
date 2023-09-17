import React, { useState } from "react";
import Navbar from "./Navbar";
import { routes } from "../../constant";
import Drawer from "./Drawer";

const Navigation = () => {
  const [isopen, SetIsOpen] = useState(false);

  const toggleDrawer = () => {
    SetIsOpen(!isopen);
  };
  console.log(routes);
  return (
    <div>
      <Drawer routes={routes} isopen={isopen} toggleDrawer={toggleDrawer} />
      <Navbar routes={routes} toggleDrawer={toggleDrawer} />
    </div>
  );
};
export default Navigation;
