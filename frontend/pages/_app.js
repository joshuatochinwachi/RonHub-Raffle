import "@/styles/globals.css";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import Head from "next/head";

export default function App({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>{`RonHub Raffle | ${process.env.NEXT_PUBLIC_RAFFLE_PRIZE || "Win BGS 7.5 Charizard"}`}</title>
                <meta name="description" content={`Experience the RonHub Raffle on Ronin blockchain. Join now for a chance to win ${process.env.NEXT_PUBLIC_RAFFLE_PRIZE || "a BGS 7.5 First Edition Charizard"}.`} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" type="image/png" href="/logo.png?v=1" />
            </Head>
            <BackgroundOrbs />
            <main className="relative min-h-screen text-white antialiased">
                <Component {...pageProps} />
            </main>
        </>
    );
}
