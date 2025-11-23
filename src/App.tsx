import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./sections/Footer";
import Hero from "./sections/Hero";
import Nav from "./sections/Nav";
import AboutUs from "./sections/AboutUs";
import PowerfulFeatures from "./sections/PowerfulFeatures";
import Testimonials from "./sections/Testimonials";
import FAQ from "./sections/FAQ";
import ContactUs from "./sections/ContactUs";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Sermons from "./pages/Sermons";
import Music from "./pages/Music";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Events from "./pages/Events";
import Forum from "./pages/Forum";
import Children from "./pages/Children";
import Ebooks from "./pages/Ebooks";
import Blog from "./pages/Blog";
import ScrollToTop from "./components/ScrollToTop";

function HomePage() {
  return (
    <>
      <Hero />
      <AboutUs />
      <PowerfulFeatures />
      <Testimonials />
      <FAQ />
      <ContactUs />
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <Nav />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sermons" element={<Sermons />} />
          <Route path="/music" element={<Music />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/events" element={<Events />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/children" element={<Children />} />
          <Route path="/ebooks" element={<Ebooks />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
