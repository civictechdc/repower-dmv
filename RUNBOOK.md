# Database operations

**Note:** When exporting and importing tables you'll need to make sure that any relationship tables are also handled.

## Access a sqlite console when SSHed into a deployed instance

**Note:** The reason this is different from `npm db:console` is that the sqlite database file is stored at `data/sqlite.db` in deployed environments instead of `prisma/data.db` locally.

```
database-cli
```

## Exporting data from sqlite into a csv file

```
npm run db:console
.mode csv
.output prisma/data/file.csv
select * from <table>;
```

## Importing data from csv into sqlite

```
npm run db:console
.mode csv
.import prisma/data/file.csv <table>
```

# Fly.io / devops

## Get a shell into a new shell-specific instance

```
fly console -a repower-dmv-staging
```

## Get a shell into a running instance

**Note:** This will take up resources for a live instance that is also serving web traffic. If you do heavy operations or break something it will impact availability of the webapp.

```
fly ssh console -a repower-dmv-staging
```
