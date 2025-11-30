// components/ApeBackground.tsx
export const ApeBackground = () => {
	const segment = "APES TOGETHER STRONG  ";
	const line = segment.repeat(20); // BARDZO długa taśma

	return (
		<div className="absolute inset-0 overflow-hidden">
			<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 space-y-10"
			>
				{/* Linia 1 */}
				<div className="ape-marquee">
					<div className="ape-marquee-inner"
						style={{ animationDuration: "300s" }}
					>
						<span className="text-5xl font-extrabold tracking-[0.4em] uppercase text-amber-900/20 dark:text-amber-100/10">
							{line}
						</span>
						<span className="text-5xl font-extrabold tracking-[0.4em] uppercase text-amber-900/20 dark:text-amber-100/10">
							{line}
						</span>
					</div>
				</div>

				{/* Linia 2 */}
				<div className="ape-marquee">
					<div
						className="ape-marquee-inner"
						style={{ animationDuration: "400s" }}
					>
						<span className="text-5xl font-extrabold tracking-[0.4em] uppercase text-amber-900/15 dark:text-amber-100/5">
							{line}
						</span>
						<span className="text-5xl font-extrabold tracking-[0.4em] uppercase text-amber-900/15 dark:text-amber-100/5">
							{line}
						</span>
					</div>
				</div>

				{/* Linia 3 */}
				<div className="ape-marquee">
					<div
						className="ape-marquee-inner"
						style={{ animationDuration: "500s" }}
					>
						<span className="text-5xl font-extrabold tracking-[0.4em] uppercase text-amber-900/15 dark:text-amber-100/5">
							{line}
						</span>
						<span className="text-5xl font-extrabold tracking-[0.4em] uppercase text-amber-900/15 dark:text-amber-100/5">
							{line}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};
