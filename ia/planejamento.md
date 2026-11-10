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
