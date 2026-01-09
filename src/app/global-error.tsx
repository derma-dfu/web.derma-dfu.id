'use client';

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log exception to console
        console.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
                    <h1 className="text-4xl font-bold">Something went wrong!</h1>
                    <p className="text-muted-foreground">Global application error occurred.</p>
                    <Button onClick={() => reset()}>Try again</Button>
                </div>
            </body>
        </html>
    );
}
