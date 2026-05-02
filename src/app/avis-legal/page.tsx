import React from "react";

export default function AvisLegal() {
  return (
    <main className="min-h-screen pt-40 pb-20 px-6 md:px-12 bg-black-deep text-white-pure">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl md:text-6xl font-bold tracking-widest md:tracking-widest-xl uppercase mb-8 border-b border-white-pure/10 pb-6">
          Avís Legal
        </h1>
        
        <div className="space-y-12 text-sm md:text-base text-gray-400 leading-loose tracking-widest uppercase">
          <section>
            <h2 className="text-white-pure font-bold mb-4">1. Dades Identificatives</h2>
            <p>
              En compliment amb el deure d'informació recollit a l'article 10 de la Llei 34/2002, d'11 de juliol, de Serveis de la Societat de la Informació i del Comerç Electrònic, s'indiquen les següents dades:
            </p>
            <ul className="mt-4 space-y-2 list-none">
              <li>TITULAR: AYOUB LOUAH RAHROUH</li>
              <li>UBICACIÓ: GRANOLLERS, BARCELONA</li>
              <li>EMAIL: AYOUB.LOUAH10@GMAIL.COM</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white-pure font-bold mb-4">2. Usuaris</h2>
            <p>
              L'accés i/o ús d'aquest portal de DJ POSAXA atribueix la condició d'USUARI, que accepta, des de dit accés i/o ús, les Condicions Generals d'Ús aquí reflectides.
            </p>
          </section>

          <section>
            <h2 className="text-white-pure font-bold mb-4">3. Propietat Intel·lectual</h2>
            <p>
              DJ POSAXA per si o com a cessionari, és titular de tots els drets de propietat intel·lectual i industrial de la seva pàgina web, així com dels elements continguts en la mateixa (a títol enunciatiu, imatges, so, àudio, vídeo o textos; marques o logotips, combinacions de colors, estructura i disseny).
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
