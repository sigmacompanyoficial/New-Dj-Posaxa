import React from "react";

export default function CookiesPage() {
  return (
    <main className="min-h-screen pt-40 pb-20 px-6 md:px-12 bg-black-deep text-white-pure">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl md:text-6xl font-bold tracking-widest md:tracking-widest-xl uppercase mb-8 border-b border-white-pure/10 pb-6">
          Política de Cookies
        </h1>
        
        <div className="space-y-12 text-sm md:text-base text-gray-400 leading-loose tracking-widest uppercase">
          <section>
            <h2 className="text-white-pure font-bold mb-4">Què són les cookies?</h2>
            <p>
              Una cookie és un fitxer que es descarrega al seu ordinador en accedir a determinades pàgines web. Les cookies permeten a una pàgina web, entre altres coses, emmagatzemar i recuperar informació sobre els hàbits de navegació d'un usuari.
            </p>
          </section>

          <section>
            <h2 className="text-white-pure font-bold mb-4">Cookies utilitzades</h2>
            <p>
              Aquest lloc web utilitza cookies tècniques per al correcte funcionament de la navegació i cookies d'anàlisi per entendre com els usuaris interactuen amb el contingut.
            </p>
          </section>

          <section>
            <h2 className="text-white-pure font-bold mb-4">Desactivació</h2>
            <p>
              Vostè pot permetre, bloquejar o eliminar les cookies instal·lades en el seu equip mitjançant la configuració de les opcions del navegador instal·lat al seu ordinador.
            </p>
          </section>

          <div className="pt-12 border-t border-white-pure/10">
            <p className="text-[10px] text-gray-600">
              ÚLTIMA ACTUALITZACIÓ: MAIG 2026
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
