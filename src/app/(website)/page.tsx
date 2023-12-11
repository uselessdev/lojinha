export default function Home() {
  return (
    <section className="grid min-h-[calc(100dvh-160px)] place-items-center justify-start">
      <div className="w-full max-w-2xl space-y-4 [text-wrap:balance]">
        <h2 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Desenvolva seu e-commerce de forma rápida.
        </h2>

        <p className="text-muted-foreground/70 text-xl">
          Lojinha é uma plataforma de e-commerce{" "}
          <strong className="text-muted-foreground font-medium underline decoration-wavy">
            headless
          </strong>
          , nós fornecemos a plataforma e você se preocupa com a experiência do
          seu cliente.
        </p>
      </div>
    </section>
  );
}
