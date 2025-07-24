import { create } from 'zustand';
import { ReactNode } from 'react';

type ModalState = {
  component: ReactNode | null;
  isOpen: boolean;
  canClose: boolean;
  showModal: (component: ReactNode, canClose?: boolean) => void;
  closeModal: () => void;
};

const useModalStore = create<ModalState>((set) => ({
  component: null,
  isOpen: false,
  canClose: true,
  showModal: (component, canClose = true) => set({ component, isOpen: true, canClose }),
  closeModal: () => set({ isOpen: false }),
}));

export function useModal() {
  const { component, isOpen, showModal, closeModal, canClose } = useModalStore();
  
  return {
    component,
    isOpen,
    showModal,
    closeModal,
    canClose,
  };
}
