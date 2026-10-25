import Navbar from './component/nav-links/Navbar';
import HeroTitle from './component/hero/HeroTitle';
import Background from './component/Background';
import AboutMe from './component/about-me/AboutMe';
import Education from './component/Education/Education';
import Projects from './component/Projects/Projects';
import Playground from './component/playground/Playground';
import Contact from './component/contactme/ContactMe';
import Footer from './component/footer/Footer';
import PageEffects from './component/effects/PageEffects';
import SiteTools from './component/effects/SiteTools';
import usePreferences from './hooks/usePreferences';

export default function App() {
  const preferences = usePreferences();
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Background />
      <PageEffects motionOn={preferences.motionOn} />
      <div className="app-root">
        <Navbar {...preferences} />
        <main id="main-content" tabIndex={-1}>
          <HeroTitle motionOn={preferences.motionOn} />
          <Projects />
          <AboutMe />
          <Education />
          <Playground motionOn={preferences.motionOn} />
          <Contact />
        </main>
        <Footer />
      </div>
      <SiteTools {...preferences} />
    </>
  );
}
