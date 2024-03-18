export default class {
    constructor(readonly env: Env) {
    }

    async owner(box: string, owner: string): Promise<boxes[]> {
        try {

            const {results}: Record<string, any> = await this.env.DB.prepare(
                "SELECT * FROM boxes WHERE box = ? AND owner = ?"
            )
                .bind(box, owner)
                .all()

            return results;

        } catch (e) {
            console.error(e, e.stack);
        }
        return null;
    }


    async all(): Promise<boxes[]> {
        try {

            const {results}: Record<string, any> = await this.env.DB.prepare(
                "SELECT * FROM boxes "
            )
                .all()

            return results;

        } catch (e) {
            console.error(e, e.stack);
        }
        return null;
    }

    async whois(box: string): Promise<boxes[]> {
        try {

            const {results}: Record<string, any> = await this.env.DB.prepare(
                "SELECT * FROM boxes WHERE box = ?"
            )
                .bind(box)
                .all()

            return results;

        } catch (e) {
            console.error(e, e.stack);
        }
        return null;
    }

    async insert(abox: boxes): Promise<void> {
        try {

            await this.env.DB.prepare(
                "INSERT INTO boxes (box,owner,name,tag,tag2,corpName,email,segm,sent) VALUES (?,?,?,?,?,?,?,?,0)"
            )
                .bind(abox.box, abox.owner, abox.name, abox.tag, abox.tag2, abox.corpName, abox.email, abox.segm)
                .run()


        } catch (e) {
            console.error(e, e.stack);
        }
    }

    async next(limit = 1): Promise<boxes[]> {
        try {

            const {results}: Record<string, any> = await this.env.DB.prepare(
                "SELECT * FROM boxes WHERE sent = 0 limit ?"
            )
                .bind(limit)
                .all()

            return results;

        } catch (e) {
            console.error(e, e.stack);
        }
        return [];
    }

    async markSent(owner: string, email: string): Promise<void> {
        try {

            const {results}: Record<string, any> = await this.env.DB.prepare(
                "update boxes set sent = 1 where owner = ? and email = ?"
            )
                .bind(owner, email)
                .run()

        } catch (e) {
            console.error(e, e.stack);
        }
    }

}
