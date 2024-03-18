import boxesService from "./boxesService";
import {sendemail} from "./sendemail";

/**
 *
 */
export async function sched(event: ScheduledController, env: Env, ctx: ExecutionContext) {

    const all = await new boxesService(env).next(100);

    for (let cabloco of all) {
        await sendemail(env, {
            nameFrom: cabloco.name,
            from: `${cabloco.tag}.${cabloco.box}`,
            nameTo: cabloco.corpName,
            to: cabloco.email,
            subject: "Vaga - Curriculo",
            type: `multipart/related; boundary="000000000000b1b6110613c457d9"`,
            url: "template",
            template: true,
        });

        await new boxesService(env).markSent(cabloco.owner, cabloco.email);
    }
}
