# Painel de Ferramentas

App web com login que dá acesso a várias ferramentas:

- 🧮 Calculadora (com teclado e histórico)
- 💵 Cotação ao vivo (dólar, euro, libra, peso argentino, iene, bitcoin) + conversor
- 📏 Conversor de unidades (distância, peso, temperatura, velocidade)
- ⚖️ Calculadora de IMC
- 🔐 Gerador de senha
- 📮 Consulta de CEP
- 🤖 Assistente de IA (Gemini ou Groq, ambos com plano gratuito)

Feito com Next.js + Tailwind. Não precisa de banco de dados.

## Rodar no seu computador

```bash
npm install
cp .env.example .env.local   # edite os valores
npm run dev
```

Abra http://localhost:3000. Sem `APP_USERS` definido, o login padrão é `admin` / `admin123` (só para testes).

## Variáveis de ambiente

| Variável | Para que serve |
| --- | --- |
| `AUTH_SECRET` | Chave secreta que assina o login. Use algo grande e aleatório (`openssl rand -base64 32`). |
| `APP_USERS` | Usuários permitidos: `usuario:senha,outro:senha2` |
| `GEMINI_API_KEY` | (Opcional) Chave grátis em https://aistudio.google.com/apikey |
| `GROQ_API_KEY` | (Opcional) Alternativa: chave grátis em https://console.groq.com/keys |

## Hospedar de graça na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Entre em https://vercel.com com sua conta do GitHub e clique em **Add New → Project**.
3. Escolha o repositório e, em **Environment Variables**, adicione `AUTH_SECRET`, `APP_USERS` e (se quiser IA) `GEMINI_API_KEY`.
4. Clique em **Deploy**. Em ~1 minuto você recebe um link `https://seu-projeto.vercel.app`.

Também funciona em Netlify ou Render (plano gratuito) sem mudanças no código.
