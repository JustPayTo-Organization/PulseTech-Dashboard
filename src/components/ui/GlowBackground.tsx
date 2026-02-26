import React from "react";

type GlowBackgroundProps = {
  showDots?: boolean;
  className?: string;
};

const GlowBackground: React.FC<GlowBackgroundProps> = ({
  showDots = true,
}) => {
  return (
    <>
      {/* Glow blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute -top-24 -right-24 w-72 h-72
                     bg-linear-to-br from-teal-400/40 to-blue-500/40
                     rounded-full blur-[120px] mix-blend-screen"
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72
                     bg-linear-to-br from-purple-400/40 to-pink-500/40
                     rounded-full blur-[120px] mix-blend-screen"
        />
      </div>

      {/* Dot grid overlay */}
      {showDots && (
        <div className="absolute inset-0 z-1 pointer-events-none opacity-[0.06]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
      )}
    </>
  );
};

export default GlowBackground;
