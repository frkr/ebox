import {sendmqemail} from "./sendmqemail";
import boxesService from "./services/boxes-service";

export async function handlerSched(event: ScheduledController, env: Env, ctx: ExecutionContext) {

    return;
    const all = await new boxesService(env).next(0, 10000);

    const name = 'Marcelo R.';
    const box = 'marcelo';

    for (let cabloco of all) {

        await sendmqemail({
            nameFrom: name,
            from: box,
            nameTo: cabloco.corpName,
            to: cabloco.email,
            subject: "Vaga - Curriculo",
            type: `multipart/related; boundary="000000000000b1b6110613c457d9"`,
            url: "template",
            template: true,
            auto: 10,
        }, env);

        await new boxesService(env).markSent(cabloco.email, 10);
    }
}
