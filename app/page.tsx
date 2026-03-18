import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 font-sans text-zinc-100">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-zinc-950 sm:items-start">
        <Image
          className="invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-zinc-100">
            Welcome to Vidscreener!
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-400">
            Use the links below to login, register, or access your dashboard.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 text-white px-5 transition-colors hover:bg-blue-700 md:w-[158px]"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-green-600 text-white px-5 transition-colors hover:bg-green-700 md:w-[158px]"
            href="/register"
          >
            Register
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gray-800 text-white px-5 transition-colors hover:bg-gray-900 md:w-[158px]"
            href="/dashboard"
          >
            Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
