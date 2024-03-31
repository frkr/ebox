import {Context, Hono} from "hono";
import {bearerAuth} from 'hono/bearer-auth'
import {sendmqemail} from "../sendmqemail";
import {randomHEX, shuffle} from "../lib/util-js/util";
import {template} from "../util";

export function honoRouter(app: Hono, configs: Env) {
    app.use('/*', bearerAuth({
        token: configs.TOKEN,
        hashFunction: async (t: string) => {
            if (t === configs.TOKEN) {
                return true
            }
            // XXX Atack prevention
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return false
        }
    }))

    app.post('/mail', async (c: Context) => {

        console.log("Estágio 1", new Date())
        try {
            await sendmqemail({
                nameFrom: 'Davi',
                from: 'davi',
                nameTo: "Marcelo",
                replyTo: "davimesquita@gmail.com",
                to: "davimesquita@gmail.com",
                subject: shuffle(["Vaga", "Curriculo"]).join(" - "),
                messageid: await randomHEX(16),
                content: template,
            } as MQEmail, c.env);

            // await handlerFetch(c.env);
        } catch (e) {
            console.error(e, e.stack)
        }

        console.log("Estágio 2", new Date())

        return c.text("Estágio 3")
    })
}
