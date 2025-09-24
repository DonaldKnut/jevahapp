import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Features from "./sections/Features";
import Footer from "./sections/Footer";
import Hero from "./sections/Hero";
import Nav from "./sections/Nav";
import Partners from "./sections/Partners";
import Reviews from "./sections/Reviews";
import WhatWeDo from "./sections/WhatWeDo";
import Catering from "./pages/Catering";
import Fulcrums from "./pages/Fulcrums";
import Properties from "./pages/Properties";
import About from "./pages/About";
import Contact from "./pages/Contact";

function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <WhatWeDo />
      <Partners />
      <Reviews />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700">
        <Nav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catering" element={<Catering />} />
          <Route path="/fulcrums" element={<Fulcrums />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
