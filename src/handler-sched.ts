import {sendmqemail} from "./sendmqemail";
import boxesService from "./services/boxes-service";
import {getRandomInt, randomHEX, shuffle} from "./lib/util-js/util";
import {randBox, template} from "./util";

export async function handlerSched(event: ScheduledController, env: Env, ctx: ExecutionContext) {

    // return;
    const all = await new boxesService(env).next(0, getRandomInt(10, 100));

    for (let cabloco of all) {

        await sendmqemail({
            nameFrom: `${shuffle(["Marcelo", "Mendes", "M."])[0]}, ${shuffle(["Romero", "R", "Mendes", "M"])[0]}`,
            from: 'marcelo.' + randBox(8),
            nameTo: cabloco.corpName,
            replyTo: "marcelo.mendes@taking.com.br",
            to: cabloco.email,
            subject: shuffle(["Vaga", "Curriculo"]).join(" - "),
            messageid: await randomHEX(16),
            content: template,
            auto: 10,
        } as MQEmail, env);

        await new boxesService(env).markSent(cabloco.email, 10);
    }
}
