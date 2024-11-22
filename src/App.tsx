import { RouterProvider } from "react-router-dom";
import { router } from "./router/index";
const App = () => {
  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
};

export default App;