import { Link, Outlet, useNavigate } from "react-router-dom";

export function Web() {
  const navigate = useNavigate();
  const goAdmin = () => {
    navigate("/admin", { replace: false });
  };
  return (
    <div className="web">
      <button onClick={goAdmin}>跳转admin</button>
      {/* <Link to="home">
        <Outlet></Outlet>
      </Link> */}
    </div>
  );
}
