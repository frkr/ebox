interface Env {
    AI: Ai;

    DB: D1Database;
    ebox: Queue<MQEmail>;
    eboxr2: R2Bucket;

    DKIM_PRIVATE_KEY: string;
    DKIM_SELECTOR: string;
    DKIM_DOMAIN: string;
    TOKEN: string;
}

type Bindings = {

    AI: Ai;

    DB: D1Database;
    ebox: Queue<MQEmail>;
    eboxr2: R2Bucket;

    DKIM_PRIVATE_KEY: string;
    DKIM_SELECTOR: string;
    DKIM_DOMAIN: string;
    TOKEN: string;

}
