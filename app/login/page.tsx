"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";

const Google = ({ ...props }: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path
            fill="#EA4335"
            d="M5.27 9.76A7.08 7.08 0 0 1 16.42 6.5L19.9 3A11.97 11.97 0 0 0 1.24 6.65z"
        ></path>
        <path
            fill="#34A853"
            d="M16.04 18.01A7.4 7.4 0 0 1 12 19.1a7.08 7.08 0 0 1-6.72-4.82l-4.04 3.06A11.96 11.96 0 0 0 12 24a11.4 11.4 0 0 0 7.83-3z"
        ></path>
        <path
            fill="#4A90E2"
            d="M19.83 21c2.2-2.05 3.62-5.1 3.62-9 0-.7-.1-1.47-.27-2.18H12v4.63h6.44a5.4 5.4 0 0 1-2.4 3.56l3.8 2.99Z"
        ></path>
        <path
            fill="#FBBC05"
            d="M5.28 14.27a7.12 7.12 0 0 1-.01-4.5L1.24 6.64A11.9 11.9 0 0 0 0 12c0 1.92.44 3.73 1.24 5.33z"
        ></path>
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // NO ACTUAL AUTH - redirecting to connect page to start the journey
        router.push("/connect");
    };

    return (
        <div className="page-container flex items-center justify-center min-h-screen">
            <div className="w-full max-w-[400px] p-8">
                <div className="flex flex-col space-y-6">
                    <div className="flex flex-col space-y-2 text-center">
                        <h2 className="text-3xl font-medium tracking-tight">
                            Welcome back
                        </h2>
                        <p className="subtitle">
                            Enter your email to sign in to your account
                        </p>
                    </div>

                    <Suspense fallback={<div className="text-center opacity-50">Loading interface...</div>}>
                        <div className="grid gap-6">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="grid gap-2">
                                    <label htmlFor="email" className="text-sm font-medium opacity-70">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="johndoe@mail.com"
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-primary w-full justify-center">
                                    Sign In with Email
                                </button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-stroke" />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                                    <span className="bg-bg px-3 text-text-subtle font-semibold">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => router.push("/connect")}
                                className="btn-secondary w-full justify-center"
                            >
                                <div className="flex items-center gap-3">
                                    <Google className="size-5" />
                                    <span>Sign In with Google</span>
                                </div>
                            </button>
                        </div>
                    </Suspense>

                    <p className="text-center text-xs text-text-subtle px-4 leading-relaxed">
                        By clicking continue, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-fg transition-colors"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-fg transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
