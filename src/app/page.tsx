import Hero from "@/components/Hero";
import EditorialSection from "@/components/EditorialSection";
import PhilosophySection from "@/components/PhilosophySection";
import StatsSection from "@/components/StatsSection";
import MarqueeSection from "@/components/MarqueeSection";
import EventsGrid from "@/components/EventsGrid";
import VisualGallery from "@/components/VisualGallery";
import HowItWorks from "@/components/HowItWorks";
import BehindTheScenes from "@/components/BehindTheScenes";
import TrajectorySection from "@/components/TrajectorySection";
import VibeSection from "@/components/VibeSection";
import ReviewsSection from "@/components/ReviewsSection";
import HighlightSection from "@/components/HighlightSection";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <EditorialSection />
      <PhilosophySection />
      <StatsSection />
      <MarqueeSection />
      <EventsGrid />
      <VisualGallery />
      <HowItWorks />
      <BehindTheScenes />
      <TrajectorySection />
      <VibeSection />
      <ReviewsSection />
      <HighlightSection />
      <CTASection />
    </>
  );
}
