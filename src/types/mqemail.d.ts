interface MQEmail {
    nameFrom?: string;
    from?: string;
    nameTo?: string;
    to?: string;
    subject?: string;
    type?: string;
    content?: string;
    messageid?: string;
    url?: string;
    template?: boolean;
    fromReal?: string;
    auto?: number;
}

interface MQEmailResponse {
    status?: number;
    message?: string;
}
