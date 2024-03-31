import {HTTP_INTERNAL_SERVER_ERROR} from "./lib/util-js/util";
import boxesService from "./services/boxes-service";

export const emails = `

`

export async function handlerFetch(env: Env) {
    try {

        const carga = emails
            .split("\n")
            .filter(p => p.indexOf('@') > 0)
            .map(p => p.split(',')
                .filter(a => a.indexOf('@') > 0)
                .map(a => a.trim())[0]
            );

        const all = (await new boxesService(env).allEmails());
        const allEmails = all.map(p => p.email);

        for (let p of carga) {

            // let [corpName, email] = p;
            // corpName = corpName.replaceAll(/[^a-zA-Z]/g, ' ');
            // email = email.toLowerCase().replaceAll(/[^a-zA-Z0-9-_\\.@]/g, '');
            // email = email.toLowerCase().replaceAll('\.\.', '.');

            if (p.indexOf('@') === -1) {

                console.log('Invalid email', p);

            } else if (allEmails.filter(v => v === p).length === 0) {

                await new boxesService(env).insertEmail(p, p);

                allEmails.push(p);

            }

        }

        console.log('Bulk insert done');
    } catch (e) {
        console.error(e, e.stack);
        return HTTP_INTERNAL_SERVER_ERROR();
    }
}
