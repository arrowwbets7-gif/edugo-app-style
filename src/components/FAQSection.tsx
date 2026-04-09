import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  { q: "What boards does EduGoClasses offer coaching for?", a: "We offer coaching for WB Board, Bihar Board, CBSE, and ICSE. Our expert teachers provide personalized attention with small batch sizes of maximum 15 students." },
  { q: "How can I apply for admissions through EduGoClasses?", a: "You can apply through our website contact form, call us at 94774 08004, or message us on WhatsApp. Our team will guide you through the entire admission process." },
  { q: "Do you offer distance education programs?", a: "Yes, we provide admission guidance for NIOS, IGNOU, and various distance education programs including B.Ed, D.El.Ed, Graduation, and more." },
  { q: "What is the batch size for coaching classes?", a: "We maintain small batches of maximum 15 students to ensure personal attention and effective doubt-solving sessions for every student." },
  { q: "Is there any admission support for professional courses?", a: "Absolutely! We provide admission support for LL.B, B.Pharma, GNM, BBA, MBA, BCA, and many other professional courses across India." },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold text-accent uppercase tracking-[0.2em] mb-3">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mt-3">Quick answers to common questions</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center gap-3 p-5 text-left"
              >
                <HelpCircle className="w-5 h-5 text-accent shrink-0" />
                <span className="font-semibold text-foreground text-sm flex-1">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="px-5 pb-5 pl-[52px] text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
