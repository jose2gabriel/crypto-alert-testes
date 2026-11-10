# Planejamento dos testes E2E com IA generativa

IA utilizada: **Claude (Anthropic)**, em conversa de chat. O prompt descreve o app apenas em texto, sem enviar o código-fonte, para simular o uso típico de uma IA no planejamento. Depois, tudo foi conferido manualmente no app instalado no emulador.

## 1. Prompt utilizado

> Sou estudante e preciso criar testes end-to-end com **Maestro** para um app React Native (Expo) chamado **Crypto Alert**. O app tem três abas na parte de baixo:
>
> 1. **Lista**: mostra criptomoedas buscadas da API da CoinGecko, com nome, símbolo, preço em dólar e variação de 24h. Se a moeda tem alertas, aparece um indicador com a quantidade.
> 2. **Converter**: a pessoa digita uma quantidade, escolhe uma criptomoeda e uma moeda fiduciária (USD, BRL, EUR, GBP, JPY) e vê o valor convertido.
> 3. **Alertas**: lista os alertas de preço. Dá para criar um alerta escolhendo a criptomoeda, o preço-alvo e a condição (acima ou abaixo), e dá para excluir. Os alertas ficam salvos no AsyncStorage.
>
> Sugira cenários de teste E2E importantes para esse app (incluindo casos de erro) e escreva um rascunho dos fluxos em YAML do Maestro para os principais.

## 2. Resposta original da IA

> Ótimo projeto para praticar E2E! Abaixo estão cenários organizados por funcionalidade e, em seguida, rascunhos de fluxos Maestro.
>
> ### Cenários sugeridos
>
> **Lista de criptomoedas**
> 1. Abrir o app e verificar se a lista de criptomoedas carrega (ex.: Bitcoin aparece).
> 2. Verificar se cada item exibe nome, símbolo, preço e variação.
> 3. Pesquisar uma criptomoeda pelo nome na barra de busca.
> 4. Puxar para atualizar (pull-to-refresh) e verificar se os preços são recarregados.
> 5. Simular falta de internet e verificar a mensagem de erro e o botão de tentar novamente.
>
> **Conversão**
> 6. Converter 1 BTC para USD e verificar se o resultado aparece.
> 7. Trocar a moeda fiduciária para BRL e verificar se o símbolo muda para R$.
> 8. Digitar um valor inválido (ex.: letras ou zero) e verificar a mensagem de erro.
>
> **Alertas**
> 9. Criar um alerta "acima de" para o Bitcoin e verificar se aparece na lista.
> 10. Tentar salvar o alerta sem preencher os campos e verificar as mensagens de validação.
> 11. Excluir um alerta e verificar se a lista fica vazia.
> 12. Editar um alerta existente e verificar o novo preço.
> 13. Fechar e reabrir o app e verificar se o alerta continua salvo (persistência).
> 14. Verificar se uma notificação é disparada quando o preço atinge o alvo.
> 15. Criar um alerta e verificar o indicador de alertas na aba Lista.
>
> ### Rascunho dos fluxos
>
> ```yaml
> # lista.yaml
> appId: com.cryptoalert
> ---
> - launchApp
> - assertVisible: "Criptomoedas"
> - assertVisible: "Bitcoin"
> - assertVisible: "BTC"
> ```
>
> ```yaml
> # converter.yaml
> appId: com.cryptoalert
> ---
> - launchApp
> - tapOn: "Converter"
> - tapOn:
>     id: "amount-input"
> - inputText: "1"
> - tapOn: "Bitcoin"
> - tapOn: "BRL"
> - assertVisible: "R$"
> ```
>
> ```yaml
> # criar_alerta.yaml
> appId: com.cryptoalert
> ---
> - launchApp
> - tapOn: "Alertas"
> - tapOn: "+"
> - tapOn: "Selecione a criptomoeda"
> - tapOn: "Bitcoin"
> - tapOn:
>     id: "target-price-input"
> - inputText: "70000"
> - tapOn: "Acima"
> - tapOn: "Salvar"
> - assertVisible: "Bitcoin"
> - assertVisible: "70000"
> ```
>
> ```yaml
> # excluir_alerta.yaml
> appId: com.cryptoalert
> ---
> - launchApp
> - tapOn: "Alertas"
> - longPressOn: "Bitcoin"
> - tapOn: "Excluir"
> - assertVisible: "Nenhum alerta"
> ```
>
> **Dicas:** use `clearState: true` no `launchApp` para começar sempre do zero, e adicione `testID` nos componentes para ter seletores mais estáveis. Ajuste os textos conforme a interface real do app.

## 3. Cenários selecionados

