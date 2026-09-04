import React from 'react';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainButton from './MainButton';

const HeroSection = () => {
 

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center w-full">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0503] via-[#1a0a06] to-[#0d0604]" />
        
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1920&q=80" 
            alt="Library Bookshelf"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0503] via-transparent to-[#0a0503] opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0503]/80 via-transparent to-[#0a0503]/80" />
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 left-0 right-0 h-[40%] bg-gradient-to-b from-[#2d120a]/30 to-transparent transform -skew-y-3" />
          <div className="absolute top-[20%] right-0 w-[70%] h-[60%] bg-gradient-to-l from-[#6b1a1a]/15 to-transparent rounded-full blur-3xl transform translate-x-[30%]" />
          <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-[#2d120a]/40 to-transparent transform skew-y-2" />
          <div className="absolute top-[40%] left-0 w-[50%] h-[40%] bg-gradient-to-r from-[#c8963e]/5 to-transparent rounded-full blur-3xl transform -translate-x-[20%]" />
          <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[30%] bg-gradient-to-l from-[#d4a85a]/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="absolute inset-0 opacity-[0.03]" 
             style={{
               backgroundImage: `radial-gradient(circle at 20px 20px, #c8963e 1px, transparent 1px)`,
               backgroundSize: '40px 40px'
             }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-20 w-full">
        <div className="flex flex-col items-center justify-center gap-4 md:gap-6 text-center">
          
          <h4 className="uppercase text-[#d4a85a] text-sm md:text-xl mb-2 text-center tracking-widest">
            Read. Learn. Grow.
          </h4>

          

          <p className="text-[1.2rem] md:text-[1.9rem] w-[90%] lg:w-[65%] text-center font-light text-[#d4b8a0] leading-relaxed">
            Join a growing community of learners accessing free books, study materials, 
            and courses at EDURARY.
          </p>

          <div className="flex p-[0.5px] bg-gradient-to-b from-[#c8963e]/50 to-transparent rounded-2xl mt-5 mb-10 sm:mb-10">
            <MainButton 
              href="/books" 
              text="Start Journey" 
              size="lg"
            />
          </div>

          <div className="border mt-8 border-[#302C2A] w-full lg:w-[90%] p-5 md:p-7 rounded-2xl flex lg:flex-row flex-col gap-6"
               style={{ 
                 backdropFilter: 'blur(20px)', 
                 boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 7px 0px, rgba(0, 0, 0, 0.1) 0px 4px 4px 0px, rgba(0, 0, 0, 0.05) 0px 4px 4px 0px, rgb(48, 44, 42) 0px 1px 68.7px 0px inset'
               }}>
            
            <div className="w-full lg:w-1/2 max-md:space-y-4 md:grid md:grid-cols-2 md:grid-rows-2 gap-4 md:gap-6 flex-wrap">
              <div className="rounded-2xl flex flex-col justify-between p-4 md:p-5 border-[#302C2A] border-[0.54px]">
                <div>
                  <div className="flex gap-2 items-center">
                    <FileText className="h-8 w-8 text-[#d4a85a]" />
                    <h1 className="text-4xl md:text-5xl lg:text-4xl tracking-tighter"
                        style={{ background: 'linear-gradient(rgb(255, 112, 60) 28.05%, rgb(153, 67, 36) 100%) text', 
                                WebkitTextFillColor: 'transparent', 
                                display: 'inline-block' }}>
                      10K+
                    </h1>
                  </div>
                  <p className="font-thin mt-1.5 text-xl lg:text-lg text-[#d4b8a0]">Books Available</p>
                </div>
                <p className="mt-auto max-sm:pt-6 text-lg lg:text-base leading-snug text-[#d4b8a0]">
                  Access thousands of free books and study materials.
                </p>
              </div>

              <div className="rounded-2xl flex flex-col justify-between p-4 md:p-5 border-[#302C2A] border-[0.54px]">
                <div>
                  <div className="flex gap-2 items-center">
                    <FileText className="h-8 w-8 text-[#d4a85a]" />
                    <h1 className="text-4xl md:text-5xl lg:text-4xl tracking-tighter"
                        style={{ background: 'linear-gradient(rgb(255, 112, 60) 28.05%, rgb(153, 67, 36) 100%) text', 
                                WebkitTextFillColor: 'transparent', 
                                display: 'inline-block' }}>
                      500+
                    </h1>
                  </div>
                  <p className="font-thin mt-1.5 text-xl lg:text-lg text-[#d4b8a0]">Premium Courses</p>
                </div>
                <p className="mt-auto max-sm:pt-6 text-lg lg:text-base leading-snug text-[#d4b8a0]">
                  Learn from industry experts at affordable prices.
                </p>
              </div>

              <div className="rounded-2xl flex flex-wrap max-sm:leading-tight items-center col-span-2 font-light text-2xl sm:text-3xl lg:text-4xl gap-4 py-5 px-4 md:p-5 border-[#302C2A] border-[0.54px]">
                <FileText className="h-8 w-8 text-[#d4a85a]" />
                <span className="text-[#d4b8a0]">Practice with</span>
                <span className="text-[#d4a85a] font-bold">1,000+</span>
                <span className="text-[#d4b8a0]">Tests & Assessments</span>
                <span className="text-xs text-[#8b6b5a] ml-auto">Mock tests included</span>
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex h-[250px] sm:h-[300px] md:h-[350px] relative border border-[#302C2A] bg-black overflow-hidden rounded-2xl">
              <h1 className="text-3xl sm:text-4xl text-white z-10 absolute font-light top-4 left-4">
                Start <br /> Learning
              </h1>
              
              <video 
                className="h-full w-full opacity-60 object-cover" 
                autoPlay 
                loop 
                muted 
                playsInline
                poster="/api/placeholder/800/600"
              >
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <img 
                className="h-full w-full object-cover absolute inset-0 opacity-40"
                src="/api/placeholder/800/600" 
                alt="Learning at EDURARY"
              />

              <Link to="/subscription" className="text-base sm:text-lg backdrop-blur-3xl rounded-xl text-[#d4a85a] z-10 absolute font-thin bottom-4 left-4
                         hover:bg-[#c8963e]/10 hover:border-[#c8963e]/50 transition-all duration-300">
                <MainButton text='Subscribe Now ' variant='outline' />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;