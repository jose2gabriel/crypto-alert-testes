# Reflexão — GenIA-E2ETest

Artigo: *GenIA-E2ETest: A Generative AI-Based Approach for End-to-End Test Automation* ([arXiv:2510.01024](https://arxiv.org/abs/2510.01024)).

## 1. Qual problema a abordagem GenIA-E2ETest procura resolver?

Escrever testes end-to-end (E2E) à mão é lento, cansativo e fácil de errar. É preciso conhecer a ferramenta de automação, mapear cada elemento da interface (botões, campos, links) e manter tudo atualizado quando a tela muda. Por isso, muitas equipes pequenas acabam não automatizando os testes de ponta a ponta. O artigo também mostra que a maioria dos trabalhos com LLMs foca em testes unitários, e pouco em testes E2E, que validam o fluxo completo da pessoa usuária.

O GenIA-E2ETest tenta diminuir essa barreira: a pessoa descreve o cenário em linguagem natural e a ferramenta gera um script executável (Robot Framework + Selenium).

## 2. Como a IA generativa pode ajudar na criação de testes E2E?

No artigo, a IA trabalha em três níveis:

1. **Modularização do cenário:** transforma o texto livre em um JSON dividido por página, com os passos de cada uma.
2. **Extração e refinamento dos elementos:** lê o HTML real da página e identifica os elementos que cada passo usa, com seus seletores (XPath). Depois, uma segunda chamada revisa e remove duplicados.
3. **Geração do script:** monta o código final pronto para rodar.

Na prática, a IA ajuda a:

- sair do zero mais rápido, transformando uma ideia ("fazer login e buscar um produto") em passos concretos;
- lembrar de cenários e verificações que a gente esqueceria (casos de erro, campos vazios);
- gerar o código repetitivo, o que deixa para a pessoa a parte de revisar e decidir.

Nos resultados, cerca de 77% dos elementos e de 82% a 85% dos passos executados estavam corretos. Em média, só 10% das linhas dos scripts precisaram ser alteradas manualmente.

## 3. Quais limitações ou riscos existem ao usar testes gerados por IA?

- **Seletores frágeis ou inventados:** a IA pode criar um seletor que não existe ou que quebra na próxima mudança da tela. O artigo cita isso como um problema em aplicações React/Angular.
- **Fluxos que dependem de contexto:** quando um passo depende do resultado de um passo anterior, a IA erra mais. Um dos casos do artigo teve só 12% de acerto e precisou de 49% das linhas reescritas.
- **Conteúdo dinâmico:** elementos que aparecem depois de um carregamento, anúncios e dados que mudam (por exemplo, preço de criptomoeda) atrapalham o script.
- **Ambiguidade na descrição:** se o texto em linguagem natural for vago, a IA "adivinha" o que fazer.
- **Falsa sensação de segurança:** um teste que passa não garante que está testando a coisa certa. A IA pode gerar asserções fracas ou que validam o comportamento errado.
- **Validade limitada:** o próprio estudo usou só 2 aplicações e 12 casos de teste, então não dá para generalizar os números.

## 4. Por que um teste gerado por IA ainda precisa de revisão humana?

Porque a IA não conhece a regra de negócio nem o que é "comportamento correto" para o produto. Ela só produz algo plausível a partir do texto e do HTML. Cabe à pessoa:

- conferir se os seletores batem com a interface real;
- verificar se as asserções realmente validam o resultado esperado, e não só "a tela abriu";
- ajustar esperas e sincronização;
- descartar cenários sem sentido ou repetidos.

O próprio artigo mostra isso: a geração levou cerca de 26 minutos, mas a revisão e a execução manual levaram cerca de 3 horas. Além disso, a avaliação foi feita por um pesquisador experiente. A IA acelera o trabalho, mas a responsabilidade pela qualidade do teste continua sendo humana.

## 5. Como o Maestro pode ser usado para validar, na prática, um fluxo sugerido por uma IA?

O Maestro usa arquivos YAML simples (`launchApp`, `tapOn`, `inputText`, `assertVisible`), em um formato próximo da linguagem natural. Isso facilita transformar o rascunho da IA em um teste e, principalmente, conferir se ele faz sentido. O processo que segui foi:

1. Pedir para a IA sugerir cenários e um rascunho dos fluxos.
2. Abrir o app no emulador e usar o `maestro studio` (ou `maestro hierarchy`) para ver os textos e elementos reais da tela.
3. Corrigir o rascunho para usar os textos e seletores que realmente existem no app (por exemplo, `"Save Alert"`, `"Price Alerts"`).
4. Rodar com `maestro test .maestro/`. Se o fluxo falha, o Maestro mostra em qual passo, o que expõe exatamente onde a IA errou.
5. Repetir até o fluxo passar, de forma estável, contra o app instalado.

Assim, o Maestro funciona como o "juiz": um fluxo sugerido pela IA só é aceito depois de rodar de verdade no aplicativo.

Na prática isso aconteceu neste projeto. Mesmo depois de revisar o rascunho da IA olhando o código, três dos quatro fluxos falharam na primeira execução no emulador. O Maestro mostrou o passo exato e a captura da tela no momento da falha, e assim deu para descobrir problemas que nem a IA nem a leitura do código revelavam: o rótulo das abas começa com o caractere invisível do ícone, o `hideKeyboard` funciona como "Voltar" no Android e fechava a tela, e o texto da condição do alerta aparece como uma frase só. Os detalhes estão em [`ia/planejamento.md`](ia/planejamento.md).
