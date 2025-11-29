// BananaButton.tsx
import React from "react";

type BananaButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	label: string;          // tekst, gdy NIE ładuje
	loadingLabel?: string;  // tekst, gdy ładuje (opcjonalny)
	loading?: boolean;      // stan ładowania
};

export const BananaButton: React.FC<BananaButtonProps> = ({
	label,
	loadingLabel = "Loading…",
	loading = false,
	className = "",
	disabled,
	...rest
}) => {
	return (
		<button
			type="submit"
			disabled={loading || disabled}
			className={`mt-2 px-4 py-2 rounded bg-yellow-400 text-white cursor-pointer disabled:opacity-50 text-xl flex items-center justify-center gap-2 ${className}`}
			{...rest}
		>
			{loading ? (
				<>
					<span className="animate-spin inline-block" aria-hidden="true">
						🍌
					</span>
					<span>{loadingLabel}</span>
				</>
			) : (
				label
			)}
		</button>
	);
};
