
class CSVBuilder {
    private lines: string[];

    constructor() {
        this.lines = [];
    }

    add_row(row: any[]) {
        this.lines.push(row.map(CSVBuilder.format_cell).join(","));
    }

    get_content(): string {
        return this.lines.join("\n");
    }

    private static format_cell(text: any): string {
        if (text == null || text === undefined) {
            text = "";
        }
        else {
            text = String(text);
        }
        // No escaping needed.
        if (text.match(/["\n]/) == null) {
            return text;
        }
        return '"' + text.replace('"', '""') + '"';
    }
}

export default CSVBuilder;