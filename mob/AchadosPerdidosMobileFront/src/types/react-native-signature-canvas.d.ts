// src/types/react-native-signature-canvas.d.ts
declare module 'react-native-signature-canvas' {
  import React from 'react';
  
  export interface SignatureProps {
    onOK?: (signature: string) => void;
    onEmpty?: () => void;
    onBegin?: () => void;
    onEnd?: () => void;
    descriptionText?: string;
    clearText?: string;
    confirmText?: string;
    webStyle?: string;
    autoClear?: boolean;
    imageType?: 'image/png' | 'image/jpeg';
    ref?: React.Ref<any>;
  }

  const Signature: React.FC<SignatureProps>;
  export default Signature;
}