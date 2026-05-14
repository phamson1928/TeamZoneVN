import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react';
import { ThemedDialog, ThemedDialogVariant } from './ThemedDialog';

type ButtonPress = 'primary' | 'secondary';

export type AlertOptions = {
  title: string;
  message: string;
  variant?: ThemedDialogVariant;
  primaryLabel?: string;
  secondaryLabel?: string;
  /** Nút chính: 'primary' xanh | 'accent' tím | 'muted' xám */
  primaryTone?: 'primary' | 'accent' | 'muted';
  primaryDestructive?: boolean;
};

interface AlertContextValue {
  showAlert: (options: AlertOptions) => Promise<ButtonPress>;
}

const AlertContext = createContext<AlertContextValue>({
  showAlert: () => Promise.resolve('primary'),
});

export const useAlert = () => useContext(AlertContext);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState<ThemedDialogVariant>('info');
  const [primaryLabel, setPrimaryLabel] = useState('Đã hiểu');
  const [secondaryLabel, setSecondaryLabel] = useState<string | undefined>();
  const [primaryTone, setPrimaryTone] = useState<
    'primary' | 'accent' | 'muted'
  >('primary');
  const [primaryDestructive, setPrimaryDestructive] = useState(false);

  // Store resolve function outside render cycle
  const resolveRef = useRef<((value: ButtonPress) => void) | null>(null);

  const showAlert = useCallback((options: AlertOptions): Promise<ButtonPress> => {
    return new Promise((resolve) => {
      setTitle(options.title);
      setMessage(options.message);
      setVariant(options.variant ?? 'info');
      setPrimaryLabel(options.primaryLabel ?? 'Đã hiểu');
      setSecondaryLabel(options.secondaryLabel);
      setPrimaryTone(options.primaryTone ?? 'primary');
      setPrimaryDestructive(options.primaryDestructive ?? false);
      resolveRef.current = resolve;
      setVisible(true);
    });
  }, []);

  const handlePrimary = useCallback(() => {
    setVisible(false);
    resolveRef.current?.('primary');
    resolveRef.current = null;
  }, []);

  const handleSecondary = useCallback(() => {
    setVisible(false);
    resolveRef.current?.('secondary');
    resolveRef.current = null;
  }, []);

  const handleBackdrop = useCallback(() => {
    if (!secondaryLabel) {
      setVisible(false);
      resolveRef.current?.('primary');
      resolveRef.current = null;
    }
  }, [secondaryLabel]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <ThemedDialog
        visible={visible}
        title={title}
        message={message}
        variant={variant}
        primaryLabel={primaryLabel}
        onPrimary={handlePrimary}
        secondaryLabel={secondaryLabel}
        onSecondary={secondaryLabel ? handleSecondary : undefined}
        primaryTone={primaryTone}
        primaryDestructive={primaryDestructive}
        onBackdrop={secondaryLabel ? undefined : handleBackdrop}
      />
    </AlertContext.Provider>
  );
};
