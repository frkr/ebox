export async function sendemail(env: Env, data: MQEmail) {
    await env.ebox.send(
        data,
        {
            contentType: "json",
        }
    );
}

export async function mail(batch: MessageBatch<MQEmail>, env: Env): Promise<void> {
    for (let msg of batch.messages) {
        let sent = false;
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
                                dkim_domain: env.DKIM_DOMAIN,
                                dkim_selector: env.DKIM_SELECTOR,
                                dkim_private_key: env.DKIM_PRIVATE_KEY,
                            },
                        ],
                        from: {
                            name: msg.body.nameFrom,
                            email: `${msg.body.from.split("@")[0]}@${env.DKIM_DOMAIN}`,
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

                if (resp.status === 202) {
                    sent = true;
                    console.log(`Email sent successfully: ${msg.body.from} - ${msg.body.to}: ${msg.body.subject}`);
                } else {
                    let respText = await resp.text();

                    let respContent = resp.status + " " + resp.statusText + "\n\n" + respText;

                    console.error(`Email failed to send: ${msg.body.from} - ${msg.body.to}: ${msg.body.subject}`);
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
            if (sent) {
                msg.ack();
            } else {
                msg.retry();
            }
        }
    }
}
