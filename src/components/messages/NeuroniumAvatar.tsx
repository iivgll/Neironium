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
        setAnimationData(data);
      })
      .catch((error) => console.error("❌ Failed to load animation:", error));
  }, []);

  // Управляем seamless loop - играем только кадры 0-109, пропускаем кадр 110
  useEffect(() => {
    if (!lottieRef.current || !animationData || !isReady) return;

    const animationInstance = (lottieRef.current as any).animationItem;
    if (!animationInstance) return;

    const handleEnterFrame = () => {
      const currentFrame = animationInstance.currentFrame;
      // Когда достигаем кадра 108, плавно переходим к 0 для бесшовного цикла
      if (currentFrame >= 108) {
        animationInstance.goToAndPlay(0, true);
      }
    };

    animationInstance.addEventListener("enterFrame", handleEnterFrame);

    // Запускаем воспроизведение
    animationInstance.goToAndPlay(0, true);

    return () => {
      animationInstance.removeEventListener("enterFrame", handleEnterFrame);
    };
  }, [animationData, isReady]);

  // Управляем анимацией когда она готова
  useEffect(() => {
    if (!lottieRef.current || !isReady) return;

    if (isAnimating) {
      lottieRef.current.play();
    } else {
      lottieRef.current.pause();
    }
  }, [isAnimating, isReady]);

  if (!animationData) {
    return null;
  }

  return (
    <Box width={`${size}px`} height={`${size}px`}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={true}
        style={{ width: size, height: size }}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
          progressiveLoad: false,
          hideOnTransparent: true,
        }}
        onDOMLoaded={() => {
          setIsReady(true);
          if (isAnimating && lottieRef.current) {
            lottieRef.current.play();
          }
        }}
      />
    </Box>
  );
};

export default NeuroniumAvatar;
