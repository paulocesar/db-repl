# knex-repl

## Installation
- install `npm install -g knex-repl`
- create an array of knex configs in your `$HOME/.knex-repl.js`

## Examples
```bash
$> echo "module.exports = [{client:'mssql',connection:{host:'127.0.0.1',user:'your_database_user',password:'your_database_password',database:'myapp_test'}}];" > $HOME/.knex-repl.js

$> knext-repl

ø> #your_database_user SELECT 1 AS a, 2 AS b
=== CentralDB ===

 # a  b
-- -- --
#0 1  2
true

ø> @csv SELECT 1 AS a, 2 AS b
Changing currentFormat to csv
=== CentralDB ===

"a","b"
"1","2"
true

ø> @md SELECT 1 AS a, 2 AS b
Changing currentFormat to md
### CentralDB

a | b
:-- | :--
1 | 2
true

ø> SELECT 1 AS a, 2 AS b; SELECT 4 AS c, 5 AS d
### CentralDB

a | b
:-- | :--
1 | 2
### CentralDB

c | d
:-- | :--
4 | 5
true

ø> #db2
Changing currentDb to db2
true

ø> @json
Changing currentFormat to json
true

ø> SELECT 1 AS a, 2 AS b
Changing currentFormat to json
/* === CentralDB === */
[
    {
        "a": 1,
        "b": 2
    }
]
true

ø> @visual SELECT 1 test1, 2 test2, 3 test3, 4 test4, 5 test5, 6 test6, 7 test7, 8 test8, 9 test9, 10 test10, 11 test11, 12 test12, 13 test13, 14 test14, 15 test15
=== CentralDB ===

 # test1 test2 test3 test4 test5 test6 test7 test8 test9 test10
-- ----- ----- ----- ----- ----- ----- ----- ----- ----- ------
#0 1     2     3     4     5     6     7     8     9     10


 # test11 test12 test13 test14 test15
-- ------ ------ ------ ------ ------
#0 11     12     13     14     15
true
```