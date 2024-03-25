import {HTTP_CREATED, HTTP_INTERNAL_SERVER_ERROR, HTTP_UNPROCESSABLE_ENTITY, isEmpty} from "./lib/util-js/util";
import boxesService from "./boxesService";

export const emails = `

1000Medic\tcontato@1000medic.com.br\tEmpresa\tPato Branco
17Partners\tcontato@17partners.com.br\tEmpresa\tSão Paulo

`


export async function bulk(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.method === "POST" && request.url.includes("/malaaao")) {
        try {

            await sendmqemail({
                nameFrom: "Teste",
                from: "davi@teste.com",
                nameTo: "Cabloco",
                to: "davimesquita@gmail.com",
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
            for (let p of carga) {

                let [corpName, email] = p;
                corpName = corpName.replaceAll(/[^a-zA-Z]/g, ' ');
                email = email.toLowerCase().replaceAll(/[^a-zA-Z0-9-_\\.@]/g, '');
                email = email.toLowerCase().replaceAll('\.\.', '.');

                if (allEmails.filter(p => p === email).length === 0) {

                    await new boxesService(env).insertEmail(corpName, email);
                    console.log(corpName, '==--==', email);

                    allEmails.push(email);

                }

            }

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
