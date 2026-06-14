import net from "net";

const port = Number(process.env.PORT || 3000);

const probe = net.createServer();

probe.once("error", (err) => {
  if (err && "code" in err && err.code === "EADDRINUSE") {
    console.error(
      "\n[thecelltime] Stop the dev server before running npm run build.",
      "\nRun: close the terminal with `npm run dev`, or stop the process on port 3000.\n"
    );
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});

probe.once("listening", () => {
  probe.close();
});

probe.listen(port);
