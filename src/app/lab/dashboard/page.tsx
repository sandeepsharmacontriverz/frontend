'use client';

import React, { useEffect } from 'react';
import { useRouter } from '@lib/router-events';

const LabDashboard = () => {
    const router = useRouter();

    useEffect(() => {
        router.replace('/lab/mill');
    }, []);

    return (<></>);
}

export default LabDashboard;