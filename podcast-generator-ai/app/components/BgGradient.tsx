import React from "react";

const BgGradient: React.FC = () => {
  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none'>
      {/* Blurred Gradient Circles - fluorescent green theme */}
      <div className='absolute top-[-10%] left-[-5%] w-[50%] h-[50vh] md:w-[600px] md:h-[600px] rounded-full blur-[150px]' style={{backgroundColor: '#00FF41', opacity: 0.3}}></div>
      <div className='absolute bottom-[-10%] right-[-5%] w-[50%] h-[50vh] md:w-[600px] md:h-[600px] rounded-full blur-[150px]' style={{backgroundColor: '#39FF14', opacity: 0.2}}></div>
      <div className='absolute top-[40%] right-[10%] w-[40%] h-[40vh] md:w-[400px] md:h-[400px] rounded-full blur-[120px]' style={{backgroundColor: '#00FF7F', opacity: 0.15}}></div>

      {/* Additional gradient effects - fluorescent green theme */}
      <div className='absolute top-[65%] left-[30%] w-[45%] h-[45vh] md:w-[500px] md:h-[500px] rounded-full bg-green-400/20 blur-[100px]'></div>
      <div className='absolute top-[60%] right-[20%] w-[40%] h-[40vh] md:w-[450px] md:h-[450px] rounded-full blur-[120px]' style={{backgroundColor: '#32CD32', opacity: 0.25}}></div>
    </div>
  );
};

export default BgGradient;
