import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

// Define the styled wrapper with dynamic size and hover effects
const IconWrapper = styled(Box)(({ theme, size = 30 }) => ({
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  backgroundColor: 'orange', // Оранжевый фон
  padding: theme.spacing(0.5), // Общий padding
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Тень для 3D эффекта
  color: theme.palette.primary.contrastText, // Цвет текста
  width: size, // Размер передается динамически
  height: size, // Размер передается динамически
  transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Плавные переходы
  cursor: 'pointer',

  // Hover effect
  '&:hover': {
    transform: 'scale(1.1)', // Увеличение при наведении
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)', // Усиление тени при наведении
  },

  // Active effect on click
  '&:active': {
    transform: 'scale(0.95)', // Легкое уменьшение при клике
  },
}));

// Functional component to wrap children with dynamic size
const StyledIconWrapper = ({ children, size }) => {
  return <IconWrapper size={size}>{children}</IconWrapper>;
};

export default StyledIconWrapper;
