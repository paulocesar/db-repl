const os = require('os');
const path = require('path');
const repl = require('repl');
const knex = require('knex');
const { callbackify } = require('util');
const dbConfigs = [].concat(require(path.resolve(os.homedir(), '.knex-repl')));

class KnexRunner {
    constructor(dbConfigs) {
        this.dbs = [ ];
        this.dbsByName = { };
        this.currentDb = '';

        for (const s of dbConfigs) {
            const db = knex(s);
            this.dbs.push(db);
            this.dbsByName[s.connection.database] = db;
        }
    }

    startRepl() {
        const evalCmd = callbackify(this.eval.bind(this))
        const completer = callbackify(this.completer.bind(this))

        this.repl = repl.start({
            prompt: 'ø> ',
            eval: (cmd, context, filename, callback) =>
                evalCmd(cmd, context, filename, callback),
            completer: (line, callback) => completer(line, callback)
        });
    }

    async eval(rawCommand) {
        const commands = rawCommand.trim().split(/\s*;\s*/);

        const queries = [ ];

        const extractFirstTerm = (cmd, field, match) => {
            if (cmd[0] !== match) { return cmd; }

            const terms = cmd.split(/\s+/);
            const newTerm = terms.shift().replace(match, '');
            const oldTerm = this[field];

            if (newTerm != oldTerm) {
                console.log(`Changing ${field} to ${newTerm}`);
                this[field] = newTerm;
            }

            return terms.join(' ');
        }

        for (const cmd of commands) {
            let query = extractFirstTerm(cmd, 'currentFormat', '@');
            query = extractFirstTerm(query, 'currentDb', '#');

            // if format is after db definition
            query = extractFirstTerm(query, 'currentFormat', '@');

            if (!this.currentDb) {
                console.error('Please define a db with #');
                return false;
            }

            query = query.trim();

            if (!query) { continue; }

            queries.push({ dbName: this.currentDb, query });
        }

        for (const { dbName, query } of queries) {
            const db = this.dbsByName[dbName];

            try {
                const rows = await db.raw(query);
                console.log(this.format(dbName, rows).join('\n'));
            } catch(ex) {
                console.error(ex);
                return false;
            }
        }

        return true;
    }

    async completer(line) { return [ [ ], line ]; }

    format(title, results) {
        const formatByType = {
            json: (title, results) => this.toJson(title, results),
            md: (title, results) => this.toMarkdown(title, results),
            csv: (title, results) => this.toCsv(title, results),
            visual: (title, results) =>
                this.toVisualizationTable(title, results)
        };

        const fn = formatByType[this.currentFormat || 'visual'];

        return fn(title, results);
    }


    toJson(title, results) {
        const lines = [ ];
        if (title) { lines.push(`/* === ${title} === */`); }

        return lines.concat(JSON.stringify(results, null, 4).split('\n'));
    }

    toMarkdown(title, results) {
        const lines = [ ];
        if (title) {
            lines.push(`### ${title}`);
            lines.push('');
        }

        if (!lines.length) {
            lines.push('empty');
            return lines;
        }

        const keys = Object.keys(results[0]);
        lines.push(keys.join(' | '));

        const splitter = `:--${' | :--'.repeat(keys.length - 1)}`;
        lines.push(splitter);

        for (const r of results) {
            lines.push(Object.values(r).join(' | '));
        }

        return lines;
    }

    toCsv(title, results) {
        const lines = [ ];
        if (title) {
            lines.push(`=== ${title} ===`);
            lines.push('');
        }

        if (!results.length) { return lines; }

        function format(v) {
            const f = `${v}`.replace(/"/g, '');
            return `"${f}"`;
        }

        const keys = Object.keys(results[0]);
        lines.push(keys.map(format).join(','));

        for (const r of results) {
            lines.push(Object.values(r).map(format).join(','));
        }

        return lines;
    }

    toVisualizationTable(title, results) {
        let displayLines = [ ];

        if (title) {
            displayLines = [ `=== ${title} ===`, '' ];
        }

        if (!results.length) {
            displayLines.push('(empty)');
            return displayLines;
        }

        const countLen = `${results.length}`.length;
        const cols = [ ];

        for (const col of Object.keys(results[0])) {
            let maxLen = col.length;
            for (const r of results) {
                const colLen = `${r[col]}`.length + 1;
                if (colLen > maxLen) { maxLen = colLen };
            }

            cols.push({ name: col, length: maxLen });
        }

        const width = process.stdout.columns - 1;
        let lines = [ ];
        for (const col of cols) {
            if (lines[0] && lines[0].length + col.length > width) {
                displayLines = displayLines.concat(lines).concat([ '', '' ]);
                lines = [ ];
            }

            if (!lines[0]) {
                lines[0] = `${' '.repeat(countLen)}# `;
                lines[1] = `${'-'.repeat(countLen + 1)} `;

                for (const idx in results) {
                    const repeatCol = countLen - (idx.toString().length);
                    lines[Number(idx) + 2] = `${' '.repeat(repeatCol)}#${idx} `
                }
            }

            lines[0] +=
                `${col.name}${' '.repeat(col.length - col.name.length)} `;
            lines[1] += `${'-'.repeat(col.length)} `;
            for (const idx in results) {
                const r = results[idx];
                const value = `${r[col.name]}`;
                const whitespace = ' '.repeat(col.length - value.length + 1);
                lines[Number(idx) + 2] += `${value}${whitespace}`;
            }
        }

        if (lines[0] && lines[0].length) {
            displayLines = displayLines.concat(lines);
        }

        return displayLines;
    }
}

(async function main() {
    const sqlRunner = new KnexRunner(dbConfigs);

    sqlRunner.startRepl();
})();

