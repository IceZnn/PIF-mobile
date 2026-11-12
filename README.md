# Aplicativo mobile SESI

Aplicativo de controle de desperdício alimentar feito com React Native e Expo. O projeto usa Expo SDK 54 e foi preparado para execução no Expo Go em Android e iOS.

## Funcionalidades

- Login e cadastro de usuário por CPF.
- Token persistido no armazenamento seguro do dispositivo e enviado como Bearer token às rotas autenticadas.
- Dashboard com dados reais de registros que possuem peso informado.
- Cadastro de refeição, registro manual do peso, detalhes, listagem e exclusão com confirmação.
- Registros sem peso aparecem como **Sem peso registrado** e não entram nos indicadores de desperdício.

## Requisitos e instalação

- Node.js e npm.
- Expo Go compatível com SDK 54 ou emulador Android/iOS.
- API do backend em execução e acessível pelo dispositivo.

```bash
npm install
npx expo start --lan
```

Leia o QR code no Expo Go. Não é necessário gerar um development build para as funções deste aplicativo.

## Endereço da API

O endereço é centralizado em `src/config/api.js`. Por padrão, o app usa `http://10.0.2.2:8001` no emulador Android e `http://127.0.0.1:8001` no simulador iOS.

No Expo Go em um celular físico, `localhost` aponta para o próprio celular. Configure o IP local do computador que executa o backend antes de iniciar o Expo:

```powershell
$env:EXPO_PUBLIC_API_URL = "http://192.168.0.10:8001"
npx expo start --lan
```

Substitua o IP e a porta pelos valores do seu ambiente. O celular e o computador precisam estar na mesma rede, e o firewall deve permitir a conexão.

## Rotas utilizadas

| Método | Endpoint | Uso |
|---|---|---|
| `POST` | `/api/login` | Autentica CPF e senha e retorna o token. |
| `POST` | `/api/cadastro_usuario` | Cadastra usuário. |
| `GET` | `/api/desperdicios` | Lista os registros do usuário autenticado. |
| `GET` | `/api/desperdicios/{id}` | Consulta os detalhes de um registro próprio. |
| `POST` | `/api/desperdicios` | Cria refeição e meta. |
| `POST` | `/api/desperdicios/peso` | Registra o peso real manualmente. |
| `DELETE` | `/api/desperdicios/{id}` | Exclui um registro próprio. |
| `POST` | `/api/logout` | Invalida o token. |

As chamadas autenticadas enviam `Authorization: Bearer <token>`. O backend precisa conter as rotas JSON de listagem, detalhes e exclusão do aplicativo, além das rotas de login, criação, peso e logout já existentes.

O aplicativo não se conecta a balanças, Arduino, ESP32, Bluetooth, MQTT ou sensores.
