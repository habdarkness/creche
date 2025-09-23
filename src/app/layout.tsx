
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Template from "@/components/Template";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Creche Estrela",
	description: "Creche Estrela",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
	return (
		<html lang="pt-BR">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Template>
					{children}
				</Template>
			</body>
		</html>
	);
}
