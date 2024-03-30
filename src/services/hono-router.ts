import {Context, Hono} from "hono";
import {bearerAuth} from 'hono/bearer-auth'

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
            console.log(
                await mailto("davi@copiloto.ninja", "Teste do dedeno", {
                        nameFrom: "Deno local",
                        to: "davimesquita@gmail.com",
                        nameTo: "Teste Gmail",
                        subject: "Vaga - Curriculo",
                    }
                )
            )
        } catch (e) {
            console.error(e, e.stack)
        }

        console.log("Estágio 2", new Date())

        return c.text(configs.DKIM_SELECTOR)
    })
}
