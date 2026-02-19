import "@/styles/globals.css";
import BackgroundOrbs from "@/components/BackgroundOrbs";
import Head from "next/head";

export default function App({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>{`RonHub Raffle | Win the ${process.env.NEXT_PUBLIC_RAFFLE_PRIZE || "BGS 7.5 1st Edition Charizard"}`}</title>
                <meta name="description" content={`Enter the RonHub Raffle for a chance to win a ${process.env.NEXT_PUBLIC_RAFFLE_PRIZE || "BGS 7.5 First Edition Charizard"} on the Ronin blockchain.`} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <BackgroundOrbs />
            <main className="relative min-h-screen text-white antialiased">
                <Component {...pageProps} />
            </main>
        </>
    );
}
