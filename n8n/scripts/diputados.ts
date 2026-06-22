import { DiputadosTask } from "./tools/diputadosTask";

async function main() {
    const leyes = await DiputadosTask.run();
    console.log(JSON.stringify(leyes));
}

main().catch((err) => {
    console.error("Error running the script:", err);
    process.exit(1);
});