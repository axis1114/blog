import { useRouteError } from "react-router-dom";

export default function Notfound() {
  const routerError: any = useRouteError();
  return (
    <div className="not_found">
      <h1>this page is not found!</h1>
      <p>{routerError}</p>
    </div>
  );
}
