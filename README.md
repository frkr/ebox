# e-Box - Broker de e-mails
- Atua como uma caixa postal de correio


- Como funciona
```mermaid
sequenceDiagram
    User->>+Box1: Envia e-mail
    Box1->>+Recipient: Envia e-mail modificando o remetente
    Recipient->>-Box1: Responde e-mail
    Box1->>-User: Envia e-mail modificando o remetente

    New->>+Box1: Envia e-mail
    create participant Box2
    Box1->>-Box2: Criar uma nova caixa de e-mail
    Box2->>+User: Envia e-mail modificando o remetente
    User->>+Box2: Responde e-mail
    Box2->>-New: Envia e-mail modificando o remetente
```
```mermaid
flowchart LR
    User-->|Envia e-mail|box1-->|Modifica remetente|Recipient
    Recipient-->|Responde e-mail|box1-->|Modifica remetente|User
```
```mermaid
flowchart RL
    Recipient2-->|Envia e-mail|box1-->|Cria uma nova caixa|box2-->|Modifica remetente|User
    User-->|Response e-mail|box2-->|Modifica remetente|Recipient2
```

### Configurações de deploy

- Install Submodules

```shell
git submodule init
git submodule update --recursive --remote
# git submodule add https://github.com/frkr/util-js.git
```

- Queue

```shell
npx wrangler queues create ebox
wrangler r2 bucket create ebox
```

#### Banco
```shell
## East North America
npx wrangler d1 create ebox --location=enam
```
```shell
npx wrangler d1 execute ebox --local --file=./schema.sql

npx wrangler d1 execute ebox --local --command="SELECT * FROM boxes"
```
```shell
npx wrangler d1 execute ebox  --file=./schema.sql

npx wrangler d1 execute ebox  --command="SELECT * FROM boxes"
```

# DKIM
```shell
openssl genrsa 2048 | tee priv_key.pem | openssl rsa -outform der | openssl base64 -A | wrangler secret put DKIM_PRIVATE_KEY
echo -n "v=DKIM1;p=" > record.txt && openssl rsa -in priv_key.pem -pubout -outform der | openssl base64 -A >> record.txt
```

## DNS
- TXT

```text
mailchannels._domainkey
```
```text
(record.txt)
```

- TXT

```text
_mailchannels
```

```text
v=mc1 cfid=mundial.workers.dev
```

# Links
- https://blog.mailchannels.com/mailchannels-enables-free-email-sending-for-cloudflare-workers-customers/
- https://github.com/maggie-j-liu/mail
-
