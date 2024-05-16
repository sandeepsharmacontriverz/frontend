'use client'
// import { useRouter } from "next/navigation";
// import Route from "@lib/Route";
// import { useEffect, useState } from "react";

// export default function Router() {
//     const router = useRouter();
//     const [loading, setLoading] = useState(Boolean);

//     useEffect(() => {
//         console.log("clicked");
//         Route.on("route:load", load);
//         return () => {
//             Route.off("route:load", load);
//             setLoading(false);
//         };
//     });

//     function load(path: string) {
//         router.push(path);
//     }

//     return loading;
// }

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Assuming you are using Next.js
import Route from '@lib/Route';
// import { useLoading } from 'context/LoadingContext';

export default function Router() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    // console.log(Route.on('route:load'), "route:load");

    useEffect(() => {
        setLoading(false);
        function handleRouteLoad(path: string) {
            setLoading(false);
            router.push(path);
        }
        Route.on('route:load', handleRouteLoad);
        return () => {
            setLoading(false);
            Route.off('route:load', handleRouteLoad);

        };
    }, [Route]);

    return loading;
}
