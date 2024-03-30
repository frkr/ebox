import {HTTP_CREATED, HTTP_INTERNAL_SERVER_ERROR, HTTP_UNPROCESSABLE_ENTITY} from "./lib/util-js/util";
import boxesService from "./boxesService";
import {sendmqemail} from "./sendmqemail";


export async function bulk(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.method === "POST" && request.url.includes("/efgsdfgdsfgdsfgsdfgsdfg")) {
        try {

            await sendmqemail({
                nameFrom: "Teste",
                from: "davi@copiloto.social",
                nameTo: "Cabloco",
                to: "davi.m.esquita@gmail.com",
                subject: "Vaga - Curriculo",
                type: `multipart/related; boundary="000000000000b1b6110613c457d9"`,
                url: "template",
                template: true,
            }, env);

            // const carga = emails
            //     .split("\n")
            //     .map(p => p.trim())
            //     .filter(p => !isEmpty(p))
            //     .filter(p => p.indexOf('@') > 0)
            //     .map(p => [p.substring(0, p.lastIndexOf(' ')), p.substring(p.lastIndexOf(' '))].map(p => p.trim()));

            const all = (await new boxesService(env).allEmails());
            const allEmails = all.map(p => p.email);

            let i = 0;
            for (let p of emails) {

                // let [corpName, email] = p;
                // corpName = corpName.replaceAll(/[^a-zA-Z]/g, ' ');
                // email = email.toLowerCase().replaceAll(/[^a-zA-Z0-9-_\\.@]/g, '');
                // email = email.toLowerCase().replaceAll('\.\.', '.');

                if (p.email.indexOf('@') === -1) {

                    console.log('Invalid email', p.email);

                } else if (allEmails.filter(v => v === p.email).length === 0) {

                    await new boxesService(env).insertEmail(p.corpName, p.email);

                    allEmails.push(p.email);

                }

            }

            console.log('Bulk insert done');
        } catch (e) {
            console.error(e, e.stack);
            return HTTP_INTERNAL_SERVER_ERROR();
        }

        return HTTP_CREATED();
    } else {

        // XXX Atack protection
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return HTTP_UNPROCESSABLE_ENTITY();
    }
}