Depois de comparar a resposta com o app rodando no emulador, foram escolhidos quatro cenários, um para cada fluxo principal do app:

| # | Cenário | Origem na resposta da IA | Arquivo |
|---|---|---|---|
| 1 | Abrir o app e ver a lista de moedas com nome, símbolo, preço e variação de 24h | Cenários 1 e 2 | `.maestro/01_listar_criptomoedas.yaml` |
| 2 | Converter uma quantidade de BTC para USD, validar valor inválido e trocar para BRL | Cenários 6, 7 e 8 | `.maestro/02_converter_moeda.yaml` |
| 3 | Criar um alerta "acima de" para o Bitcoin e ver o indicador na aba Lista | Cenários 9, 10 e 15 | `.maestro/03_criar_alerta.yaml` |
| 4 | Criar e excluir um alerta, voltando ao estado vazio | Cenário 11 | `.maestro/04_excluir_alerta.yaml` |

## 4. Análise crítica

### O que foi aproveitado

- A divisão dos cenários pelas três abas (Lista, Converter, Alertas) e a ideia geral de cada fluxo.
- A dica de usar `launchApp` com `clearState: true`, para cada teste começar sem alertas salvos e não depender da ordem de execução.
- O cenário 15 (indicador de alertas na aba Lista), que testa a integração entre duas telas.
- A estrutura básica dos YAMLs (`launchApp`, `tapOn`, `inputText`, `assertVisible`).

### O que foi corrigido

- **`appId` errado:** a IA usou `com.cryptoalert`, mas o pacote real definido no `app.json` é `com.cryptoalert.app`. Com o valor da IA, o Maestro nem abre o app.
- **Textos em português:** a IA traduziu a interface ("Alertas", "Converter", "Salvar", "Acima", "Nenhum alerta"), mas o app é todo em inglês. Os seletores foram trocados pelos textos reais: `Alerts`, `Convert`, `Save Alert`, `Above target price`, `No alerts yet` etc.
- **Seletores por `id` inexistentes:** `amount-input` e `target-price-input` não existem no código, porque o app não tem `testID`. Os campos foram selecionados pelo placeholder real (`0.00`) e pelos rótulos de acessibilidade (`Delete alert`, `Toggle alerts for this cryptocurrency`).
- **Botão "+":** o botão de criar alerta tem o texto `New Alert` (ou `Create Alert` no estado vazio), não só o ícone "+".
- **Exclusão:** a IA supôs um `longPressOn` com menu "Excluir". No app, o alerta tem um botão de lixeira com rótulo `Delete alert`, e a exclusão é imediata, sem confirmação.
- **Valores fixos:** a IA verificava `"70000"`, mas o app formata como `$70,000.00`. Para preços da API, que mudam o tempo todo, foram usadas expressões regulares (`\$[0-9,]+\.[0-9]{2}`) em vez de valores exatos.
- **Carregamento da API:** a IA não esperava a resposta da CoinGecko. Foi adicionado `extendedWaitUntil` com timeout de 20 s para evitar falhas por lentidão da rede.
- **Validação do formulário:** a IA sugeriu verificar mensagens de erro ao salvar vazio, mas o app não mostra mensagem; ele deixa o botão `Save Alert` desabilitado. O teste verifica `enabled: false`.

### O que foi descartado

- **Cenário 3 (busca por nome):** o app não tem barra de busca.
- **Cenário 12 (editar alerta):** não existe edição de alertas, só criar e excluir.
- **Cenário 14 (notificação ao atingir o preço):** o app não dispara notificações, e mesmo que disparasse, depender do preço real do mercado deixaria o teste imprevisível.
- **Cenário 5 (sem internet):** exigiria desligar a rede do emulador durante o teste, o que é instável no Maestro. O estado de erro já é coberto pelos testes de integração com Jest (`fetch` mockado).
- **Cenário 4 (pull-to-refresh):** como os preços podem não mudar entre duas chamadas, não há como verificar de forma confiável que houve atualização.
- **Cenário 13 (persistência após reabrir):** foi considerado, mas ficou de fora dos quatro principais. A persistência no AsyncStorage já é verificada nos testes de integração.

### Conclusão

A IA acelerou o levantamento de ideias, mas nenhum dos quatro rascunhos funcionou sem alteração: todos tinham `appId` e seletores incorretos, porque ela não conhecia a interface real. Dos 15 cenários, 6 foram descartados por descreverem funções que o app não tem ou por serem instáveis. Isso confirma o que o artigo GenIA-E2ETest aponta: a IA gera um bom ponto de partida, mas a revisão humana e a execução no app real são indispensáveis.
