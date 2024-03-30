import {Hono} from "hono";
import handlerEmail from "./handler-email";
import {handlerSched} from "./handler-sched";
import {honoRouter} from "./services/hono-router";

export default {
    //fetch: app.fetch, // TODO talvez seja melhor usar o app.fetch, pois o Intelij
    // esta avisando que pode haver instanciacao infinita.
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {

        const app = new Hono<{ Bindings: Bindings }>()

        // @ts-ignore
        honoRouter(app, env);

        return app.fetch(request, env, ctx);

    },
    queue: handlerEmail,
    scheduled: handlerSched,
}
