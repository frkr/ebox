import boxesService from "./services/boxes-service";

export async function sendmqemail(data: MQEmail, env: Env) {
    await env.ebox.send(
        data,
        {
            contentType: "json",
        }
    );
}

export async function mailevent(batch: MessageBatch<MQEmail>, env: Env): Promise<void> {
    for (let msg of batch.messages) {
        let sent = false;
        let blocked = false;
        try {
            let content = msg.body.content;

            if (!content && msg.body.url) {
                try {
                    content = await (await env.eboxr2.get(msg.body.url + '.txt')).text();
                    if (content) {
                        content = content.substring((content.indexOf("To: ") !== -1 ? content.indexOf("To: ") : content.indexOf("to: ")));
                        content = content.substring(content.indexOf("Content-"));
                    }
                } catch (e) {
                }
            }

            if (content) {

                let emailFromFinal = `${msg.body.from.split("@")[0]}@${env.DKIM_DOMAIN}`;
                let resp = await mailchannel(emailFromFinal, content, msg, env);

                if (resp.status === 202) {
                    sent = true;
                    console.log(`Email sent successfully: ${emailFromFinal} - ${msg.body.to}: ${msg.body.subject}`);
                } else {

                    let respContent = resp.status + "\n\n" + resp.message;

                    blocked = respContent.indexOf("550 5.7.1 [ESA]") !== -1;

                    console.error(`Email failed to send: ${emailFromFinal} - ${msg.body.to}: ${msg.body.subject}`);
                    console.error(respContent);
                }
            } else {
                sent = true;
                console.error(`Email not sent, no content: ${msg.body.from} - ${msg.body.to}: ${msg.body.subject}`);
            }

        } catch (e) {
            console.error("queue:", batch.queue, e, e.stack);
        } finally {
            if (!msg.body.template && msg.body.url) {
                try {
                    await env.eboxr2.delete(msg.body.url + '.txt');
                } catch (e) {
                }
            }
            try {
                const box = new boxesService(env);
                if (!sent) {
                    if (blocked) {
                        await box.markSent(msg.body.to, -2);
                    } else {
                        await box.markSent(msg.body.to, -1);
                    }
                } else if (msg.body.auto > 5) {
                    await box.markSent(msg.body.to, msg.body.auto + 10);
                }

            } catch (e) {
            }

            try {
                msg.ack();
            } catch (e) {
            }
        }
    }
}

export async function mailchannel(emailFromFinal: string, content: string, msg: Message<MQEmail>, env: Env): Promise<MQEmailResponse> {
    let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({
            personalizations: [
                {
                    to: [
                        {
                            name: msg.body.nameTo,
                            email: msg.body.to,
                        },
                    ],
                    reply_to: msg.body.replyTo ? {
                        name: msg.body.nameFrom,
                        email: msg.body.replyTo,
                    } : null,
                    dkim_domain: env.DKIM_DOMAIN,
                    dkim_selector: env.DKIM_SELECTOR,
                    dkim_private_key: env.DKIM_PRIVATE_KEY,
                },
            ],
            from: {
                name: msg.body.nameFrom,
                email: emailFromFinal,
            },
            subject: msg.body.subject,
            content: [
                {
                    type: msg.body.type || "text/plain",
                    value: content,
                },
            ],
        }),
    });

    let resp = await fetch(send_request);

    return {
        status: resp.status,
        message: resp.status === 202 ? null : await resp.text(),
    }
}
