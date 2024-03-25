import boxesService from "./boxesService";
import {sendmqemail} from "./sendmqemail";
import {randBox} from "./util";

export async function sched(event: ScheduledController, env: Env, ctx: ExecutionContext) {

    const all = await new boxesService(env).next(1);

    //TODO nao fazer isso
    const name = 'Marcelo R.';
    const box = `marcelo.na${randBox(8)}`;

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
        }, env);

        await new boxesService(env).markSent(cabloco.email);
    }
}
