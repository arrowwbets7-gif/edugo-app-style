import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CoachingSection from "@/components/CoachingSection";
import AdmissionsSection from "@/components/AdmissionsSection";
import TrustSection from "@/components/TrustSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import SocialProofSection from "@/components/SocialProofSection";
import CTASection from "@/components/CTASection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <CoachingSection />
      <AdmissionsSection />
      <TrustSection />
      <WhyChooseSection />
      <SocialProofSection />
      <CTASection />
      <ContactSection />
      <Footer />
      <BottomNav />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
