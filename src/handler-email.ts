import {createMimeMessage} from 'mimetext';
import {EmailMessage} from "cloudflare:email";
import {isEmpty, randomHEX, streamToArrayBuffer} from "./lib/util-js/util";
import {sendmqemail} from "./sendmqemail";
import boxesService from './services/boxes-service';

const emailCopiloto = "davimesquita@gmail.com";

export default async function handlerEmail(message: ForwardableEmailMessage, env: Env, ctx: any) {

    //region Inicio
    const to = message.to.split('@')[0];

    if (message.from.startsWith('postmaster@') ||
        message.to.startsWith('postmaster@') ||
        to === 'no-reply' ||
        to === 'no_reply'
    ) {
        return;
    }

    //---message.setReject(`421 4.7.28 Mailbox does not exist. https://www.${env.DKIM_DOMAIN}/ `);
    //+++message.setReject(`550 5.1.1 Mailbox does not exist. ${env.DKIM_DOMAIN} `);

    const boxOwner = to.split('.')[0];
    const owner = await new boxesService(env).whoisBox(boxOwner);
    //endregion

    if (owner) {

        //region Inicio 2
        let fromName = '';
        try {
            fromName = message.headers.get("from");
        } catch (e) {
        }
        if (isEmpty(fromName)) {
            try {
                fromName = message.headers.get("From");
            } catch (e) {
            }
        }
        if (!isEmpty(fromName)) {
            fromName = fromName.split('<')[0];
        }
        if (isEmpty(fromName)) {
            fromName = message.from;
        }

        let box = '';
        try {
            box = to.split('.')[1];
        } catch (e) {
        }

        let content = new TextEncoder().encode("No content");
        try {
            content = await streamToArrayBuffer(message.raw, message.rawSize);
        } catch (e) {
        }
        //endregion

        //region Dono da Caixa
        if (!isEmpty(box)) {

            let from = await new boxesService(env).owner(message.from, box);

            if (from.length > 0) {

                if (owner.copyto === 1) {
                    from = [{
                        ...from[0],
                        email: emailCopiloto,
                        // @ts-ignore
                    }].concat(from);
                }

                for (let p of from) {
                    try {

                        let nextId = await randomHEX();
                        await env.eboxr2.put(nextId + ".txt", content)

                        await sendmqemail({
                            nameFrom: p.name,
                            from: `${p.tag}.${p.box}`,
                            nameTo: p.corpName,
                            to: p.email,
                            subject: message.headers.get('subject') || 'Sem assunto',
                            type: message.headers.get('content-type') || 'text/plain',
                            messageid: message.headers.get("message-id") || nextId,
                            url: nextId,
                            fromReal: (owner && owner.reveal === 1) ? message.from : null,
                        }, env);

                    } catch (e) {
                        console.error(e, e.stack);
                    }

                }
                return;

            }
        }
        //endregion

        //region Recebimento
        let reveal = owner.reveal === 1;
        let persona = await new boxesService(env).whois(boxOwner, message.from, box);
        if (persona.length === 0) {
            if (owner) {
                let ownerTag = await new boxesService(env).insertUntil(owner, fromName, message.from);
                if (ownerTag) {
                    persona = [ownerTag];
                }
            }
        }

        if (persona && persona.length > 0) {

            if (owner.copyto === 1) {
                persona = [{
                    ...persona[0],
                    nameFrom: persona[0].corpName,
                    owner: emailCopiloto,
                    // @ts-ignore
                }].concat(persona);
            }

            for (let p of persona) {
                try {

                    let nextId = await randomHEX()
                    await env.eboxr2.put(nextId + ".txt", content);

                    await sendmqemail({
                        nameFrom: p.corpName,
                        from: `${p.tag}.${p.box}`,
                        nameTo: p.name,
                        to: p.owner,
                        subject: message.headers.get('subject') || 'Sem assunto',
                        type: message.headers.get('content-type') || 'text/plain',
                        messageid: message.headers.get("message-id") || nextId,
                        url: nextId,
                        fromReal: reveal ? message.from : null,
                    }, env);

                } catch (e) {
                    console.error(e, e.stack);
                }

            }
            return;
        }
        //endregion

    }

    //region Rejeicao

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
    //endregion

}
