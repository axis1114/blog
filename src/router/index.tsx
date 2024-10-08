import { Admin } from "@/views/admin";
import { Web } from "@/views/web";
import { Home } from "@/views/web/home";
import Notfound from "@/views/web/not_found";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    //重定向到/home => element: <Navigate to="/home" replace />,
    element: <Web />,
    errorElement: <Notfound />,
    children: [
      {
        path: "home",
        element: <Home />,
      },
    ],
  },
  {
    path: "/admin",
    element: <Admin />,
    errorElement: <Notfound />,
  },
  {
    path: "*",
    element: <Notfound />,
  },
]);

export default router;
