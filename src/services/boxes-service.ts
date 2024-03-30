import {randBox} from "../util";

export default class BoxesService {
    constructor(readonly env: Env) {
    }

    async allEmails(): Promise<emails[]> {
        try {

            const {results}: Record<string, any> = await this.env.DB.prepare(
                "SELECT * FROM emails "
            )
                .all()

            if (results) {
                return results;
            }

        } catch (e) {
            console.error(e, e.stack);
        }
        return [];
    }

    async owner(ownerEmail: string, box: string): Promise<boxes[]> {
        try {

            const {results}: Record<string, any> = await this.env.DB.prepare(
                "SELECT * FROM boxes WHERE owner = ? AND box = ?"
            )
                .bind(ownerEmail, box)
                .all()

            if (results) {
                return results;
            }

        } catch (e) {
        }
        return [];
    }

    async whois(boxOwner: string, email: string, box: string = ''): Promise<boxes[]> {
        try {

            const {results}: Record<string, any> = await this.env.DB.prepare(
                "SELECT * FROM boxes WHERE tag = ? AND (email = ? OR box = ?)"
            )
                .bind(boxOwner, email, box)
                .all()

            if (results) {
                return results;
            }

        } catch (e) {
        }
        return [];
    }

    async whoisBox(boxOwner: string): Promise<owners> {
        try {

            const {results}: Record<string, any> = await this.env.DB.prepare(
                "SELECT * FROM owners WHERE tag = ?"
            )
                .bind(boxOwner)
                .all()

            if (results && results.length > 0) {
                return results[0];
            }

        } catch (e) {
            console.error(e, e.stack);
        }
        return null
    }

    // async whoisOwner2(boxOwner: string): Promise<boxes> {
    //     try {
    //
    //         const {results}: Record<string, any> = await this.env.DB.prepare(
    //             "SELECT * FROM boxes WHERE tag = ? limit 1"
    //         )
    //             .bind(boxOwner)
    //             .all()
    //
    //         if (results && results.length > 0) {
    //             return results[0];
    //         }
    //
    //     } catch (e) {
    //         console.error(e, e.stack);
    //     }
    //     return null;
    // }

    async insertEmail(corpName: string, email: string): Promise<void> {
        try {

            await this.env.DB.prepare(
                "INSERT INTO emails (corpName,email,sent) VALUES (?,?,0)"
            )
                .bind(corpName, email)
                .run()


        } catch (e) {
            console.error(e, e.stack);
        }
    }

    async insertUntil(abox: owners, fromName: string, email: string): Promise<boxes> {
        try {
            for (let i = 8; i >= 2; i--) {
                let randTmp = randBox(i);

                let {results}: Record<string, any> = await this.env.DB.prepare(
                    "SELECT * FROM boxes WHERE box = ? AND tag = ? AND owner = ?"
                )
                    .bind(randTmp, abox.tag, abox.owner)
                    .all()

                if (!results || results.length === 0) {
                    await this.env.DB.prepare(
                        "INSERT INTO boxes (box,owner,name,tag,corpName,email) VALUES (?,?,?,?,?,?)"
                    )
                        .bind(randTmp, abox.owner, abox.name, abox.tag, fromName, email)
                        .run()

                    return {
                        ...abox,
                        box: randTmp,
                        corpName: fromName,
                        email: email,
                    };
                }
            }

        } catch (e) {
            console.error(e, e.stack);
        }
        return null;
    }

    async next(sent: number, limit = 1): Promise<emails[]> {
        try {

            const {results}: Record<string, any> = await this.env.DB.prepare(
                "SELECT * FROM emails WHERE sent = ? limit ?"
            )
                .bind(sent, limit)
                .all()

            if (results) {
                return results;
            }

        } catch (e) {
            console.error(e, e.stack);
        }
        return [];
    }

    async markSent(email: string, sent: number): Promise<void> {
        try {

            const {results}: Record<string, any> = await this.env.DB.prepare(
                "update emails set sent = ? where email = ?"
            )
                .bind(sent, email)
                .run()

        } catch (e) {
            console.error(e, e.stack);
        }
    }

}
