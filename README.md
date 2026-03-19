# 🎧 Playlist AI – Geração de Playlist Inteligente

O **Playlist AI** é uma plataforma que une Inteligência Artificial e música para oferecer uma experiência personalizada de descoberta e interação social. O frontend foi projetado para ser intuitivo, permitindo que usuários gerem playlists automáticas a partir de referências musicais e interajam com uma comunidade através de seguidores e comentários.

## Sobre o Projeto

O objetivo principal é facilitar a curadoria musical. Através da integração com a API do Spotify para busca de metadados e um motor de IA para sugestões, o usuário pode criar coleções musicais complexas em poucos segundos.

### Funcionalidades Principais
* **Geração Inteligente:** Criação de playlists baseadas em 4 músicas "semente".
* **Ecossistema Social:** Sistema completo de seguidores e solicitações de amizade.
* **Interatividade:** Comentários dinâmicos em cada playlist gerada.
* **Visual Dinâmico:** Gerador de mosaicos de capas de álbuns automático.
* **Gestão de Conta:** Controle de perfil e preferências de privacidade.

## Tecnologias Utilizadas

* [React.js](https://react.dev/): Biblioteca base para construção da interface.
* [TypeScript](https://www.typescriptlang.org/): Linguagem para tipagem estática e segurança do código.
* [Tailwind CSS](https://tailwindcss.com/): Framework para estilização via classes utilitárias.
* [Shadcn UI](https://ui.shadcn.com/): Conjunto de componentes de interface reutilizáveis e acessíveis.
* [Lucide React](https://lucide.dev/): Biblioteca de ícones vetoriais.
* [React Router DOM](https://reactrouter.com/): Gerenciamento de rotas e navegação.
* [Context API](https://react.dev/learn/passing-data-deeply-with-context): Gerenciamento de estado global.
* [Axios](https://axios-http.com/): Cliente HTTP para integração com o backend.
* [Vite](https://vitejs.dev/): Ferramenta de build e servidor de desenvolvimento.

## Estrutura de Pastas

O projeto utiliza uma arquitetura modularizada dentro de `src/` para garantir escalabilidade:

* **src/components/**: Componentes reutilizáveis (Ex: AuthLayout, TrackItem, PlaylistCard).
* **src/pages/**: Telas principais da aplicação e seus subcomponentes específicos.
* **src/contexts/**: Gerenciamento de estado global (Autenticação e dados de usuário).
* **src/services/**: Camada de comunicação com APIs externas (Auth, Spotify, AI).
* **src/types/**: Tipagens TypeScript compartilhadas entre os módulos.
* **src/utils/**: Funções utilitárias e helpers genéricos.
* **src/styles/**: Definições de estilos globais e temas.

## Componentização em Destaque

A aplicação foca na reutilização de código através de componentes modulares:
* **CoverMosaic**: Monta dinamicamente a capa da playlist (mosaico de até 4 imagens).
* **TrackItem**: Exibe informações da faixa com suporte a preview de áudio.
* **PlaylistCard**: Card com suporte a "Skeleton Loading" para melhor experiência de carregamento.
* **AuthLayout**: Padronização visual para fluxos de Login e Cadastro.

## Roteamento

* **Rotas Públicas:** `/login`, `/register` (Redirecionam para a home se logado).
* **Rotas Protegidas:** `/`, `/create-playlist`, `/playlists/:id`, `/profile` (Exigem token válido).

## Desenvolvedores

* [Hildon Neto](https://github.com/Hildon27)
* [Marcos Antonio de Albuquerque Santos](https://github.com/marcosantonio15243)