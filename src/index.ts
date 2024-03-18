import {createMimeMessage} from 'mimetext';
import {EmailMessage} from "cloudflare:email";
import boxesService from "./boxesService";
import {isEmpty, randomHEX, streamToArrayBuffer} from "./lib/util-js/util";
import {emailCopiloto} from "./constants";
import {mail, sendemail} from "./sendemail";
import {bulk} from "./bulk";
import {sched} from "./sched";

export default {

    /**
     * Cloudflare Worker email handler
     */
    async email(message: ForwardableEmailMessage, env: Env, ctx: any) {

        const to = message.to.split('@')[0];
        const box = to.split('.')[1];

        if (
            to === 'no-reply' ||
            to === 'no_reply'
        ) {
            message.setReject(`421 4.7.28 Mailbox does not exist. https://www.${env.DKIM_DOMAIN}/ `);
            // message.setReject(`550 5.1.1 Mailbox does not exist. ${env.DKIM_DOMAIN} `);
            return;
        }
        if (message.from.startsWith('postmaster@') || message.to.startsWith('postmaster@')) {
            return;
        }

        let from = await new boxesService(env).owner(box, message.from);
        let content = new TextEncoder().encode("No content");
        try {
            content = await streamToArrayBuffer(message.raw, message.rawSize);
        } catch (e) {
        }

        if (from && from.length > 0) {
            let tag2 = '';
            try {
                tag2 = to.split('.')[2];
            } catch (e) {
                tag2 = '';
            }
            let cabloco = [];
            if (isEmpty(tag2)) {
                cabloco = from.filter(p => message.from === p.owner && isEmpty(p.tag2));
            } else {
                cabloco = from.filter(p => message.from === p.owner && tag2 === p.tag2);
            }

            if (cabloco && cabloco.length > 0) {
                from = cabloco;

                let tmp = from[0];

                from = [{
                    ...tmp,
                    email: emailCopiloto,
                    // @ts-ignore
                }].concat(from);

                for (let p of from) {
                    try {

                        let nextId = await randomHEX();
                        await env.eboxr2.put(nextId + ".txt", content)

                        await sendemail(env, {
                            nameFrom: p.name,
                            from: `${p.tag}.${p.box}${!p.tag2 ? '' : ('.' + p.tag2)}`,
                            nameTo: p.corpName,
                            to: p.email,
                            subject: message.headers.get('subject') || 'Sem assunto',
                            type: message.headers.get('content-type') || 'text/plain',
                            messageid: message.headers.get("message-id") || nextId,
                            url: nextId,
                        });

                    } catch (e) {
                        console.error(e, e.stack);
                    }

                }
                return;
            }
        }

        let persona = await new boxesService(env).whois(box);

        if (persona && persona.length > 0) {

            let tmp = persona[0];

            let cabloco = persona.filter(p => message.from === p.email);

            if (!cabloco || cabloco.length === 0) {
                persona = [{
                    ...tmp,
                    email: message.from,
                    corpName: `${message.from.split('@')[0]} - ${tmp.corpName}`,
                    tag2: '' + persona.length,
                }];
                tmp = persona[0];
                await new boxesService(env).insert(persona[0]);
            } else {
                persona = cabloco;
                tmp = cabloco[0];
            }

            persona = [{
                ...tmp,
                nameFrom: tmp.corpName,
                owner: emailCopiloto,
                // @ts-ignore
            }].concat(persona);

            for (let p of persona) {
                try {

                    let nextId = await randomHEX()
                    await env.eboxr2.put(nextId + ".txt", content);

                    await sendemail(env, {
                        nameFrom: p.corpName,
                        from: `${p.tag}.${p.box}${!p.tag2 ? '' : ('.' + p.tag2)}`,
                        nameTo: p.name,
                        to: p.owner,
                        subject: message.headers.get('subject') || 'Sem assunto',
                        type: message.headers.get('content-type') || 'text/plain',
                        messageid: message.headers.get("message-id") || nextId,
                        url: nextId,
                    });

                } catch (e) {
                    console.error(e, e.stack);
                }

            }
            return;
        }


        let whow = "";
        try {
            whow = message.to + "";
        } catch (e) {
        }

        message.setReject(`550 5.1.1 Mailbox does not exist. ${whow} :: https://www.${env.DKIM_DOMAIN}/ `);

        // TODO Conteudo do email parametrizavel?
        const data = 'Olá,\n\n' +
                'Você tentou entrar em contato à um endereço de e-mail que não existe em nosso sistema. \n\n' +
                'Por favor, verifique o endereço de e-mail e tente novamente. Se você acredita que isso é um erro, entre em contato com nosso suporte.'

            // `Por favor, entre em contato com o e-mail ${persona} para maiores informações.\n\n`
        ;

        let msgId = null;
        let msgSubject = "Casa Das Idéias - Contato";
        try {
            msgId = message.headers.get("message-id");
        } catch (e) {
        }
        if (isEmpty(msgId)) {
            try {
                msgId = message.headers.get("Message-ID");
            } catch (e) {
            }
        }
        try {
            msgSubject = message.headers.get("subject")
        } catch (e) {
        }
        if (isEmpty(msgSubject)) {
            try {
                msgSubject = message.headers.get("Subject")
            } catch (e) {
            }
        }

        let msg = createMimeMessage();
        if (!isEmpty(msgId)) {
            msg.setHeader("In-Reply-To", msgId);
        }
        msg.setSender({name: "Casa Das Idéias", addr: `noreply@${env.DKIM_DOMAIN}`});
        msg.setRecipient(message.from);
        msg.setSubject(`RE: ${msgSubject}`);
        msg.addMessage({
            contentType: 'text/plain',
            data,
        });

        const reply = new EmailMessage(`noreply@${env.DKIM_DOMAIN}`, message.from, msg.asRaw());

        //@ts-ignore
        await message.reply(reply);

    },

    fetch: bulk,
    queue: mail,
    scheduled: sched,

}
