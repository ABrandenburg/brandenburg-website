interface ServiceTitanScheduler {
    show: (config: { schedulerId: string }) => void;
}

declare global {
    interface Window {
        _scheduler?: ServiceTitanScheduler;
    }
}

export { };
