import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Paste from "./components/Paste";
import ViewPaste from "./components/ViewPaste";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import PageNotFound from "./components/PageNotFound";


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
    path: "/paste",
    element: (
      <>
        <Navbar />
        <Paste />
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
