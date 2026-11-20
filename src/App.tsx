import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { LeftRail } from "./components/LeftRail";
import { Seo } from "./components/Seo";

export default function App() {
  return (
    <div className="app-frame">
      <Seo />
      <Header />
      <div className="app-body">
        <LeftRail />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
