"use client";
import React, { useState } from "react";
import { Avatar, AvatarProps } from "@chakra-ui/react";
import { FiUser } from "react-icons/fi";
import { useTelegram } from "@/contexts/TelegramContext";

interface UserAvatarProps extends Omit<AvatarProps, "src" | "name"> {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showFallback?: boolean;
}

const UserAvatar = React.memo<UserAvatarProps>(
  ({ size = "sm", showFallback = true, ...props }) => {
    const { user, displayName } = useTelegram();
    const [imageError, setImageError] = useState(false);

    // Handle image loading error
    const handleImageError = () => {
      setImageError(true);
    };

    // Determine if we should show user photo
    const shouldShowUserPhoto = user?.photo_url && !imageError;

    return (
      <Avatar
        size={size}
        name={displayName}
        src={shouldShowUserPhoto ? user.photo_url : undefined}
        icon={showFallback ? <FiUser size="16" /> : undefined}
        bg="rgba(136, 84, 243, 0.1)"
        color="rgba(136, 84, 243, 0.8)"
        border="2px solid"
        borderColor="rgba(136, 84, 243, 0.2)"
        loading="lazy"
        onError={handleImageError}
        transition="all 0.2s ease-in-out"
        _hover={{
          transform: "scale(1.05)",
          borderColor: "rgba(136, 84, 243, 0.4)",
        }}
        // Accessibility improvements
        alt={`${displayName} avatar`}
        title={displayName}
        {...props}
      />
    );
  },
);

UserAvatar.displayName = "UserAvatar";

export default UserAvatar;
