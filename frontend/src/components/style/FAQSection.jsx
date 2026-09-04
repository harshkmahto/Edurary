import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, BookOpen, Users, Award, Clock, Zap } from 'lucide-react';
import SquareText from '../../components/style/SquareText';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'What is EDURARY and how does it work?',
      answer: 'EDURARY is an online learning platform that provides free access to books, study materials, and premium courses at affordable prices. Simply create an account, browse our extensive library, and start learning at your own pace. You can access all resources anytime, anywhere.'
    },
    {
      id: 2,
      question: 'Are the books and study materials really free?',
      answer: 'Yes! EDURARY offers a vast collection of books and study materials completely free. We believe education should be accessible to everyone. However, we also offer premium courses with advanced content, live sessions, and personalized mentoring at very affordable prices.'
    },
    {
      id: 3,
      question: 'What kind of courses does EDURARY offer?',
      answer: 'EDURARY offers a wide range of courses including Web Development, Data Science, Digital Marketing, Graphic Design, Programming Languages (Python, JavaScript, etc.), Machine Learning, and many more. All courses are designed by industry experts and are regularly updated.'
    },
    {
      id: 4,
      question: 'How can I enroll in premium courses?',
      answer: 'Enrolling in premium courses is simple. Just browse our course catalog, select the course you\'re interested in, and choose a subscription plan that fits your needs. You can pay securely online and get instant access to all course materials, live sessions, and mentor support.'
    },
    {
      id: 5,
      question: 'Is there a refund policy for premium courses?',
      answer: 'Yes, we offer a 7-day money-back guarantee for all premium courses. If you\'re not satisfied with the course content or learning experience, you can request a full refund within 7 days of purchase. No questions asked!'
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-[#0a0505] py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                      w-[800px] h-[800px] rounded-full 
                      bg-gradient-to-r from-[#8b0000]/20 via-[#4a0000]/10 to-transparent
                      blur-3xl animate-pulse" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] 
                      bg-gradient-to-bl from-[#8b0000]/30 to-transparent 
                      rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] 
                      bg-gradient-to-tr from-[#6b0000]/20 to-transparent 
                      rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 
                      bg-[#c8963e]/5 rounded-full blur-2xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-3">
            <SquareText text="FAQ" size="default" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#f5e6d3]">
            Frequently Asked Questions
          </h2>
          <p className="text-[#d4b8a0] text-lg mt-3 max-w-2xl mx-auto">
            Find answers to the most common questions about EDURARY
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c8963e]/30" />
            <HelpCircle className="w-5 h-5 text-[#c8963e]/50" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c8963e]/30" />
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="bg-[#1a0a0a]/40 backdrop-blur-xl rounded-2xl border border-[#c8963e]/10 
                       hover:border-[#c8963e]/30 transition-all duration-300
                       shadow-[0_0_30px_rgba(200,150,62,0.03)] hover:shadow-[0_0_40px_rgba(200,150,62,0.08)]
                       overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left
                         hover:bg-[#c8963e]/5 transition-colors duration-300"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-full bg-[#c8963e]/10 border border-[#c8963e]/20 
                                flex items-center justify-center flex-shrink-0">
                    <span className="text-[#d4a85a] text-sm font-bold">{index + 1}</span>
                  </div>
                  <span className="text-[#f5e6d3] font-medium text-sm sm:text-base">
                    {faq.question}
                  </span>
                </div>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-[#d4a85a]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#d4b8a0] hover:text-[#d4a85a] transition-colors" />
                  )}
                </div>
              </button>

              {/* Answer - Slides down when open */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                          ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-5 pt-1 border-t border-[#c8963e]/5">
                  <p className="text-[#d4b8a0] text-sm sm:text-base leading-relaxed pl-12">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl
                        bg-gradient-to-r from-[#c8963e]/20 to-[#d4a85a]/10
                        border border-[#c8963e]/30
                        text-[#d4a85a] text-sm font-semibold
                        shadow-[0_0_30px_rgba(200,150,62,0.05)]
                        transition-all duration-300
                        hover:shadow-[0_0_40px_rgba(200,150,62,0.15)]
                        hover:scale-105 cursor-pointer
                        backdrop-blur-sm">
            <BookOpen className="w-4 h-4" />
            <span>Still have questions? Contact Support</span>
            <Zap className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;