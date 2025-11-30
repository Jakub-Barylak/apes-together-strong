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
			[onClose]
		);

		if (!isVisible) return null;

		return (
			<div className="max-h-[80vh] min-h-[35%] absolute left-4 bottom-4 w-[calc(100%-2rem)] bg-white rounded-2xl z-1000 p-4 shadow-2xl flex flex-col gap-2 overflow-hidden">
				<header>
					<div className="text-2xl">{headerComponent}</div>
					<XMarkIcon
						className="w-10 h-10 absolute top-4 right-4 cursor-pointer"
						onClick={() => {
							setIsVisible(false);
							onClose?.();
						}}
					/>
				</header>
				<div className="flex-1 overflow-y-auto min-h-0 pr-2">{children}</div>
			</div>
		);
	}
);
