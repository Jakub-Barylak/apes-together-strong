"use client";

import "react-toastify/dist/ReactToastify.css";
import { Bounce, ToastContainer } from "react-toastify";

interface ToastProviderProps {
	children: React.ReactNode;
}

export default function ToastProvider({ children }: ToastProviderProps) {

	return (
		<>
			{children}
			<ToastContainer
				position="bottom-right"
				autoClose={5000}
				hideProgressBar={true}
				newestOnTop={false}
				closeOnClick={true}
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
				transition={Bounce}
			/>
		</>
	);
}
