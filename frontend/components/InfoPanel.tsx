import { XMarkIcon } from "@heroicons/react/24/solid";
import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import { useState } from "react";
import { InfoPanelHandle, InfoPanelProps } from "@/types/types";

export const InfoPanel = forwardRef<InfoPanelHandle, InfoPanelProps>(
  ({ headerComponent, children, visible, onClose }: InfoPanelProps, ref) => {
    const [isVisible, setIsVisible] = useState(visible ?? false);

    useImperativeHandle(
      ref,
      () => ({
        open() {
          setIsVisible(true);
        },
        close() {
          setIsVisible(false);
          onClose?.();
        },
      }),
      [onClose],
    );

    if (!isVisible) return null;

    return (
      <div className="absolute left-4 bottom-4 w-[calc(100%-2rem)] h-[40%] bg-white rounded-2xl z-1000 p-4 shadow-2xl grid grid-rows-[auto_1fr] gap-4">
        <header>
          <div>{headerComponent}</div>
          <XMarkIcon
            className="w-10 h-10 absolute top-4 right-4 cursor-pointer"
            onClick={() => {
              setIsVisible(false);
              onClose?.();
            }}
          />
        </header>
        <div className="overflow-auto">{children}</div>
      </div>
    );
  },
);
