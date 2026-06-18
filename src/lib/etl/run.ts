import { runEtl } from "./importer";

runEtl()
  .then(() => {
    console.log("ETL finalizado com sucesso.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("ETL falhou:", err);
    process.exit(1);
  });
