# Mesclagem do design MCCAR — especificação

## Objetivo

Concluir a experiência de compra do aplicativo MercadoCar React Native usando as nove telas do material `mccar-html.zip` como referência visual. O fluxo atual de catálogo, produto, carrinho, checkout, login e perfil será preservado; pagamento e confirmação passarão a existir como telas próprias.

## Fonte visual e linguagem de interface

O arquivo anexado representa as telas Home, Listagem, Produto, Carrinho, Checkout, Pagamento, Confirmação, Login e Perfil. A implementação continuará com o sistema visual já presente no app:

- Fundo branco, conteúdo `#18181A`, texto auxiliar cinza e destaque amarelo MCCAR.
- Componentes com cantos de aproximadamente 12–16 px, bordas claras e cartões em cinza suave.
- Fonte e densidade próximas à referência: hierarquia compacta, ícones Feather/MaterialCommunityIcons e barra inferior nas telas de navegação.
- Os produtos continuam utilizando apenas os assets locais existentes em `assets/products`.

## Fluxo de compra

1. O usuário seleciona os itens no catálogo e ajusta as quantidades no carrinho.
2. Em Checkout, endereço, frete, itens e total continuam visíveis. A ação principal segue para a nova tela Pagamento, sem criar pedido.
3. Em Pagamento, o usuário alterna entre Cartão, Pix e Boleto. Cartão exibe campos controlados para número, nome, validade e CVV; Pix e Boleto exibem a instrução adequada ao método selecionado. O resumo usa os totais reais do carrinho.
4. Ao confirmar, o app chama `api.createOrder` com os itens, endereço e método selecionado. Em caso de êxito (ou no modo demonstrativo sem API configurada), o carrinho é limpo e a tela Confirmação recebe os dados do pedido.
5. A confirmação mostra o código do pedido retornado, quando existir; caso contrário usa um código demonstrativo. Ela exibe prazo, endereço, resumo do método e total. “Voltar ao início” retorna à Home; “Acompanhar pedido” informa que o rastreio depende do back-end, sem perder a confirmação.

## Estado e contratos

`App` permanece como o controlador de navegação local. A tela Pagamento receberá `cart`, `subtotal`, `delivery` e `go`; ela cria a solicitação e navega para `confirmation` com um objeto de pedido normalizado. A tela Confirmação recebe esse objeto via `params`.

O contrato de `api.createOrder` permanece `POST /orders` com `{ items, address, paymentMethod }`. A resposta é tratada defensivamente: `id`, `code` ou `orderNumber` podem ser utilizados como identificador, e a ausência de API não deve bloquear a demonstração. Um erro retornado por uma API configurada não pode limpar o carrinho; a tela deve manter o usuário em Pagamento e mostrar uma mensagem acionável.

## Limites de escopo

- Não haverá integração real com gateway, tokenização de cartão, QR Code Pix, geração de boleto ou consulta de pedidos, pois o backend atual não oferece esses contratos.
- Não haverá biblioteca de navegação ou reestruturação ampla do `App.js`; o projeto já centraliza a navegação em estado local.
- Não serão alterados produtos, imagens locais, contrato de catálogo ou autenticação.

## Verificação

Além do teste atual de imagens locais, serão adicionados testes estáticos de fluxo em Node para garantir que as rotas `payment` e `confirmation`, os três métodos e o encaminhamento de checkout existam. A validação manual deverá percorrer Cartão, Pix e Boleto, a confirmação com carrinho preenchido e a falha da criação de pedido com a API configurada.
