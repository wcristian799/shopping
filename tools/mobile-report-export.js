const fs = require("fs");
const path = require("path");
const { PassThrough } = require("stream");
const { gerarRelatorioPeriodo } = require("../mob/AchadosPerdidosMobileBack/dist/controllers/relatorioController");

function createResponse(outputPath) {
  const chunks = [];
  const stream = new PassThrough();

  stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  stream.on("finish", () => {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.concat(chunks));
  });

  stream.statusCode = 200;
  stream.headers = {};
  stream.locals = {};
  stream.body = null;
  stream.setHeader = function setHeader(name, value) {
    this.headers[name] = value;
  };
  stream.status = function status(code) {
    this.statusCode = code;
    return this;
  };
  stream.json = function json(body) {
    this.body = body;
    return this;
  };

  return stream;
}

async function main() {
  const [
    dataInicio = "2000-01-01",
    dataFim = "2100-12-31",
    tipo = "TODOS",
    formato = "excel",
    outputPath = path.resolve(__dirname, "out", `mobile-${formato}.${formato === "excel" ? "xlsx" : "pdf"}`),
  ] = process.argv.slice(2);

  const req = {
    query: {
      dataInicio,
      dataFim,
      tipo,
      formato,
    },
  };

  const res = createResponse(outputPath);
  await gerarRelatorioPeriodo(req, res);

  if (res.statusCode >= 400) {
    console.error(JSON.stringify({ statusCode: res.statusCode, body: res.body }, null, 2));
    process.exit(1);
  }

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Timeout aguardando escrita do arquivo")), 15000);
    const done = () => {
      clearTimeout(timeout);
      resolve();
    };

    if (fs.existsSync(outputPath)) {
      done();
      return;
    }

    const interval = setInterval(() => {
      if (fs.existsSync(outputPath)) {
        clearInterval(interval);
        done();
      }
    }, 100);
  });

  console.log(JSON.stringify({ outputPath, headers: res.headers }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
