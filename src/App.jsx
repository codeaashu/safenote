import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import ViewPaste from "./components/ViewPaste";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import PageNotFound from "./components/PageNotFound";
import UserWorkspace from "./components/UserWorkspace";
import CreateWorkspace from "./components/CreateWorkspace";


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Navbar />
        <Hero/>
        <Home />
        <Footer/>
      </>
    ),
  },
  {
    path: "/paste/:id",
    element: (
      <>
        <Navbar />
        <ViewPaste />
        <Footer/>
      </>
    ),
  },
  {
    path: "/:username",
    element: (
      <>
        <Navbar />
        <UserWorkspace />
        <Footer/>
      </>
    ),
  },
  {
    path: "/:username/create",
    element: (
      <>
        <Navbar />
        <CreateWorkspace />
        <Footer/>
      </>
    ),
  },
  {
    path: "*",
    element: <>
    <PageNotFound/>
    </>
  },
]);

function App() {
  return (
    <>
    <RouterProvider router={router}/>
    </>
  );
}

export default App;
