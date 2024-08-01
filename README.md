# Initialisation

1. Run `make initialize`.

Your file tree should now look like this:

```
├── .env.example
├── .env
├── .env.test.example
├── .env.test
└── ...
```

1. Adapt env files (`.env.test`, `.env`...), based on provided examples files.
2. Find the token of your Discord bot instance, then put it in the `.env` file (i.e. : `BOT_TOKEN`)
3. Configure your bot as follows:

<p align="center"><img src="./doc/Assets/config.png" alt="Discord bot config (1)" /></p>
<p align="center"><img src="./doc/Assets/config2.png" alt="Discord bot config (2)" /></p>
<p align="center"><img src="./doc/Assets/config3.png" alt="Discord bot config (3)" /></p>

1. Run `docker compose up`
2. You can also run dev mode with `docker compose watch`
