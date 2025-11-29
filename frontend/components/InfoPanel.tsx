import { XMarkIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { forwardRef, useImperativeHandle, useRef } from "react";

export type InfoPanelHandle = {
  open: () => void;
};

type InfoPanelProps = {
  headerComponent?: React.ReactNode;
  children: React.ReactNode;
  visible?: boolean;
};

export const InfoPanel = forwardRef<InfoPanelHandle, InfoPanelProps>(
  ({ headerComponent, children, visible }: InfoPanelProps, ref) => {
    const [isVisible, setIsVisible] = useState(visible ?? false); // TODO: zmienić na false

    useImperativeHandle(
      ref,
      () => ({
        open() {
          setIsVisible(true);
        },
      }),
      [],
    );

    const close = () => {
      setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
      <div className="absolute left-4 bottom-4 w-[calc(100%-2rem)] h-[40%] bg-white rounded-2xl z-1000 p-4 shadow-2xl grid grid-rows-[auto_1fr] gap-4">
        <header>
          <div>{headerComponent}</div>
          <XMarkIcon
            className="w-10 h-10 absolute top-4 right-4 cursor-pointer"
            onClick={close}
          />
        </header>
        <div className="overflow-auto">{children}</div>
      </div>
    );
  },
);
