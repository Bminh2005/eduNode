import { createBrowserRouter } from "react-router";
import Root from "./Root";
import Home from "./pages/Home";
import Result from "./pages/Result";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "result", Component: Result },
      { path: "*", Component: NotFound },
    ],
  },
]);
