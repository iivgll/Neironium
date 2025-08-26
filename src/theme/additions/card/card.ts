// Dark theme only - removed mode dependency
const Card = {
  baseStyle: () => ({
    p: '20px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    position: 'relative',
    borderRadius: '14px',
    minWidth: '0px',
    wordWrap: 'break-word',
    bg: 'transparent', // Transparent background for card
    boxShadow: 'unset', // No shadow in dark theme
    backgroundClip: 'border-box',
  }),
};

export const CardComponent = {
  components: {
    Card,
  },
};
