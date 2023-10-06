import "./app.css";
export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <html lang="en">
            <body suppressHydrationWarning={true}>
                {children}
            </body>
        </html>
    )
}

export const metadata = {
    title: "Casual Pokémon Teambuilder"
}