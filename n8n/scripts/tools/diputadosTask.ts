import puppeteer from "puppeteer";

interface leyData {
    num: string;
    nombre: string;
    creacionDOF: Date | string;
    ultimaReformaDOF: Date | string | null;
    pdfUrl: string;
    comentarios: string;
}

export class DiputadosTask {
    static jobName = "sync_leyes";
    static jobLabel = "Sincronizacion de leyes";

    static readonly url = "https://www.diputados.gob.mx/LeyesBiblio/index.htm";
    private static readonly fontSelector: string = "font";
    private static readonly DOF_UTC_HOUR = 6; // Midnight in GMT-6 equals 06:00 UTC

    private static parseDofDateToUtc(dateText: string): Date {
        const match = dateText.trim().match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (!match) {
            throw new Error(`Invalid DOF date format: ${dateText}`);
        }

        const day = Number(match[1]);
        const month = Number(match[2]);
        const year = Number(match[3]);
        const utcDate = new Date(Date.UTC(year, month - 1, day, this.DOF_UTC_HOUR, 0, 0, 0));

        if (
            utcDate.getUTCFullYear() !== year ||
            utcDate.getUTCMonth() !== month - 1 ||
            utcDate.getUTCDate() !== day
        ) {
            throw new Error(`Invalid DOF calendar date: ${dateText}`);
        }

        return utcDate;
    }

    static async run() {
        const leyes = await this.scrapeLeyes();
        
        return leyes;
    }

    private static async scrapeLeyes(): Promise<leyData[]> {
        const browser = await puppeteer.launch({ 
            headless: "shell",
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Prevents crashes out of low shared memory inside containers
                '--disable-gpu'
            ]
        });
        const page = await browser.newPage();
        await page.goto(this.url, { waitUntil: "networkidle2" });
        page.on("console", (msg) => {
            console.log("PAGE LOG:", msg.text());
        });

        page.on("error", (err) => {
            console.error("PAGE ERROR:", err);
        });

        let leyes = await page.evaluate(() => {
            let rows = document.querySelectorAll("table:not([class^=gs]) tr");
            let leyes: leyData[] = [];
            const fontSelector = "font" as string;
            for (let [rowIndex, row] of rows.entries()) {
                if (rowIndex === 0) continue; // Skip header row
                let ley: leyData = {} as leyData;
                let cells = row.querySelectorAll("td");

                if (cells.length < 4) continue; // Skip rows that don't have enough cells

                ley.num = cells[0].querySelector<Element>(fontSelector)?.textContent?.replace(/[\n\t]+/g, ' ').trim() || "";

                for (let [titleFontIndex, titleFont] of cells[1].querySelectorAll<Element>(fontSelector).entries()) {
                    if (titleFontIndex === 0) {
                        ley.nombre = titleFont.textContent?.replace(/[\n\t]+/g, ' ').trim() || "";
                    }
                    if (titleFont.textContent?.match(/DOF/)) {
                        ley.creacionDOF = titleFont.textContent.replace(/[\n\t]+/g, ' ').replace(/DOF/, "").trim();
                    }
                    if (!ley.comentarios) ley.comentarios = "";
                    ley.comentarios += titleFont.textContent?.replace(/[\n\t]+/g, ' ').trim() + " ";
                }
                ley.comentarios = ley.comentarios.trim();

                if (cells[2].querySelector<Element>(fontSelector)?.textContent?.match(/DOF/)) {
                    ley.ultimaReformaDOF = cells[2].querySelector<Element>(fontSelector)?.textContent.replace(/[\n\t]+/g, ' ').replace(/DOF/, "").trim() || "";
                } else {
                    ley.ultimaReformaDOF = null;
                }

                for (let link of cells[3].querySelectorAll("a")) {
                    if (link.href.match(/pdf/i)) {
                        ley.pdfUrl = link.href;
                    }
                }
                leyes.push(ley);
            }
            return leyes;
        });

        for (let ley of leyes) {
            try {
                ley.creacionDOF = this.parseDofDateToUtc(ley.creacionDOF as string);
                ley.ultimaReformaDOF = ley.ultimaReformaDOF ? this.parseDofDateToUtc(ley.ultimaReformaDOF as string) : null;
            } catch (error) {}
            if (ley.ultimaReformaDOF) {
                try {
                    ley.ultimaReformaDOF = this.parseDofDateToUtc(ley.ultimaReformaDOF as string);
                } catch (error) {}
            }
        }

        await browser.close();
        return leyes;
    }
}