# Sistema de Gestão da Igreja

Este é um sistema de gestão desenvolvido para ajudar igrejas a administrar suas atividades, membros, eventos e finanças de forma eficiente.

## Funcionalidades

O sistema inclui as seguintes funcionalidades principais:

- **Gestão de Membros:** Cadastro, atualização e remoção de membros da igreja, incluindo informações pessoais, histórico de participação e status de membros.
- **Gestão de Eventos:** Criação, edição e exclusão de eventos da igreja, incluindo cultos, reuniões, conferências e atividades especiais.
- **Gestão de Finanças:** Registro e acompanhamento de doações, despesas e orçamentos da igreja, gerenciando entradas e saídas financeiras.
- **Agenda:** Visualização e organização de eventos e compromissos da igreja em um calendário integrado.
- **Comunicação:** Facilidade de comunicação entre os membros da igreja, incluindo notificações, mensagens e boletins informativos.
- **Relatórios:** Geração de relatórios personalizados sobre membros, eventos, finanças e outras métricas importantes para a igreja.
- **Escola Biblíca:** Controle e gestão de alunos, frequência e médias de faltas e presenças.

## Tecnologias Utilizadas

- **Frontend:** React.js, Next.js, HTML, CSS, JavaScript.
- **Backend:** PHP, Postgres.
- **Autenticação e Autorização:** JSON Web Tokens (JWT), bcrypt.
- **UI Framework:** Styled-components
- **Testes:** Jest.

## Instalação e Uso

1. Clone este repositório:

   ```
   git clone git@github.com:thiagopersch/church-system.git
   ```

2. Instale as dependências do servidor e do cliente:

   ```
   cd backend && yarn install
   cd frontend && yarn install
   ```

3. Configure as variáveis de ambiente necessárias no servidor:

   - Crie um arquivo `.env` no diretório `server`.
   - Defina as variáveis de ambiente necessárias, como as credenciais do banco de dados e a chave secreta JWT.

4. Inicie o servidor e o cliente em ambiente de desenvolvimento:

   ```
   # No diretório backend/
   yarn dev

   # No diretório frontend/
   yarn dev
   ```

5. Acesse o sistema no seu navegador:

   ```
   http://localhost:3000
   ```

## Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).
