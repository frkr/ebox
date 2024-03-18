import {Ai} from "@cloudflare/ai";
import {
    HTTP_CREATED,
    HTTP_INTERNAL_SERVER_ERROR,
    HTTP_UNPROCESSABLE_ENTITY,
    isEmpty,
    randomHEX
} from "./lib/util-js/util";
import boxesService from "./boxesService";

export const emails = `

1000Medic\tcontato@1000medic.com.br\tEmpresa\tPato Branco
17Partners\tcontato@17partners.com.br\tEmpresa\tSão Paulo

`

/*
 novos

atendimentosp@bbosch.com.br

 */

export async function bulk(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.method === "POST" && request.url.includes("/malaaao")) {
        try {

            //region import
            const ai = new Ai(env.AI);

            const carga = emails
                .split("\n")
                .map(p => p.trim())
                .filter(p => !isEmpty(p))
                .map(p => p.split("\t").map(p => p.trim()));

            const all = (await new boxesService(env).all());
            const allEmails = all.map(p => p.email);
            const allBoxes = all.map(p => p.box);

            let i = 0;
            for (let p of carga) {

                let [corpName, email, segm] = p;

                if (allEmails.filter(p => p === email).length === 0) {

                    let box = !corpName ? await randomHEX(16) : corpName;
                    box = box.toLowerCase().replaceAll(/[^a-z]/g, '');
                    box = box.length > 3 ? box : await randomHEX(16);

                    let cabloco = {
                        box,
                        owner: "marcelo.mendes@taking.com.br",
                        name: "Marcelo Mendes",
                        tag: "marcelo",
                        tag2: "",
                        corpName,
                        email,
                        segm: !segm ? '' : segm.replaceAll(/[^a-zA-Z0-9]/g, ' ')
                    };

                    let boxChoices: string[] = [box.substring(0, 3)];
                    if (allBoxes.filter(p => p === box).length === 0) {
                        await new boxesService(env).insert(cabloco);
                        allBoxes.push(box);
                    } else {

                        let messages = [
                            {
                                role: "user",
                                content: `Crie uma lista com ate 10 itens com um tamanho de 3 caracteres usando essas letras: ${box}`,
                            },
                        ];
                        let response: any = await ai.run("@cf/meta/llama-2-7b-chat-int8", {messages});
                        boxChoices = response.response.split(',').map(p => p.toLowerCase().replaceAll(/[^a-z]/g, '').trim()).map(g => g.length > 3 ? g.substring(0, 3) : g);
                        boxChoices = boxChoices.concat([box + 'a', box + 'b', box + 'c', box + 'd', box + 'e', box + 'f', box + 'g', box + 'h', box + 'i', box + 'j']);

                        for (let p of boxChoices) {
                            if (allBoxes.filter(p => p === box).length === 0) {
                                cabloco.box = p;
                                await new boxesService(env).insert(cabloco);
                                allBoxes.push(p);
                            }
                        }
                    }
                    allEmails.push(email);

                }

            }
            // //endregion

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
