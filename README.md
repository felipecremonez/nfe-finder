# Finder | Busca, Manifestação e Download de NF-e por CNPJ 🚀

O **Finder** é uma solução completa para consulta, manifestação de destinatário (Confirmação, Rejeição, Desconhecimento) e download de Notas Fiscais Eletrônicas (NF-e) emitidas contra um CNPJ, sem a obrigatoriedade de configuração direta de certificado digital do lado do usuário final.

---

## 🌟 Funcionalidades Principais

- 🔍 **Consulta Instantânea por CNPJ:** Busca todas as Notas Fiscais destinadas ao CNPJ informado via webservice MDE SEFAZ.
- ⚡ **Manifestação do Destinatário em 1 Clique:**
  - ✅ **Confirmação da Operação** (Aceite oficial da nota)
  - 🛑 **Desconhecimento da Operação** (Rejeição por não reconhecer a compra)
  - ❌ **Operação não Realizada** (Mercadoria não entregue ou avariada)
  - 👁️ **Ciência da Emissão** (Tomar conhecimento da nota)
- 📥 **Download de Arquivos XML:** Baixe o arquivo XML autorizado de forma nativa para seu sistema contábil.
- 🎨 **Interface Dark Mode Responsiva:** UI moderna estilo Enterprise desenvolvida com Tailwind CSS.

---

## 🏗️ Como Funciona a Integração SEFAZ (Inspirado no node-mde)

O projeto se baseia na arquitetura de WebServices da Receita Federal / SEFAZ via webservice **NFeDistribuicaoDFe** e **NFeRecepcaoEvento**:

1. **Servidor Express (Node.js):** Atua como o intermediário e concentrador das requisições MDE.
2. **Ambiente de Testes / Sandbox:** O projeto conta com um mock backend pré-configurado respondendo na porta `3000` pronto para uso em desenvolvimento local ou em servidores Node.js.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (versão 18+)

### Passo a Passo

1. **Baixe e extraia o arquivo zip do projeto (`finder-nfe.zip`).**
2. **Acesse o diretório do projeto no terminal:**
   ```bash
   cd finder-nfe
   ```
3. **Instale as dependências:**
   ```bash
   npm install
   ```
4. **Inicie o servidor de aplicação:**
   ```bash
   npm start
   ```
5. **Acesse no seu navegador:**
   [http://localhost:3000](http://localhost:3000)

---

## 📁 Estrutura do Projeto

```
finder-nfe/
├── package.json         # Configurações do projeto e dependências Node.js
├── server.js            # Servidor Express com APIs REST de busca, manifestação e download
├── public/
│   └── index.html       # Interface web SPA moderna (HTML5 + Tailwind CSS + Vanilla JS)
└── README.md            # Documentação do projeto
```

---

## 📄 Licença
Projeto de código aberto sob a licença MIT.
