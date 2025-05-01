import React from 'react';

interface PINValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
}

const PINValidationModal: React.FC<PINValidationModalProps> = ({ isOpen, onClose, onSubmit }) => {
  return null;
};

export default PINValidationModal;