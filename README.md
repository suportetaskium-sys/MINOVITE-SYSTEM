# MINOVITE — Central de Atendimento

Aplicação web interna, responsiva e sem dependências externas de runtime para a operação de vendas do **MINOVITE**.

## O que está implementado

- Consulta de CEP via ViaCEP com validação e tratamento de erro/timeout.
- Preenchimento manual como contingência caso o serviço de CEP esteja indisponível.
- Endereço editável e formatado.
- Botão para copiar endereço.
- Mensagem de confirmação de endereço pronta para WhatsApp.
- Botão para copiar e abrir a confirmação no WhatsApp.
- Motor interno de estimativa de entrega sem API dos Correios.
- Origem fixa do cálculo: **CEP 04948-970 — São Paulo/SP**.
- Estimativa por região, UF, capital/interior e margem estadual.
- Cálculo em dias úteis com feriados nacionais fixos e postagem considerada em até 1 dia útil.
- Janela estimada de datas de entrega.
- Declaração de confirmação de compra usando exclusivamente o produto **MINOVITE**.
- Validação real de CPF pelos dois dígitos verificadores.
- Valor do pedido obrigatório para gerar a declaração.
- Advertência de inadimplemento obrigatória na declaração, com multa de 10%, juros de 1% ao mês, correção monetária pelo IGPM-FGV e honorários advocatícios de 20%.
- Data preenchida automaticamente e pergunta final de confirmação dos termos e do envio.
- Botões de cópia com fallback para navegadores sem Clipboard API.
- Layout otimizado para desktop, tablet e celular.
- Dados de clientes não são persistidos.
- Endpoint `/health` pronto para Railway.

## Rodar localmente

Requer Node.js 20+.

```bash
npm start
```

Acesse `http://localhost:3000`.

## Testes

```bash
npm test
```

## Deploy no Railway

O projeto possui `Dockerfile` e escuta automaticamente em `0.0.0.0:$PORT`.

1. Crie um serviço no Railway a partir do repositório GitHub.
2. O Railway detectará o `Dockerfile` automaticamente.
3. Em Healthcheck, use `/health`.
4. Em **Networking**, clique em **Generate Domain** para usar o domínio padrão do Railway.
5. Não são necessárias variáveis de ambiente para o funcionamento básico.

## Sobre a previsão de entrega

A faixa exibida é uma **estimativa interna operacional**. Ela não consulta os Correios e não deve ser apresentada como prazo oficial ou garantia dos Correios.
