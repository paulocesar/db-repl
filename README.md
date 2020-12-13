# db-repl

- run queries in MSSQL, PostgreSQL, MySQL, MariaDB, SQLite3
- visualize columns on terminals
- format to CSV, Markdown, JSON

Instructions
- set database names with `#` (example: `#db1 SELECT * FROM tbl1`)
- set formats with `@` (example: `@csv SELECT * FROM tbl1`)
- available formats `@visual`, `@csv`, `@md`, `@json`

## Installation
- install `npm install -g db-repl`
- create an array of knex configs in your `$HOME/.db-repl.js` please visit https://knexjs.org
- exit: `CTRC-C` x 2

## Examples

setup:
```bash
$> echo "module.exports = [{client:'mssql',connection:{host:'127.0.0.1',user:'your_database_user',password:'your_database_password',database:'myapp_test'}}];" > $HOME/.db-repl.js
$> db-repl
```

set db and run query:
```bash
ø> #your_database_user SELECT 1 AS a, 2 AS b
=== your_database_user ===

 # a  b
-- -- --
#0 1  2
true
```

split columns in `@visual` mode:
```
ø> @visual SELECT 1 test1, 2 test2, 3 test3, 4 test4, 5 test5, 6 test6, 7 test7, 8 test8, 9 test9, 10 test10, 11 test11, 12 test12, 13 test13, 14 test14, 15 test15
=== db2 ===

 # test1 test2 test3 test4 test5 test6 test7 test8 test9 test10
-- ----- ----- ----- ----- ----- ----- ----- ----- ----- ------
#0 1     2     3     4     5     6     7     8     9     10


 # test11 test12 test13 test14 test15
-- ------ ------ ------ ------ ------
#0 11     12     13     14     15
true
```

set CSV and run query:
```
ø> @csv SELECT 1 AS a, 2 AS b
Changing currentFormat to csv
=== your_database_user ===

"a","b"
"1","2"
true
```

set Markdown and run query;
```
ø> @md SELECT 1 AS a, 2 AS b
Changing currentFormat to md
### your_database_user

a | b
:-- | :--
1 | 2
true
```

run multiple queries (split by `;`)
```
ø> SELECT 1 AS a, 2 AS b; SELECT 4 AS c, 5 AS d
### your_database_user

a | b
:-- | :--
1 | 2
### your_database_user

c | d
:-- | :--
4 | 5
true
```

change db and format
```
ø> #db2
Changing currentDb to db2
true

ø> @json
Changing currentFormat to json
true
```

select with `@json` format
```
ø> SELECT 1 AS a, 2 AS b
Changing currentFormat to json
/* === db2 === */
[
    {
        "a": 1,
        "b": 2
    }
]
true
```
