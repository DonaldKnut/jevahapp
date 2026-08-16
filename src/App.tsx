import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Footer from "./sections/Footer";
import Hero from "./sections/Hero";
import Nav from "./sections/Nav";
import AboutUs from "./sections/AboutUs";
import PowerfulFeatures from "./sections/PowerfulFeatures";
import ArtistStudioPromo from "./sections/ArtistStudioPromo";
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
import Login from "./pages/Login";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { FeedbackProvider } from "./components/admin/Feedback";
import AdminShell from "./pages/admin/AdminShell";
import Overview from "./pages/admin/Overview";
import UsersPage from "./pages/admin/Users";
import ReportsPage from "./pages/admin/Reports";
import ModerationPage from "./pages/admin/Moderation";
import ComposeEmailPage from "./pages/admin/ComposeEmail";
import ActivityPage from "./pages/admin/Activity";
import ChurchesPage from "./pages/admin/Churches";
import AudioLibraryPage from "./pages/admin/AudioLibrary";
import ArtistsPage from "./pages/admin/Artists";
import SettingsPage from "./pages/admin/Settings";
import SystemHealthPage from "./pages/admin/SystemHealth";
import CreatorsLanding from "./pages/creators/CreatorsLanding";
import CreatorHow from "./pages/creators/CreatorHow";
import CreatorBenefits from "./pages/creators/CreatorBenefits";
import CreatorApply from "./pages/creators/CreatorApply";
import CreatorStudio from "./pages/creators/CreatorStudio";
import CreatorUpload from "./pages/creators/CreatorUpload";
import ArtistPublicProfile from "./pages/creators/ArtistPublicProfile";
import AnnouncementsPage from "./pages/admin/Announcements";
import CategoriesPage from "./pages/admin/Categories";
import NotificationsPage from "./pages/admin/Notifications";
import EmailLogPage from "./pages/admin/EmailLog";
import ComposeMarketingEmailPage from "./pages/admin/ComposeMarketingEmail";
import ComposeArtistOnboardPage from "./pages/admin/ComposeArtistOnboard";
import EmailUnsubscribe from "./pages/EmailUnsubscribe";
import BibleLayout from "./pages/bible/BibleLayout";
import BibleHome from "./pages/bible/BibleHome";
import BibleReader from "./pages/bible/BibleReader";
import BibleSearch from "./pages/bible/BibleSearch";
import BiblePlans from "./pages/bible/BiblePlans";
import { useDocumentMeta } from "./hooks/useDocumentMeta";
import {
  APP_JSON_LD,
  ORGANIZATION_JSON_LD,
  WEBSITE_JSON_LD,
} from "./lib/seo";

function HomePage() {
  useDocumentMeta({
    title: "Jevah — Gospel music, Bible, and Christian community app",
    description:
      "Jevah is the gospel app for faith: stream worship and Afro-gospel, read the Holy Bible, hear sermons, and grow with a Christian community. Free on web and mobile.",
    canonicalPath: "/",
    jsonLd: [ORGANIZATION_JSON_LD, WEBSITE_JSON_LD, APP_JSON_LD],
  });
  return (
    <>
      <Hero />
      <AboutUs />
      <PowerfulFeatures />
      <ArtistStudioPromo />
      <Testimonials />
      <FAQ />
      <ContactUs />
    </>
  );
}

function MarketingLayout() {
  return (
    <div className="min-h-screen bg-jevah-bg font-sans text-jevah-text antialiased transition-colors duration-300">
      <Nav />
      <Outlet />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <div className="font-sans antialiased">
      <AuthProvider>
        <FeedbackProvider>
          <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/creators/login" element={<Login />} />
            <Route path="/email/unsubscribe" element={<EmailUnsubscribe />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="moderation" element={<ModerationPage />} />
              <Route path="churches" element={<ChurchesPage />} />
              <Route path="audio" element={<AudioLibraryPage />} />
              <Route path="artists" element={<ArtistsPage />} />
              <Route path="email" element={<ComposeEmailPage />} />
              <Route
                path="email/marketing"
                element={<ComposeMarketingEmailPage />}
              />
              <Route
                path="email/artist-onboard"
                element={<ComposeArtistOnboardPage />}
              />
              <Route path="email/log" element={<EmailLogPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="health" element={<SystemHealthPage />} />
            </Route>

            <Route
              path="/creators/apply"
              element={
                <ProtectedRoute requireAdmin={false}>
                  <CreatorApply />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creators/studio"
              element={
                <ProtectedRoute requireAdmin={false}>
                  <CreatorStudio />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creators/studio/upload"
              element={
                <ProtectedRoute requireAdmin={false}>
                  <CreatorUpload />
                </ProtectedRoute>
              }
            />

            <Route element={<MarketingLayout />}>
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
              <Route path="/bible" element={<BibleLayout />}>
                <Route index element={<BibleHome />} />
                <Route path="search" element={<BibleSearch />} />
                <Route path="plans" element={<BiblePlans />} />
                <Route path="plans/:planId" element={<BiblePlans />} />
                <Route path=":book/:chapter" element={<BibleReader />} />
                <Route path=":book/:chapter/:verse" element={<BibleReader />} />
              </Route>
              <Route path="/creators" element={<CreatorsLanding />} />
              <Route path="/creators/how" element={<CreatorHow />} />
              <Route path="/creators/benefits" element={<CreatorBenefits />} />
              <Route path="/artists/:slug" element={<ArtistPublicProfile />} />
            </Route>
          </Routes>
        </Router>
      </FeedbackProvider>
    </AuthProvider>
    </div>
  );
}

export default App;
