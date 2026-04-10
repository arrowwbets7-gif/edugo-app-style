import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CoachingSection from "@/components/CoachingSection";
import AdmissionsSection from "@/components/AdmissionsSection";
import TrustSection from "@/components/TrustSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import SocialProofSection from "@/components/SocialProofSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";
import CoachingChoiceModal from "@/components/CoachingChoiceModal";

const Index = () => {
  return (
    <div className="min-h-screen scroll-smooth">
      <CoachingChoiceModal />
      <Header />
      <HeroSection />
      <CoachingSection />
      <AdmissionsSection />
      <TrustSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <TestimonialsSection />
      <SocialProofSection />
      <FAQSection />
      <CTASection />
      <ContactSection />
      <Footer />
      <BottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
