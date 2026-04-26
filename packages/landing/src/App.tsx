import { Nav } from './components/Nav';
import { Hero } from './sections/Hero';
import { TrustBar } from './sections/TrustBar';
import { Problem } from './sections/Problem';
import { Features } from './sections/Features';
import { HowItWorks } from './sections/HowItWorks';
import { Audiences } from './sections/Audiences';
import { Testimonial } from './sections/Testimonial';
import { Pricing } from './sections/Pricing';
import { FinalCTA } from './sections/FinalCTA';
import { Footer } from './sections/Footer';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <Problem />
        <Features />
        <HowItWorks />
        <Audiences />
        <Testimonial />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
