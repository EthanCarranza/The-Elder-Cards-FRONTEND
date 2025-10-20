import React from "react";
interface HeroSectionProps {
  title: string;
  image: string;
}
const HeroSection: React.FC<HeroSectionProps> = ({ title, image }) => (
  <>
    {title && (
      <div className="text-white text-center mt-4 sm:mt-6 lg:mt-8 px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 break-words">
          {title}
        </h1>
      </div>
    )}
    <div className="flex justify-center mt-4 sm:mt-6 lg:mt-8 px-4">
      <img
        src={image}
        alt="hero"
        className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-auto object-contain rounded-lg shadow-lg"
      />
    </div>
  </>
);
export default HeroSection;
