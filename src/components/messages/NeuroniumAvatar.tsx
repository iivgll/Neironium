"use client";
import React, { useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { Box } from "@chakra-ui/react";

interface NeuroniumAvatarProps {
  isAnimating?: boolean;
  size?: number;
}

const NeuroniumAvatar: React.FC<NeuroniumAvatarProps> = ({
  isAnimating = false,
  size = 50,
}) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    fetch("/animation/neuronium.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Lottie animation loaded");
        setAnimationData(data);
      })
      .catch((error) => console.error("❌ Failed to load animation:", error));
  }, []);

  // Управляем анимацией когда она готова
  useEffect(() => {
    if (!lottieRef.current || !isReady) return;

    if (isAnimating) {
      console.log("▶️ Starting animation");
      lottieRef.current.play();
    } else {
      console.log("⏸️ Pausing animation");
      lottieRef.current.pause();
    }
  }, [isAnimating, isReady]);

  if (!animationData) {
    return null; // Не показываем ничего пока анимация не загрузилась
  }

  return (
    <Box width={`${size}px`} height={`${size}px`}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={true}
        autoplay={true}
        style={{ width: size, height: size }}
        onComplete={() => console.log("🔄 Animation loop complete")}
        onLoopComplete={() => console.log("🔁 Loop iteration complete")}
        onDOMLoaded={() => {
          console.log("🎬 Lottie DOM loaded");
          setIsReady(true);
          // Запускаем анимацию сразу если нужно
          if (isAnimating && lottieRef.current) {
            lottieRef.current.play();
          }
        }}
      />
    </Box>
  );
};

export default NeuroniumAvatar;
