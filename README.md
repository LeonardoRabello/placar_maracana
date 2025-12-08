Placar do Maracanã (Versão Antiga)

Projeto de simulação do placar antigo do Maracanã, com ideias para evoluir para um sistema completo de placares digitais.

O objetivo principal é criar um placar físico usando ESP32 com duas telas LCD, carcaça impressa em 3D e uma interface web para configuração.

Descrição:

Este projeto simula o placar antigo do Maracanã, com foco em flexibilidade e funções adicionais. Atualmente, ele permite:
- Inserir os nomes dos times
- Atualizar os gols de cada time
- Exibir a hora em formato de relógio digital
- Visualizar o placar de forma estilizada, inspirado em displays de LED

A ideia é que o dispositivo físico seja configurado por um site, permitindo ajustes e futuras funções sem precisar alterar o hardware.

Funcionalidades atuais:
- Placar para dois times com atualização de gols
- Relógio digital integrado
- Display dividido em duas telas LCD controladas pelo ESP32
- Estrutura física em carcaça 3D personalizada

Funcionalidades futuras:
- Mostrar placares em tempo real de jogos selecionados pelo usuário via site de configuração
- Adicionar novas opções de configuração diretamente pelo site, sem precisar mexer no hardware
- Suporte a múltiplos jogos ou torneios
- Animações de transição e efeitos visuais no display LCD

Tecnologias utilizadas:
- ESP32 (controle do placar e relógio)
- Telas LCD (2 unidades)
- HTML / CSS / JavaScript (interface web de configuração)
- Impressão 3D (carcaça do dispositivo)

Como usar:
1. Conectar o ESP32 e as telas LCD conforme o esquema do projeto
2. Abrir o site de configuração para definir os nomes dos times, horários e futuras opções
3. Atualizar os gols diretamente pelo site ou pelo dispositivo
4. Visualizar o placar e a hora no display físico

Estrutura do projeto:
placar-maracana/
│
├── firmware/       # Código para ESP32
│   ├── main.cpp
│   └── lcd_display.cpp
├── web/            # Site de configuração
│   ├── index.html
│   ├── style.css
│   └── script.js
└── design3D/       # Arquivos da carcaça impressa em 3D

Licença:
Este projeto está sob a licença MIT
