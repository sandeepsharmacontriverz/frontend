'use client';

import React, { useEffect } from 'react';
import { useRouter } from '@lib/router-events';

const PhysicalPartnerDashboard = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace('/physical-partner/ginner');
    }, []);

    return (<></>);
}

export default PhysicalPartnerDashboard;