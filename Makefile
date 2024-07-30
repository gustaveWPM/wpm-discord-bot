.PHONY: all install wipe-wireit build fast-build test start pm2-start install-prod prisma-studio initialize-db initialize-env initialize initialize-prod clean fclean re compose-up compose-down compose-build compose-up-detached docker-bot-app-entrypoint

MAKEFLAGS += --silent

#==============
# § I. CONFIG
#==============

PM := bun

ENV_EXAMPLE := .env.example
ENV_FILE := .env

ENV_TEST_EXAMPLE := .env.test.example
ENV_TEST_FILE := .env.test

DIST := ./dist/
TYPECHECK_DIST := ./typecheck-dist/
ESLINT_CACHE := .eslintcache

INIT_MIGRATION_TMP_FILE := 0_init.tmp.23456789876543qsldklfjkhsqsjSQDFGHFDSQS

#=================
# § II. COMMANDS
#=================

#-------------------------
# **** II. 1) PM Related
#-------------------------

# @Mirror
%:
	$(PM) "$@"

# @Default
all: build

# @Mirror
install:
	$(PM) install

# @Override
wipe-wireit:
	$(PM) rimraf .wireit

# @Override
build:
	$(PM) run build

# @Alias
fast-build:
	$(PM) run fast-build

# @Override
test:
	$(PM) run test

# @Override
start: initialize-db
	$(PM) run start

pm2-start: initialize-db
	pm2-runtime start ./pm2.config.cjs

#------------------
# **** II. 2) DSL
#------------------

install-prod:
	CI=1 $(PM) install --production

prisma-studio:
	bunx prisma studio

initialize-db:
	@{ \
		mkdir -p prisma/migrations/0_init 2>/dev/null; \
		rm -f $(INIT_MIGRATION_TMP_FILE); \
		if [ -e "prisma/migrations/0_init/migration.sql" ]; then \
			: ; \
		else \
			bunx prisma migrate diff \
				--from-empty \
				--to-schema-datamodel prisma/schema.prisma \
				--script > prisma/migrations/0_init/migration.sql 2>/dev/null && \
			echo 'create extension if not exists pgcrypto;' | cat - prisma/migrations/0_init/migration.sql > $(INIT_MIGRATION_TMP_FILE) && \
			rm -f prisma/migrations/0_init/migration.sql && \
			mv $(INIT_MIGRATION_TMP_FILE) prisma/migrations/0_init/migration.sql && \
			bunx prisma migrate deploy; \
		fi \
	}

initialize-env:
	[ -e "$(ENV_FILE)" ] || cp "$(ENV_EXAMPLE)" "$(ENV_FILE)"
	[ -e "$(ENV_TEST_FILE)" ] || cp "$(ENV_TEST_EXAMPLE)" "$(ENV_TEST_FILE)"

initialize: install initialize-env
	$(PM) run codegen
	bunx prisma generate

initialize-prod: install-prod initialize-env
	$(PM) run codegen
	bunx prisma generate

clean: wipe-wireit
	$(PM) rimraf $(DIST)
	$(PM) rimraf $(TYPECHECK_DIST)
	$(PM) rimraf $(ESLINT_CACHE)

fclean: clean
	$(PM) rimraf node_modules

re: fclean initialize build

#---------------------
# **** II. 3) Docker
#---------------------

compose-watch:
	docker compose watch

compose-up:
	docker compose up

compose-down:
	docker compose down

compose-build:
	docker compose build

compose-up-detached:
	docker compose up -d

docker-bot-app-entrypoint: initialize-prod fast-build pm2-start
