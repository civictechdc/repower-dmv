# Exporting data from sqlite into a csv file

```
npm run db:console
.mode csv
.output prisma/data/file.csv
select * from <table>;
```

# Importing data from csv into sqlite

```
npm run db:console
.mode csv
.import prisma/data/file.csv <table>
```

**Note:** When exporting and importing tables you'll need to make sure that any relationship tables are also handled.
